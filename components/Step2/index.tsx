import { Button, Drawer, Input, Row, Select, Table, Tag, message } from 'antd';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { ACCOUNT_IDS, LINK_DATAS, PAGES, template_ads } from '#/ultils/config';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_TEMPLATE_ADS, GET_TEMPLATE_ITEMS } from '#/graphql/query';
import moment from 'moment';
import FB from '#/app/api/fb';
import { ChromeOutlined } from '@ant-design/icons';

import Styled from "./Style"
import TextArea from 'antd/es/input/TextArea';

type Tag = {
  id: number;
  title: String;
};

type Store = {
  shop: string;
}

type Product = {
  store_id: string;
  product_id: string;
  handle: string;
  title: string;
  name_ads_account: string;
  vendor: string;
  product_ads_tags: Tag[];
  pr: string;
  link: string;
  product_type: string;
  image_url: string;
  key: number;
  template_name?: string;
  template_type?: string;
  template_user?: string;
  template_account?: string;
  image_video?: string;
  created_at_string: string;
  link_object_id?: string;
  story_id: string;
  store_2: Store;
  post_id?: string;
  body: string;
  customize_link?: string;
  video_url?: string;
};

const {Option} = Select

function Index({ open, setOpen, ads }: any) {
  const [adsPreview, setAdsPreview] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreatePost, setIsCreatePost] = useState<Boolean>(false)
  const [isCreateCamp, setIsCreateCamp] = useState<Boolean>(false)
  const [templateType, setProductType] = useState<string>('image');
  const [getTemplateAds] = useLazyQuery(GET_TEMPLATE_ADS);
  const [getTemplateItems] = useLazyQuery(GET_TEMPLATE_ITEMS);
  const account = useRef<string>("")
  const page = useRef<string>("")
  const name_user = useRef<string>("")
  const templateAds = useRef([]);

  useQuery(GET_TEMPLATE_ADS, {
    variables: {
      where: {}
    },
    onCompleted: ({ template_ads }) => {
      templateAds.current = template_ads;
    }
  });

  const getNameTemplateAds = (name_ads_account: string) => {
    const names = Object.keys(template_ads);
    for (const name of names) {
      const dataOfTemplateNames =
        template_ads[name as keyof typeof template_ads];

      const findData = dataOfTemplateNames.find(
        (templateName: string) => name_ads_account.indexOf(templateName) !== -1
      );

      if (findData) {
        return name;
      }
    }

    return 'Template General Target';
  };

  useEffect(() => {
    async function mappingData() {
      setLoading(true);
      const results: any = [];
      for await (const ad of ads) {
        const { name_ads_account } = ad;
        const nameTemplate = getNameTemplateAds(name_ads_account);
        const date = `${new Date().getDate()}`.slice(-2);
        const month = `${new Date().getMonth() + 1}`.slice(-2);
        let new_name_ads_account = name_ads_account.replace(
          '*',
          `${date}-${month}`
        );
        if (templateType === 'image') {
          new_name_ads_account = new_name_ads_account.replace(
            /G00|G02/gi,
            'G01'
          );
        }

        if (templateType === 'video') {
          new_name_ads_account = new_name_ads_account.replace(
            /G00|G01/gi,
            'G02'
          );
        }

        if (account.current) {
          const [name] = account.current.split("=")
          new_name_ads_account = new_name_ads_account.replace("***", name)
        }

        if (name_user.current) {
          new_name_ads_account = new_name_ads_account.replace("**", name_user.current)
        }

        const {
          data: { template_ads }
        } = await getTemplateAds({
          variables: {
            where: {
              name: {
                _eq: nameTemplate
              },
              type: {
                _eq: templateType
              }
            }
          }
        });

        const template = template_ads[0];

        results.push({
          ...ad,
          name_ads_account: new_name_ads_account,
          template_name: template.name,
          template_account: account.current?.split("=")[0],
          template_type: template.type,
          template_user: name_user.current,
          body: `${template.template_ads_items[0].body} \n Customize yours: https://${ad.store_2.shop.replace(".myshopify", "")}/${LINK_DATAS[ad.store_2.shop].slice(0, 3)}-${ad.product_id}` || ""
        });
      }

      setAdsPreview(results);
      setLoading(false);
    }

    if (!open) return

    setIsCreateCamp(false)
    mappingData();
  }, [ads, open]);

  const checkFulFillDataCreatePost = (): Boolean => {
    if (account.current && account.current !== "***" && page.current && name_user.current && name_user.current !== "**") {
      setIsCreatePost(true)
      return true
    }

    setIsCreatePost(false)

    return false
  }

  const checkFulFillDataCreateCamp = (ads: Product[]) => {
    if (!checkFulFillDataCreatePost()) {
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

  const handleSelectTypeOfTemplate = (value: any, row: Product) => {
    const { key } = row;
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      template_name: value
    };

    setAdsPreview(currentDatas);
  };

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
  }, 300)

  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      width: 300,
      render: (title: string, row: Product) => {
        return (
          <a target="_blank" href={`${row.link}`}>
            {title}
          </a>
        );
      }
    },
    {
      title: 'Camp Name',
      key: 'name_ads_account',
      dataIndex: 'name_ads_account',
      render: (name_ads_account: string, record: Product) => (
        <TextArea onChange={(e) => handleChangeAdAccount(e, record)} key={name_ads_account} defaultValue={name_ads_account} />
      )
    },
    {
      title: 'Post Id',
      key: 'post_id',
      dataIndex: 'post_id',
      render: (post_id: string, row: Product) => {
        return (
          // post_id ? (
            <div style={{display: 'flex', gap: 10}}>
              <Input allowClear onChange={(e) => handleChangePostId(e, row)} key={post_id} defaultValue={post_id} />
              {post_id ? <ChromeOutlined color='#1677ff' onClick={() => gotoPost(post_id)} /> : ""}
            </div>
          // ) : null
        );
      },
      width: 200
    }
  ];

  const getDataCamps = async () => {
    let dataExports: any = [];
    for await (const ad of adsPreview) {
      const {
        template_type,
        template_name,
        name_ads_account,
        template_user,
        image_video,
        link,
        link_object_id,
        template_account,
        story_id,
        image_url,
        body,
        customize_link,
        video_url,
        post_id
      } = ad;

      const {
        data: { template_ads_item }
      } = await getTemplateItems({
        variables: {
          where: {
            template_ads: {
              name: {
                _eq: template_name
              },
              type: {
                _eq: template_type
              }
            }
          }
        }
      });
      const mapDatas = template_ads_item.map((ad_item: Product) => ({
        ...ad_item,
        name_ads_account,
        template_account,
        template_user,
        image_video,
        link,
        link_object_id,
        story_id,
        image_url,
        customize_link,
        body,
        video_url,
        post_id
      }));
      dataExports = dataExports.concat(mapDatas);
    }

    const time_start = `${moment().format('MM/DD/YYYY')} 00:00`;
    const result = dataExports.map((d: any) => ({
      ['Ad Name']: d.template_user,
      ['Ad Status']: d.ad_status,
      ['Additional Custom Tracking Specs']: d.additional_custom_tracking_specs,
      ['Body']: d.body,
      ['Call to Action']: d.call_to_action,
      ['Conversion Tracking Pixels']: d.conversion_tracking_pixels,
      ['Creative Type']: d.creative_type,
      ['Image File Name']: d.image_file_name,
      ['Story ID']: d.story_id || '',
      ['Instagram Account ID']: d.instagram_account_id,
      ['Instagram Preview Link']: d.instagram_preview_link,
      ['Link']: d.link,
      ['Link Description']: d.link_description,
      ['Link Object ID']: page.current,
      ['Optimize text per person']: d.optimize_text_per_person,
      ['Optimized Ad Creative']: d.optimized_ad_creative,
      ['Permalink']: d.permalink,
      ['Preview Link']: d.preview_link,
      ['URL Tags']: `${d.url_tags}${d.template_user}`,
      ['Use Page as Actor']: d.use_page_as_actor,
      ['Video File Name']: d.video_file_name,
      ['Video ID']: templateType === 'video' ? d.image_video : d.video_id,
      ['Video Retargeting']: d.video_retargeting,
      ['Ad Set Bid Strategy']: d.ad_set_bid_strategy,
      ['Ad Set Daily Budget']: d.ad_set_daily_budget,
      ['Ad Set Lifetime Budget']: d.ad_set_lifetime_budget,
      ['Ad Set Lifetime Impressions']: d.ad_set_lifetime_impressions,
      ['Ad Set Name']: d.ad_set_name,
      ['Ad Set Run Status']: d.ad_set_run_status,
      ['Ad Set Time Start']: time_start,
      ['Age Max']: d.age_max,
      ['Age Min']: d.age_min,
      ['Attribution Spec']: d.attribution_spec,
      ['Billing Event']: d.billing_event,
      ['Countries']: d.countries,
      ['Destination Type']: d.destination_type,
      ['Device Platforms']: d.device_platforms,
      ['Facebook Positions']: d.facebook_positions,
      ['Flexible Inclusions']: d.flexible_inclusions,
      ['Gender']: d.gender,
      ['Instagram Positions']: d.instagram_positions,
      ['Location Types']: d.location_types,
      ['Messenger Positions']: d.messenger_positions,
      ['Optimization Goal']: d.optimization_goal,
      ['Optimized Conversion Tracking Pixels']:
        d.optimized_conversion_tracking_pixels,
      ['Optimized Event']: d.optimized_event,
      ['Publisher Platforms']: d.publisher_platforms,
      ['Use Accelerated Delivery']: d.use_accelerated_delivery,
      ['Buying Type']: d.buying_type,
      ['Campaign Name']: d.name_ads_account,
      ['Campaign Objective']: d.campaign_objective,
      ['Campaign Start Time']: time_start,
      ['Campaign Status']: d.campaign_status,
      ['New Objective']: d.new_objective,
      ['Ad Account Id']: `act_${account.current.split("=")[1]}`,
      ["Image Url"]: d.image_url,
      ["Video Url"]: d.video_url,
      ["Customize Link"]: d.customize_link,
      ["Post Id"]: d.post_id
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

  const handleChangeTemplateType = (value: string) => {
    const newDatas = adsPreview.map((ad: Product) => {
      const { name_ads_account } = ad;
      let new_name_ads_account = name_ads_account;
      if (value === 'image') {
        new_name_ads_account = new_name_ads_account.replace(/G00|G02/gi, 'G01');
      }

      if (value === 'video') {
        new_name_ads_account = new_name_ads_account.replace(/G00|G01/gi, 'G02');
      }
      return {
        ...ad,
        name_ads_account: new_name_ads_account,
        template_type: value
      };
    });

    setProductType(value);
    setAdsPreview(newDatas);
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
      if (templateType === "image") {
        newAdsPreview = adsPreview.map((ad, index) => {
          return {
            ...ad,
            post_id: postIds[index].post_id.split("_")[1]
          }
        })
      } else {
        newAdsPreview = adsPreview.map((ad, index) => {
          return {
            ...ad,
            post_id: postIds[index].post_id
          }
        })
      }

      setIsCreateCamp(true)
      setAdsPreview(newAdsPreview)
      setLoading(false);
      message.success('Create Campaigns successfull !!!');
    } catch (error) {
      console.log(error)
      setIsCreateCamp(false)
      setLoading(false);
      message.error('Create Campaigns failed !!!');
    }
  }

  const handleCreateCamp = async () => {
    try {
      setLoading(true);
      const dataTemplates = await getDataCamps();
      await FB.createCamp({
        templates: dataTemplates,
        page_id: page.current
      });
      setLoading(false);
      message.success('Create Campaigns successfull !!!');
    } catch (error) {
      setLoading(false);
      message.error('Create Campaigns failed !!!');
    }
  };

  const handleChangeImageUrl = debounce((e: ChangeEvent<HTMLInputElement>, record: Product) => {
    const { key } = record;
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );
    if (templateType === "image") {
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        image_url: e.target.value
      };
    } else {
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        video_url: e.target.value
      };
    }

    setAdsPreview(currentDatas);
  }, 500)

  const handleChangeMessage = debounce((e: ChangeEvent<HTMLTextAreaElement>, record: Product) => {
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
  }, 500)

  return (
    <Styled>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        width="90vw"
        placement="left"
        className='drawer_step2'
      >
        <div className="flex justify-between">
          <div className='flex gap-2'>
            <Select
              defaultValue="image"
              options={[
                { label: 'Image', value: 'image' },
                { label: 'Video', value: 'video' }
              ]}
              onChange={handleChangeTemplateType}
            />
            <Input
              onChange={(e) => handleChangeUser(e)}
              placeholder="phu"
              style={{width: "150px"}}
            />
            <Select
              style={{width: "200px"}}
              placeholder="please choose account"
              onChange={chooseAccount}
            >
              {ACCOUNT_IDS.map(act => (
                <Option key={act.value} value={act.value}>{act.label}</Option>
              ))}
            </Select>
            <Select
              style={{width: "200px"}}
              placeholder="please choose page"
              onChange={choosePage}
            >
              {PAGES.map(page => (
                <Option key={page.value} value={page.value}>{page.label}</Option>
              ))}
            </Select>
          </div>
          <div>
            <Button className="btn__export--csv" onClick={handleExportCamp} type="primary">
              Export CSV
            </Button>
            <Button disabled={!isCreatePost} className="btn__create--post" onClick={handleCreatePosts} type="primary">
              Create Posts
            </Button>
            <Button disabled={!isCreateCamp} className="btn__create--camp ml-2" onClick={handleCreateCamp} type="primary">
              Create Campaigns
            </Button>
          </div>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={adsPreview}
          scroll={{
            y: 'calc(100vh - 200px)'
          }}
          pagination={{
            pageSize: 50
          }}
          className='table_step2'
          expandable={{
            expandedRowRender: (record) => (
              <ul className='camp_list_items'>
                <li style={{width: "60%"}}>
                  <span className='capm_item--label'>
                    {templateType === "image" ? "Image" : "Video"} 
                  </span>
                  <Input
                    onChange={(e) => handleChangeImageUrl(e, record)}
                    style={{width: '60%'}}
                    defaultValue={templateType === "image" ? record.image_url : record.video_url}
                    key={templateType === "image" ? record.image_url : record.video_url}
                  />
                </li>
                <li>
                  <span className='capm_item--label'>Template Name</span>
                  <Select
                    onChange={(value) => handleSelectTypeOfTemplate(value, record)}
                    style={{ width: '200px' }}
                    defaultValue={record.template_name}
                    options={templateAds.current.map((template: any) => ({
                      label: template.name,
                      value: template.name
                    }))}
                  />
                </li>
                <li style={{width: "100%"}}>
                  <span className='capm_item--label'>Message</span>
                  <TextArea
                    onChange={(e) => handleChangeMessage(e, record)}
                    rows={5} style={{width: "100%"}}
                    defaultValue={record.body}
                    key={record.body}
                  />
                </li>
              </ul>
            ),
          }}
        />
      </Drawer>
    </Styled>
  );
}

export default Index;
