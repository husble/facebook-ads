import { Badge, Button, Drawer, Input, Select, Switch, Table, Tooltip, message } from 'antd';
import React, { ChangeEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import axios from 'axios';

import { LINK_DATAS, PAGES } from '#/ultils/config';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNTS, GET_PIXELS, GET_TEMPLATE_ADS_COPY, GET_TEMPLATE_ADS_COPY_PK } from '#/graphql/query';
import moment from 'moment';
import { ChromeOutlined, CopyTwoTone } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';

import FB from '#/app/api/fb';
import {addNameVideoCreator, FbPixel, getCreatorName, getRecordId, PAYLOAD_SELECT, Product, STORES, TARGET, TYPES, VIDEO} from '#/ultils';
import Client from '#/ultils/client';

import Target from "#/components/Target"

import Styled from "./Style"
import Image from 'next/image';
import Video from '#/components/Video'
import { UserContext } from '../UserContext';

const {Option} = Select

type Props = {
  open: boolean;
  setOpen: Function;
  ads: Product[];
  storeId: number;
  setSelecteds: Function;
}

type Account = {
  id: string;
  name: string;
}

type Reponse = {
  msg: string;
  label: string;
  id?: string;
  code: number;
}

interface PayloadAdsetName {
  countries: string[];
  age_min: number;
  age_max: number;
  gender: string;
}

interface PayloadAdName extends PayloadAdsetName {
  name_ads_account: string;
  template_adset_name: string;
  tab: string;
  vc_name: string;
  template_type?: string;
}

const TAG_LABEL = ["Clone", "New", "Trend", "Scale"]

const createAdSetName = (payload: PayloadAdsetName): string => {
  const {countries, age_max, age_min, gender} = payload

  let gender_value = "All"
  switch (gender) {
    case "Women":
      gender_value = "W"
      break

    case "Men":
      gender_value = "M"
      break

    default: break
  }
  let name = `${countries.join("-")}/${gender_value}${age_min}-${age_max}`

  return name
}

