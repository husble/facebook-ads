import { Button, Drawer, Input, Select, Table, Tag, message } from 'antd'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import debounce from 'lodash.debounce';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import {template_ads} from '#/ultils/config'
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_TEMPLATE_ADS, GET_TEMPLATE_ITEMS } from '#/graphql/query';
import moment from 'moment';

type Tag = {
  id: number;
  title: String;
};

type Product = {
  store_id: String;
  product_id: String;
  handle: String;
  title: String;
  name_ads_account: string;
  vendor: String;
  product_ads_tags: Tag[];
  pr: String;
  link: String;
  product_type: String;
  image_url: String;
  key: number;
  template_name?: string;
  template_type?: string;
  template_user?: string;
  template_account?: string;
  image_video?: string;
  created_at_string: string;
  link_object_id?: string;
};

function Index({open, setOpen, ads}: any) {
  const [adsPreview, setAdsPreview] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [templateType, setProductType] = useState<string>("image")
  const [getTemplateAds] = useLazyQuery(GET_TEMPLATE_ADS)
  const [getTemplateItems] = useLazyQuery(GET_TEMPLATE_ITEMS)
  const templateAds = useRef([])
  useQuery(GET_TEMPLATE_ADS, {
    variables: {
      where: {}
    },
    onCompleted: ({template_ads}) => {
      templateAds.current = template_ads
    }
  })

  const getNameTemplateAds = (name_ads_account: string) => {
    const names = Object.keys(template_ads)
    for (const name of names) {
      const dataOfTemplateNames = template_ads[name as keyof typeof template_ads]

      const findData = dataOfTemplateNames.find((templateName: string) => name_ads_account.indexOf(templateName) !== -1)

      if (findData) {
        
        return name
      }
    }

    return "Template General Target"
  }

  useEffect(() => {

    async function mappingData() {
      setLoading(true)
      const results: any = []
      for await (const ad of ads) {
        const {name_ads_account} = ad
        const nameTemplate = getNameTemplateAds(name_ads_account)
        const date = `${new Date().getDate()}`.slice(-2)
        const month = `${new Date().getMonth()}`.slice(-2)
        const addDateCamp = name_ads_account.replace("*", `${date}-${month}`)
        const {data: {template_ads}} = await getTemplateAds({
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
        })

        const template =  template_ads[0]
        results.push({
          ...ad,
          name_ads_account: addDateCamp,
          template_name: template.name,
          template_type: template.type 
        })
      }

      setAdsPreview(results)
      setLoading(false)
    }
    
    
    mappingData()
  }, [ads])

  const handleSelectTypeOfTemplate = (value: any, row: Product) => {
    const {key} = row
    const currentDatas: any = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      template_name: value
    }

    setAdsPreview(currentDatas)
  }

  const handleChangeUser = debounce((e: ChangeEvent<HTMLInputElement>, row: any) => {
    const {value} = e.target
    const valueReplace = value || "**"
    
    const {key, name_ads_account, template_user} = row
    const dataWantToReplace = template_user || "**"
    const addUser = name_ads_account.replace(`-${dataWantToReplace}-`, `-${valueReplace}-`)

    const currentDatas: any = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      template_user: valueReplace,
      name_ads_account: addUser
    }
    setAdsPreview(currentDatas)
  }, 500)

  const handleChangeAccount = debounce((e: ChangeEvent<HTMLInputElement>, row: any) => {
    const {value} = e.target
    const valueReplace = value || "***"
    const {key, name_ads_account, template_account} = row
    const dataWantToReplace = template_account || "***"
    const addAccount = name_ads_account.replace(`-${dataWantToReplace}-`, `-${valueReplace}-`)

    const currentDatas: any = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      template_account: valueReplace,
      name_ads_account: addAccount
    }
    setAdsPreview(currentDatas)
  }, 500)

  const handleChangeImageVIdeo = debounce((e: ChangeEvent<HTMLInputElement>, row: Product) => {
    const {value} = e.target

    const currentDatas: Product[] = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === row.key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      image_video: value
    }
    setAdsPreview(currentDatas)
  }, 500)

  const handleChangeLinkObject = debounce((e: ChangeEvent<HTMLInputElement>, row: Product) => {
    const {value} = e.target

    const currentDatas: Product[] = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === row.key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      link_object_id: value
    }
    setAdsPreview(currentDatas)
  }, 500)

  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      width: 200,
      render: (title: string, row: Product) => {
        return (
          <a
            target="_blank"
            href={`${row.link}`}
          >
            {title}
          </a>
        );
      }
    },
    {
      title: 'Camp Name',
      key: 'name_ads_account',
      dataIndex: 'name_ads_account',
      width: 250,
    },
    {
      title: 'Template Name',
      key: 'template',
      dataIndex: 'template',
      width: 300,
      render: (_: any, row: any) => {

        return (
          <div>
            {/* <Tag color="blue">{row.template_name}</Tag> */}
            <Select
              onChange={(value) => handleSelectTypeOfTemplate(value, row)}
              style={{width: "200px"}}
              defaultValue={row.template_name}
              options={templateAds.current.map((template: any) => ({
                label: template.name,
                value: template.name
              }))}
            />
          </div>
        )
      }
    },
    {
      title: 'Ad Name',
      key: 'template_user',
      dataIndex: 'template_user',
      width: 200,
      render: (template_user: any, row: any) => <Input defaultValue={template_user} onChange={(e) => handleChangeUser(e, row)} placeholder='phu' />
    },
    {
      title: 'Ad Account',
      key: 'template_account',
      dataIndex: 'template_account',
      width: 200,
      render: (template_account: any, row: any) => <Input defaultValue={template_account} onChange={(e) => handleChangeAccount(e, row)} placeholder='account123456' />
    },
    {
      title: 'Link Object ID',
      key: 'link_object_id',
      dataIndex: 'link_object_id',
      width: 200,
      render: (link_object_id: any, row: any) => <Input defaultValue={link_object_id} onChange={(e) => handleChangeLinkObject(e, row)} placeholder='Link Object ID' />
    },
    {
      title: templateType === "image" ? 'Image Hash' : "Video ID",
      key: 'image_video',
      dataIndex: 'image_video',
      width: 200,
      render: (template_account: any, row: any) => <Input defaultValue={template_account} onChange={(e) => handleChangeImageVIdeo(e, row)} placeholder='Phu' />
    }
  ]

  const handleExportCamp = async () => {
    try {
      
    
      setLoading(true)
      let dataExports: any = []

      for await (const ad of adsPreview) {
        const {template_type, template_name, name_ads_account, template_user, image_video, link, link_object_id} = ad
        const {data: {template_ads_item}} = await getTemplateItems({
          variables: {
            "where": {
              "template_ads": {
                "name": {
                  "_eq": template_name
                },
                "type": {
                  "_eq": template_type
                }
              }
            }
          }
        })
        const mapDatas = template_ads_item.map((ad_item: any) => ({
          ...ad_item,
          name_ads_account,
          template_user,
          image_video,
          link,
          link_object_id
        }))
        dataExports = dataExports.concat(mapDatas)
      }
      const LabelImageVideo = templateType === "image" ? "Image Hash" : "Video ID"
      const time_start = `${moment().format("DD/MM/YYYY")} 12:00`
      const result = dataExports.map((d: any) => ({
        ['Ad Name']: d.template_user,
        ["Ad Status"]: d.ad_status,
        ["Additional Custom Tracking Specs"]: d.additional_custom_tracking_specs,
        ["Body"]: d.body,
        ["Call to Action"]: d.call_to_action,
        ["Conversion Tracking Pixels"]: d.conversion_tracking_pixels,
        ["Creative Type"]: d.creative_type,
        ["Degrees of Freedom Type"]: "USER_ENROLLED_AUTOFLOW",
        ["Link"]: d.link,
        ["Link Object ID"]: d.link_object_id,
        ["Story ID"]: "",
        ["URL Tags"]: `${d.url_tags}${d.template_user}`,
        ["Use Page as Actor"]: d.use_page_as_actor,
        [LabelImageVideo]: d.image_video,
        ["Video Retargeting"]: d.video_retargeting,
        ["Ad Set Bid Strategy"]: d.ad_set_bid_strategy,
        ["Ad Set Daily Budget"]: d.ad_set_daily_budget,
        ["Ad Set Lifetime Budget"]: d.ad_set_lifetime_budget,
        ["Ad Set Lifetime Impressions"]: d.ad_set_lifetime_impressions,
        ["Ad Set Name"]: d.ad_set_name,
        ["Ad Set Run Status"]: d.ad_set_run_status,
        ["Ad Set Time Start"]: time_start,
        ["Age Max"]: d.age_max,
        ["Age Min"]: d.age_min,
        ["Attribution Spec"]: d.attribution_spec,
        ["Billing Event"]: d.billing_event,
        ["Countries"]: d.countries,
        ["Destination Type"]: d.destination_type,
        ["Device Platforms"]: "mobile",
        ["Excluded Custom Audiences"]: "",
        ["Facebook Positions"]: "feed, facebook_reels, story",
        ["Gender"]: d.gender,
        ["Location Types"]: d.location_types,
        ["Optimization Goal"]: d.optimization_goal,
        ["Optimized Conversion Tracking Pixels"]: d.optimized_conversion_tracking_pixels,
        ["Optimized Event"]: d.optimized_event,
        ["Publisher Platforms"]: "facebook",
        ["Use Accelerated Delivery"]: d.use_accelerated_delivery,
        ["Buying Type"]: d.buying_type,
        ["Campaign Name"]: d.name_ads_account,
        ["Campaign Objective"]: d.campaign_objective,
        ["Campaign Start Time"]: time_start,
        ["Campaign Status"]: d.campaign_status,
        ["New Objective"]: d.new_objective,
      }));

      const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const fileExtension = '.csv';

      const uuid = Math.random();
      const ws = XLSX.utils.json_to_sheet(result);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, `order-${uuid}` + fileExtension);

      message.success("Export successfull !!!")
      setLoading(false)
    } catch (error) {
      message.error("Export error !!!")
      setLoading(false)
    }
  }

  const handleChangeTemplateType = (value: string) => {
    const newDatas = adsPreview.map((ad: Product) => ({
      ...ad,
      template_type: value
    }))

    setProductType(value)
    setAdsPreview(newDatas)
  }

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      width="90vw"
      placement='left'
    >
      <div className='flex justify-between'>
        <Select
          defaultValue="image"
          options={[{label: "Image", value: "image"}, {label: "Video", value: "video"}]}
          onChange={handleChangeTemplateType}
        />
        <Button onClick={handleExportCamp} type='primary'>Export CSV</Button>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={adsPreview}
        scroll={{
          x: "calc(100vw - 100px)",
          y: "calc(100vh - 200px"
        }}
        pagination={{
          pageSize: 50
        }}
      />
    </Drawer>
  )
}

export default Index