function Index({ open, setOpen, ads, storeId, setSelecteds }: Props) {
  const [adsPreview, setAdsPreview] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreatePost, setIsCreatePost] = useState<Boolean>(false)
  const [isCreateCamp, setIsCreateCamp] = useState<Boolean>(false)
  const [templateType, setProductType] = useState<string>('image');
  const [expendRows, setExpendRows] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("")
  const [view_record, setViewRecord] = useState<string>("")
  const [target, setTarget] = useState<TARGET>({
    ad_set_daily_budget: 20,
    age_min: 30,
    age_max: 65,
    countries: ["US"],
    flexiable: "No",
    gender: "All"
  })
  const account = useRef<string>("")
  const page = useRef<string>("")
  const name_user = useRef<string>("")
  const template = useRef<string>("")
  const templateAds = useRef([])
  const fbPixels = useRef([])
  const pixel = useRef<string>("")
  useQuery(GET_ACCOUNTS, {
    variables: {
      where: {}
    },
    onCompleted: ({accounts}) => {
      const mappingAccounts = accounts.map((account: Account) => {
        const {id, name} = account
        return {
          name,
          id: `${name}=${id}`
        }
      })
      setAccounts(mappingAccounts)
    }
  })
  
  const getTemplateMessage = async (value?: string ) => {
    const {data: {template_ads_copy_by_pk}} = await Client.query({
      query: GET_TEMPLATE_ADS_COPY_PK,
      variables: {
        name: value || template.current
      }
    })

    const message = template_ads_copy_by_pk?.message || ""

    return message
  }

  useQuery(GET_TEMPLATE_ADS_COPY, {
    variables: {
      where: {}
    },
    onCompleted: ({ template_ads_copy }) => {
      templateAds.current = template_ads_copy;
    }
  });

  useQuery(GET_PIXELS, {
    variables: {
      where: {}
    },
    onCompleted: ({ fb_pixels }) => {
      fbPixels.current = fb_pixels;
      const pixelDefault = () => {
        const fb_pixel = fb_pixels.find((fb_pixel: FbPixel) => fb_pixel.store_id === storeId)

        pixel.current = fb_pixel
      }

      pixelDefault()
    }
  });

  const createPayloadAdset = (ad: Product): PayloadAdsetName => {
    const {countries, age_max, age_min, gender} = ad

    return {
      age_max: age_max || target.age_max,
      age_min: age_min || target.age_min,
      countries: countries || target.countries,
      gender: gender || target.gender
    }
  }

  const createNameAdWhenChangeCountries = (countries: string[], name_ads_account: string): string => {
    const length = countries.length
    let newName = name_ads_account

    switch (length) {
      case 1:
        newName = name_ads_account.replace(`[${STORES[storeId]} ALL`, `[${STORES[storeId]}`)
        break

      case 2:
      case 3:
      case 4:
        if (name_ads_account.indexOf(`[${STORES[storeId]} ALL`) === -1) {
          newName = name_ads_account.replace(`[${STORES[storeId]}`, `[${STORES[storeId]} ALL`)
        }
        break

      default: break
    }

    return newName
  }

  const checkFulFillDataCreatePost = (): Boolean => {
    if (account.current && account.current !== "***" && page.current && name_user.current && name_user.current !== "**") {
      setIsCreatePost(true)
      return true
    }

    setIsCreatePost(false)

    return false
  }

  const checkFulFillDataCreateCamp = (ads: Product[], type?: string) => {
    const check = checkFulFillDataCreatePost()
    if (check && (type || templateType).indexOf("creative") !== -1) {
      setIsCreateCamp(true)

      return
    } 

    if (!check) {
      setIsCreateCamp(false)

      return
    }

    for (const ad of ads) {
      if (!ad["post_id"]) {
        setIsCreateCamp(false)

        return
      }
    }

    setIsCreateCamp(true)
  }

  function resetTabInAdsAccountName(tab: string, name_ads_account: string): string {
    if (!tab) return name_ads_account

    return name_ads_account.replace(`-${tab}`, "")
  }

  function replaceTabInAdsAccountName(tab: string, name_ads_account: string): string {
    if (!tab) return name_ads_account

    return name_ads_account + "-" + tab
  }

  useEffect(() => {
    async function mappingData() {
      setLoading(true);
      const results: any = [];
      const message = await getTemplateMessage()
      const expendRows = []

      for await (const ad of ads) {
        const { name_ads_account, template_type } = ad;
        const date = `0${new Date().getDate()}`.slice(-2);
        const month = `0${new Date().getMonth() + 1}`.slice(-2);
        const year = `${new Date().getFullYear()}`.slice(-2);
        const tab = TAG_LABEL.find(label => name_ads_account.indexOf(`-${label}`) !== -1) || ""
        let new_name_ads_account: string = resetTabInAdsAccountName(tab, name_ads_account.replace(
          '*',
          `${date}-${month}-${year}`
        ))
        let data_video: any
        switch (templateType) {
          case "image":
            new_name_ads_account = new_name_ads_account.replace(/G00|G02/gi, 'G01') + "-Published Ads"
            break
  
          case "creative_image":
            new_name_ads_account = new_name_ads_account.replace(/G00|G02/gi, 'G01') + "-Created Ads"
            break
  
          case "video":
            new_name_ads_account = new_name_ads_account.replace(/G00|G01/gi, 'G02') + "-Published Ads"
            data_video = await getVideoByRecordId(ad)
            break
  
          case "creative_video":
            new_name_ads_account = new_name_ads_account.replace(/G00|G01/gi, 'G02') + "-Created Ads"
            data_video = await getVideoByRecordId(ad)
            break
  
          default: break
        }

        if (account.current) {
          const [name] = account.current.split("=")
          new_name_ads_account = new_name_ads_account.replace("***", name)
        }

        if (name_user.current) {
          new_name_ads_account = new_name_ads_account.replace("**", name_user.current)
        }
        const store_name = ad.store_2.shop
        const payLoadAdset = createPayloadAdset({...ad, name_ads_account: new_name_ads_account})
        const template_adset_name = createAdSetName(payLoadAdset)
        new_name_ads_account = updateNameAd({...payLoadAdset, name_ads_account: new_name_ads_account, template_adset_name, tab, vc_name: data_video?.vc_name, template_type: templateType})
        results.push({
          ...ad,
          key: ad.product_id,
          template_adset_name,
          name_ads_account: new_name_ads_account,
          template_account: account.current?.split("=")[0],
          template_user: name_user.current,
          body: `${message} \nCustomize yours: https://${store_name.replace("blithehub.myshopify.com", "wrappiness.co").replace(".myshopify", "")}/${LINK_DATAS[store_name].slice(0, 3)}-${ad.product_id}` || "",
          gender: target.gender,
          age_min: target.age_min,
          age_max: target.age_max,
          countries: target.countries,
          ad_set_daily_budget: target.ad_set_daily_budget,
          flexiable: target.flexiable,
          tab,
          ...data_video,
          mb_record_id: getRecordId(ad["tags"])
        });

        expendRows.push(ad.product_id)
      }
      if (showAll) {
        setExpendRows(expendRows)
      }
      checkFulFillDataCreateCamp(results, templateType)
      setAdsPreview(results);
      setLoading(false);
    }

    if (!open) return

    // setIsCreateCamp(false)
    setTitle("")
    mappingData();
  }, [ads, open]);

  const handleChangeUser = debounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      name_user.current = value
      const valueReplace = value || '**';
      const currentDatas: any = [...adsPreview];
      for (const ad of adsPreview) {
        const { key, name_ads_account, template_user } = ad;
        const dataWantToReplace = template_user || '**';
        const addUser = name_ads_account.replace(
          `-${dataWantToReplace}-`,
          `-${valueReplace}-`
        );
  
        const findIndex = currentDatas.findIndex(
          (data: Product) => data.key === key
        );
  
        currentDatas[findIndex] = {
          ...currentDatas[findIndex],
          template_user: valueReplace,
          name_ads_account: addUser
        };
      }
      checkFulFillDataCreateCamp(currentDatas)
      setAdsPreview(currentDatas);
    },
    200
  );

  const handleChangePostId = debounce((e: ChangeEvent<HTMLInputElement>, record: Product) => {
    const {key} = record;
    const {value} = e.target
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      post_id: value
    };

    checkFulFillDataCreateCamp(currentDatas)
    setAdsPreview(currentDatas)
  }, 500)

  const gotoPost = (post_id: string) => {
    if (templateType === "image") {
      window.open(`https://www.facebook.com/${page.current}/posts/${post_id}` , "_blank")
    } else {
      window.open(`https://www.facebook.com/${post_id}` , "_blank")
    }
  }

  const handleChangeAdAccount = debounce((e :ChangeEvent<HTMLTextAreaElement>, record: Product) => {
    const { key } = record;
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      name_ads_account: e.target.value
    };
    setAdsPreview(currentDatas);
  }, 1000)

  const removeCampaign = (record: Product) => {
    const newAdPreviews = [...adsPreview]
    const index = newAdPreviews.findIndex(ad => ad.product_id === record.product_id)
    newAdPreviews.splice(index, 1)

    const newAds = [...ads]
    const indexAds = newAds.findIndex(ad => ad.product_id === record.product_id)
    newAds.splice(indexAds, 1)

    setSelecteds(newAds)
    setAdsPreview(newAdPreviews)
  }

  const viewRecord = async (tags: string, product_id: string) => {
    const record_id = getRecordId(tags) || ""
    try {
      setViewRecord(product_id)
      const {data: {record_url}} = await axios({
        method: "GET",
        url: process.env.FACEBOOK_API + "/larksuite/record/" + record_id
      })
      window.open(record_url, "_blank")
      setViewRecord("")
    } catch (error) {
      setViewRecord("")
      message.error("Error !!!, please try again or contact admin")
    }
  }

  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      width: 350,
      render: (title: string, row: Product) => {
        const no_video_url = !row["video_url"] && templateType.indexOf("video") !== -1
        const {image_url, link} = row
        return (
          no_video_url ? <Badge.Ribbon color='red' placement='start' text="No Video">
            <div className='d-flex items-center gap-2'>
              {(image_url && image_url.indexOf("http") !== -1) ? <Image
                src={image_url}
                alt='image'
                width={80}
                height={80}
              /> : null}
              <a target="_blank" href={`${link}`}>
                {title}
              </a>
            </div>
          </Badge.Ribbon> : (
            <div className='d-flex items-center gap-2'>
              {(image_url && image_url.indexOf("http") !== -1) ? <Image
                src={image_url}
                alt='image'
                width={80}
                height={80}
              /> : null}
              <a target="_blank" href={`${link}`}>
                {title}
              </a>
            </div>
          )
        );
      }
    },
    {
      title: 'Camp Name',
      key: 'name_ads_account',
      dataIndex: 'name_ads_account',
      render: (name_ads_account: string, record: Product) => (
        <>
          {record.msg?.code ? <span className={`${record.msg?.code === 200 ? "msg_success" : "msg_fail"}`}>* {record.msg.title}</span> : null}
          <TextArea onChange={(e) => handleChangeAdAccount(e, record)} key={name_ads_account} defaultValue={name_ads_account} />
        </>
      )
    },
    {
      title: 'Post Id',
      key: 'post_id',
      dataIndex: 'post_id',
      render: (post_id: string, row: Product) => {
        if (templateType.indexOf("creative") === -1) {
          return (
            <div style={{display: 'flex', gap: 10}}>
              <Input allowClear onChange={(e) => handleChangePostId(e, row)} key={post_id} defaultValue={post_id} />
              {post_id ? (
                  <Tooltip title="Copy">
                    <CopyTwoTone onClick={() => navigator.clipboard.writeText(post_id)} />
                  </Tooltip>
                ) : ""}
              {post_id ? (
                <Tooltip title="Go to post">
                  <ChromeOutlined color='#1677ff' onClick={() => gotoPost(post_id)} />
                </Tooltip>
              ) : ""}
            </div>
          );
        }

        return null
      },
      width: 200
    },
    {
      title: "",
      key: "remove",
      dataIndex: "remove",
      width: 50,
      render: (_: any, row: Product) => (
        <Tooltip title="Remove this campaign">
          <span onClick={() => removeCampaign(row)} className='cursor-pointer text-red-500'>x</span>
        </Tooltip>
      )
    },
    {
      title: '',
      key: "record",
      render: (_: any, row: Product) => <Button loading={view_record === row["product_id"]} onClick={() => viewRecord(row["tags"], row["product_id"])} type='dashed'>View Record</Button>,
      width: 200
    }
  ];

  const getDataCamps = async () => {
    const store_name = adsPreview[0].store_2.shop
    const time_start = `${moment().format('MM/DD/YYYY')} 00:00`;
    const result = adsPreview.map((d: any) => ({
      ['Ad Name']: d.template_user,
      ['Body']: d.body,
      ['Conversion Tracking Pixels']: d.conversion_tracking_pixels,
      ['Link']: `https://${store_name.replace("blithehub.myshopify.com", "wrappiness.co").replace(".myshopify", "")}/${LINK_DATAS[store_name].slice(0, 3)}-${d.product_id}`,
      ["Pixel_Id"]: pixel.current.split("=")[0],
      ["Instagram_Id"]: pixel.current.split("=")[1],
      ['Link Object ID']: page.current,
      ['Video ID']: templateType === 'video' ? d.image_video : d.video_id,
      ['Ad Set Daily Budget']: d.ad_set_daily_budget,
      ['Ad Set Name']: d.ad_set_name,
      ["Flexible Inclusions"]: d.flexiable,
      ['Age Max']: d.age_max,
      ['Age Min']: d.age_min,
      ['Countries']: d.countries,
      ['Gender']: d.gender,
      ['Optimized Conversion Tracking Pixels']: d.optimized_conversion_tracking_pixels,
      ['Optimized Event']: d.optimized_event,
      ['Campaign Name']: d.name_ads_account,
      ['Campaign Start Time']: time_start,
      ['Campaign Status']: d.campaign_status,
      ['Ad Account Id']: `act_${account.current.split("=")[1]}`,
      ["Image Url"]: d.image_url,
      ["Video Url"]: d.video_url,
      ["Customize Link"]: d.customize_link,
      ["Post Id"]: d.post_id,
      ["Record Id"]: d.mb_record_id,
      ["Product Id"]: d.product_id,
      ["Video Name"]: d.video_name,
    }));

    const removeKeyFromObject = (obj: any, type: string) => {
      if (type === 'image') {
        const {
          'Video File Name': videoFileName,
          'Video ID': videoId,
          ...rest
        } = obj;
        return { ...rest };
      } else {
        const { 'Link Description': linkDescription, ...rest } = obj;
        return { ...rest };
      }
    };

    const dataTemplates = result.map((obj: any) =>
      removeKeyFromObject(obj, templateType)
    );

    return dataTemplates;
  };

  const handleExportCamp = async () => {
    try {
      setLoading(true);

      const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.csv';
      const dataTemplates = await getDataCamps();
      const uuid = Math.random();
      const ws = XLSX.utils.json_to_sheet(dataTemplates);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, `ads-${uuid}` + fileExtension);

      message.success('Export successfull !!!');
      setLoading(false);
    } catch (error) {
      message.error('Export error !!!');
      setLoading(false);
    }
  };

  async function getVideoByRecordId(ad: Product) {
    const {tags, video_url, video_record_id, vc_name: vc_name_data} = ad
    if (video_url) return {
      video_url,
      video_record_id: "",
      vc_name: vc_name_data,
      list_video: []
    }
    
    const record_id = video_record_id || getRecordId(tags)

    const {video_url: new_video_url, list_video, vc_name, video_name} = await getLinkVideoByRecordID(record_id)
    return {
      video_url: new_video_url,
      vc_name,
      video_record_id: record_id,
      list_video,
      video_name
    }
  } 

  const handleChangeTemplateType = async (type: string) => {
    setLoading(true)
    const newDatas = adsPreview.map(async (ad: Product) => {
      const { name_ads_account, vc_name } = ad;
      let new_name_ads_account = name_ads_account;
      let data_video: any = {
        vc_name: "",
        video_url: "",
        old_vc_name: vc_name,
        video_name: ""
      }
      switch (type) {
        case "image":
          new_name_ads_account = new_name_ads_account.replace(/G00|G02/gi, 'G01').replace(/Created Ads|Published Ads/gi, "Published Ads")
          break

        case "creative_image":
          new_name_ads_account = new_name_ads_account.replace(/G00|G02/gi, 'G01').replace(/Created Ads|Published Ads/gi, "Created Ads")
          break

        case "video":
          new_name_ads_account = new_name_ads_account.replace(/G00|G01/gi, 'G02').replace(/Created Ads|Published Ads/gi, "Published Ads")
          data_video = await getVideoByRecordId({...ad, video_url: ""})
          break

        case "creative_video":
          new_name_ads_account = new_name_ads_account.replace(/G00|G01/gi, 'G02').replace(/Created Ads|Published Ads/gi, "Created Ads")
          data_video = await getVideoByRecordId({...ad, video_url: ""})
          break

        default: break
      }
      return {
        ...ad,
        name_ads_account: addNameVideoCreator({old_vc_name: vc_name, vc_name: data_video?.vc_name, name_ads_account: new_name_ads_account, template_type: type}),
        template_type: type,
        ...data_video
      };
    });

    const newAdsPreview = await Promise.all(newDatas)
    setProductType(type);
    setAdsPreview(newAdsPreview);
    checkFulFillDataCreateCamp(newAdsPreview, type)
    setLoading(false)
  };

  const chooseAccount = (value: string) => {
    const [name] = value.split("=")
    account.current = value
    const currentDatas: any = [...adsPreview];

    for (const ad of adsPreview) {
      const valueReplace = name || '***';
      const { key, name_ads_account, template_account } = ad;
      const dataWantToReplace = template_account || '***';
      const addAccount = name_ads_account.replace(
        `-${dataWantToReplace}-`,
        `-${valueReplace}-`
      );
  
      const findIndex = currentDatas.findIndex(
        (data: Product) => data.key === key
      );
  
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        template_account: valueReplace,
        name_ads_account: addAccount
      };
    }
    checkFulFillDataCreateCamp(currentDatas)
    setAdsPreview(currentDatas);
  }

  const choosePage = (value: string) => {
    page.current = value
    checkFulFillDataCreateCamp(adsPreview)
  }

  const handleCreatePosts = async () => {
    try {
      setLoading(true);
      const dataTemplates = await getDataCamps();
      const {data: {postIds}} = await FB.createPost({
        templates: dataTemplates,
        page_id: page.current,
        type: templateType
      });
      let newAdsPreview = [...adsPreview]

      switch (templateType) {
        case "image":
          newAdsPreview = adsPreview.map((ad, index) => {
            return {
              ...ad,
              post_id: postIds[index].post_id.split("_")[1]
            }
          })
          break

        case "video":
          newAdsPreview = adsPreview.map((ad, index) => {
            return {
              ...ad,
              post_id: postIds[index].post_id
            }
          })
          break

        default: break
      }

      setIsCreateCamp(true)
      setAdsPreview(newAdsPreview)
      setLoading(false);
      message.success('Create Posts successfull !!!');
    } catch (error) {
      setIsCreateCamp(false)
      setLoading(false);
      message.error('Create Campaigns failed !!!');
    }
  }

  const handleCreateCamp = async () => {
    const mappingMsg = (datas: Reponse[]) => {
      if (datas.length == 0) {
        const newAdPreviews = adsPreview.map(ad => {
          return {
            ...ad,
            msg: null
          }
        })
        setAdsPreview(newAdPreviews)
        return
      }
      const newAdPreviews = adsPreview.map(ad => {
        const data = datas.find(data => data["label"] === ad["name_ads_account"])
        if (!data) return ad
        return {
          ...ad,
          msg: {
            code: data["code"],
            title: data["msg"]
          }
        }
      })
      setAdsPreview(newAdPreviews)
    }
    try {
      setLoading(true);
      const dataTemplates = await getDataCamps();
      const {data} = await FB.createCamp({
        templates: dataTemplates,
        page_id: page.current,
        type: templateType,
        storeId,
        mb_name: name_user.current,
        user_id: parseInt(user["shop"] || "0", 10)
      });
      const {datas}:{datas: Reponse[]} = data
      const camp_faileds = datas.filter(data => data["code"] !== 200)
      if (camp_faileds.length === 0) {
        message.success('Campaign creation was successful !!!');
        setTitle(`All created campaigns are successful (${adsPreview.length} ${adsPreview.length === 1 ? "camp" : "camps"})`)
      } else {
        setTitle(`Have campaigns failed (${camp_faileds.length} ${camp_faileds.length === 1 ? "camp" : "camps"})`)
        message.warning('Some campaigns have failed. Please check !!!');
      }
      mappingMsg(datas)
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Create Campaigns failed !!!');
      setTitle("All created campaigns have failed.")
      mappingMsg([])
    }
  };


  const getLinkVideoByRecordID = async (record_id: string | null) => {
    if (!record_id) return {
      video_url: "",
      list_video: [],
      vc_name: "",
      video_name: ""
    }

    const res = await fetch(`https://spy.husble.com/api/video-v2?record=${record_id}`)
    const data: VIDEO[] = await res.json()

    if (!data || data.length === 0) return {
      video_url: "",
      list_video: [],
      vc_name: "",
      video_name: ""
    }
    return {
      vc_name: getCreatorName(data[0]["name"]),
      video_url: data[0]["link"],
      list_video: data,
      video_name: data[0]["name"]
    }
  }

  const handleChangeImageUrl = debounce((e: ChangeEvent<HTMLInputElement>, record: Product, thumbnail?: boolean) => {
    const { key } = record;
    const {value} = e.target
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );
    switch (templateType) {
      case "image":
      case "creative_image":
        currentDatas[findIndex] = {
          ...currentDatas[findIndex],
          image_url: value
        };
        break

      case "video":
        if (/https:\/\//.test(value)) {
          currentDatas[findIndex] = {
            ...currentDatas[findIndex],
            video_url: value,
            video_record_id: ""
          };
        } else {
          currentDatas[findIndex] = {
            ...currentDatas[findIndex],
            video_record_id: value,
            video_url: ""
          };
        }
        break

      case "creative_video":
        if (thumbnail) {
          currentDatas[findIndex] = {
            ...currentDatas[findIndex],
            image_url: value
          };
        } else {
          if (/https:\/\//.test(value)) {
            currentDatas[findIndex] = {
              ...currentDatas[findIndex],
              video_url: value,
              video_record_id: ""
            };
          } else {
            currentDatas[findIndex] = {
              ...currentDatas[findIndex],
              video_record_id: value,
              video_url: ""
            };
          }
        }
        break

      default: break
    }
    setAdsPreview(currentDatas);
  }, 1000)

  const handleChangeMessage = (e: ChangeEvent<HTMLTextAreaElement>, record: Product) => {
    const { key } = record;
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      body: e.target.value
    };

    setAdsPreview(currentDatas);
  }

  const updateVideoUrlRecord = async (video_record_id: string, record: Product) => {
    try {
      setLoading(true)
      const {video_url, list_video, video_name} = await getLinkVideoByRecordID(video_record_id)
      const currentDatas = [...adsPreview]
      const {key} = record
      const findIndex = currentDatas.findIndex(
        (data: Product) => data.key === key
      );
  
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        video_url,
        list_video,
        video_name
      }
      setAdsPreview(currentDatas);
      setLoading(false)
    } catch (error) {
      message.error("Error when trying get video url")
      setLoading(false)
    }
  }

  const viewVideo = (video_url: string | undefined, video_record_id: string | undefined) => {
    if (!video_url) return
    if (!video_record_id) {
      if (video_url.indexOf("=download&id=")) {
        const [_, video_id] = video_url.split("=download&id=")
        window.open(`https://drive.google.com/file/d/${video_id}/view`, "_blank")
      } else {
        window.open(video_url, "_blank")
      }
      return
    }
    const [_, video_id] = video_url.split("=download&id=")
    window.open(`https://drive.google.com/file/d/${video_id}/view`, "_blank")
  }

  const renderCreatePost = () => {
    if (templateType.indexOf("creative") !== -1) return null

    return (
      <Button disabled={!isCreatePost} className="btn__create--post" onClick={handleCreatePosts} type="primary">
        Create Posts
      </Button>
    )
  }

  const renderBtnActionVideo = (record: Product) => {
    const {video_record_id, video_url, list_video} = record
    return (
      <div style={{display: "flex", gap: 10, marginTop: 10}}>
        {video_record_id ? <Button type='primary' size='small' onClick={() => updateVideoUrlRecord(video_record_id || "", record)}>Get Link Video</Button>: null}
        {video_url ? <Button type='primary' size='small' onClick={() => viewVideo(video_url, video_record_id)}>View</Button> : null}
        
        {list_video && list_video.length > 1 ? <Video record={record} adsPreview={adsPreview} setAdsPreview={setAdsPreview} videos={list_video || []} /> : null} 
      </div>
    )
  }

  const renderCampType = (record: Product) => {
    switch (templateType) {
      case "image":
      case "creative_image":
        return (
          <div className='camp_type' style={{width: "100%"}}>
            <span className='camp_item--label'>Image </span>
            <Input
              onChange={(e) => handleChangeImageUrl(e, record)}
              style={{width: '90%'}}
              defaultValue={record.image_url}
              key={record.image_url}
            />
          </div>         
        )

      case "video":
        return (
          <div className='camp_type'>
            <span className='camp_item--label'>Video </span>
            <Input
              onChange={(e) => handleChangeImageUrl(e, record)}
              style={{width: '90%'}}
              defaultValue={record.video_record_id || record.video_url}
              key={record.video_url}
              placeholder='input video url or record_id'
            />
            {renderBtnActionVideo(record)}
          </div> 
        )
      case "creative_video":
        return (
          <div className='camp_type'>
            <div>
              <span className='camp_item--label'>Thumbnail </span>
              <Input
                onChange={(e) => handleChangeImageUrl(e, record, true)}
                style={{width: '90%'}}
                defaultValue={record.image_url}
                key={record.image_url}
                placeholder='Thumbnail'
              />
            </div>
            <div>
              <span className='camp_item--label'>Video </span>
              <Input
                onChange={(e) => handleChangeImageUrl(e, record, false)}
                style={{width: '90%'}}
                defaultValue={record.video_record_id || record.video_url}
                key={record.video_url}
                placeholder='input video url or record_id'
              />
              {renderBtnActionVideo(record)}
            </div>
          </div> 
        )

      default: break
    }
  }

  const updateNameAd = (payload: PayloadAdName): string => {
    const {countries, name_ads_account, age_max, age_min, gender, template_adset_name, tab, vc_name, template_type} = payload
    let new_name = resetTabInAdsAccountName(tab, name_ads_account).replace(`-${template_adset_name}`, "")
    new_name = createNameAdWhenChangeCountries(countries, new_name) + "-" + createAdSetName({countries, age_max, age_min, gender})
    new_name = replaceTabInAdsAccountName(tab, new_name)
    new_name = addNameVideoCreator({old_vc_name: vc_name, vc_name, name_ads_account: new_name, template_type})
    return new_name
  }

  const handleChangeFieldOfAdset = (field_name: string, ad: Product) => {
    const {name_ads_account, template_adset_name, tab, vc_name, template_type} = ad
    let new_name_ads_account = name_ads_account
    let new_template_adset_name = template_adset_name
    switch (field_name) {
      case "countries":
      case "gender":
      case "age_min":
      case "age_max":
        const payload = createPayloadAdset(ad)
        new_name_ads_account = updateNameAd({...payload, name_ads_account, template_adset_name, tab, vc_name, template_type})
        new_template_adset_name = createAdSetName(payload)

      default: return {
        new_name_ads_account,
        new_template_adset_name
      }
    }
  }

  const handleChooseSelect = (payload: PAYLOAD_SELECT) => {
    const {value, record, field_name, is_all} = payload

    if (!is_all) {
      const currentDatas: Product[] = [...adsPreview];
      const { key } = record;
      const findIndex = currentDatas.findIndex(
        (data: Product) => data.key === key
      );
      // let name_ads_account = currentDatas[findIndex]["name_ads_account"]
      const {new_name_ads_account, new_template_adset_name} = handleChangeFieldOfAdset(field_name, {...currentDatas[findIndex], [field_name]: value})

      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        [field_name]: value,
        name_ads_account: new_name_ads_account,
        template_adset_name: new_template_adset_name
      };
      setAdsPreview(currentDatas);

      return
    }

    const currentDatas: Product[] = adsPreview.map(ad => {
      const {new_name_ads_account, new_template_adset_name} = handleChangeFieldOfAdset(field_name, {...ad, [field_name]: value})

      return {
        ...ad,
        [field_name]: value,
        name_ads_account: new_name_ads_account,
        template_adset_name: new_template_adset_name
      }
    })
    const newTarget: any = {...target}
    newTarget[field_name] = value
    setAdsPreview(currentDatas);
    setTarget(newTarget)
  }

  const handleChooseTemplate = async (value: string) => {
    template.current = value
    const message = await getTemplateMessage()
    const store_name = adsPreview[0].store_2.shop
    const currentDatas: Product[] = [...adsPreview].map(ad => ({
      ...ad,
      body: `${message} \n Customize yours: https://${store_name.replace("blithehub.myshopify.com", "wrappiness.co").replace(".myshopify", "")}/${LINK_DATAS[store_name].slice(0, 3)}-${ad.product_id}` || ""
    }))
    setAdsPreview(currentDatas);
  }

  const handleChooseTemplateForOneRecord = async (value: string, record: Product) => {
    const message = await getTemplateMessage(value)
    const currentDatas: Product[] = [...adsPreview];
    const { key } = record;
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );
    const store_name = record.store_2.shop
    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      body: `${message} \n Customize yours: https://${store_name.replace("blithehub.myshopify.com", "wrappiness.co").replace(".myshopify", "")}/${LINK_DATAS[store_name].slice(0, 3)}-${record.product_id}` || ""
    };
    setAdsPreview(currentDatas);
  }

  const handleChoosePixel = async (value: string) => {
    pixel.current = value
  }

  const changeShowAll = (checked: boolean) => {
    setShowAll(checked)
    if (!checked) {
      setExpendRows([])
      return
    }

    const expendsRows = adsPreview.map(ad => ad.key)
    setExpendRows(expendsRows)
  }

  const hanldeExpend = (expend: boolean, record: Product) => {
    const newExpendRows = expendRows
    if (expend) {
      newExpendRows.push(record.product_id)
    } else {
      const index = newExpendRows.findIndex(key => key === record.product_id)
      newExpendRows.splice(index, 1)
    }

    if (newExpendRows.length === adsPreview.length) {
      setShowAll(true)
    } else {
      setShowAll(false)
    }
    setExpendRows(newExpendRows)
  }

  const renderBtnGetAllVideo = useCallback(() => {
    if (templateType.indexOf("video") === -1) return

    async function gettAllVideo() {
      try {
        setLoading(true)
        const dataPromises = adsPreview.map(ad => {
          return getVideoByRecordId(ad)
        })
  
        const resultPromises = await Promise.all(dataPromises)
        const currentDatas = adsPreview.map((ad, index) => ({
          ...ad,
          video_url: resultPromises[index]['video_url'],
          video_record_id: resultPromises[index]['video_record_id'] || "",
          video_name: resultPromises[index]['video_name'] || "",
        }))
        setLoading(false)
        setAdsPreview(currentDatas)
      } catch (error) {
        message.error("Error when trying get video url")
        setLoading(false)
      }
    }
    return (
      <Button onClick={gettAllVideo} size='small' type='primary'>Get All Video</Button>
    )
  }, [adsPreview])
  return (
    <Styled>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width="100vw"
        placement="left"
        className='drawer_step2'
        title={title}
      >
        <div className='sticky'>
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <div className='flex gap-2'>
                <Select
                  defaultValue="image"
                  options={TYPES}
                  onChange={handleChangeTemplateType}
                  style={{width: 150}}
                />
                <Input
                  allowClear
                  onChange={(e) => handleChangeUser(e)}
                  placeholder="phu"
                  style={{width: "150px"}}
                />
                <Select
                  style={{width: "120px"}}
                  placeholder="account"
                  onChange={chooseAccount}
                  showSearch
                >
                  {accounts.map(act => (
                    <Option key={act.id} value={act.id}>{act.name}</Option>
                  ))}
                </Select>
                <Select
                  style={{width: "200px"}}
                  placeholder="choose page"
                  onChange={choosePage}
                >
                  {PAGES.map(page => (
                    <Option key={page.value} value={page.value}>{page.label}</Option>
                  ))}
                </Select>
                <Select
                  style={{ width: '200px' }}
                  placeholder="choose template"
                  onChange={handleChooseTemplate}
                  options={templateAds.current.map((template: any) => ({
                    label: template.name,
                    value: template.name
                  }))}
                />
                <Select
                  style={{ width: '200px' }}
                  placeholder="choose pixel"
                  onChange={handleChoosePixel}
                  options={fbPixels.current.map((template: any) => ({
                    label: template.name,
                    value: `${template.pixel_id}=${template.instagram_id}`
                  }))}
                />
              </div>
              <div className='flex gap-2 mt-3 items-center'>
                <Target record={target} is_all={true} handleChooseSelect={handleChooseSelect} />
              </div>
            </div>
            <div>
              <Button className="btn__export--csv" onClick={handleExportCamp} type="primary">
                Export CSV
              </Button>
              {renderCreatePost()}
              <Button disabled={!isCreateCamp} className="btn__create--camp ml-2" onClick={handleCreateCamp} type="primary">
                Create Campaigns
              </Button>
            </div>
          </div>
          <div style={{display: "flex", gap: 10, marginTop: 10}}>
            <Switch checked={showAll} onChange={changeShowAll} unCheckedChildren='Show All' checkedChildren='Show All' />
            {renderBtnGetAllVideo()}
          </div>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={adsPreview}
          scroll={{
            y: 'calc(100vh - 200px)'
          }}
          pagination={false}
          className='table_step2'
          expandable={{
            expandedRowRender: (record) => (
              <ul key={record.title} className={`camp_list_items`}>
                <li>
                  <div className='camp_target flex items-center gap-2 flex-wrap'>
                    <Select
                      style={{ width: '200px' }}
                      placeholder="choose template"
                      onChange={(value) => handleChooseTemplateForOneRecord(value, record)}
                      options={templateAds.current.map((template: any) => ({
                        label: template.name,
                        value: template.name
                      }))}
                    />
                    <Target is_all={false} record={record} handleChooseSelect={handleChooseSelect} />
                  </div>
                </li>
                <li style={{width: "100%"}}>
                  {renderCampType(record)}
                </li>
                <li style={{width: "100%"}}>
                  <span className='camp_item--label'>Message</span>
                  <TextArea
                    onBlur={(e) => handleChangeMessage(e, record)}
                    rows={5} style={{width: "100%"}}
                    defaultValue={record.body}
                    key={record.body}
                  />
                </li>
              </ul>
            ),
            expandedRowKeys: expendRows,
            onExpand: hanldeExpend,
          }}
        />
      </Drawer>
    </Styled>
  );
}

export default Index;
