import { Button, Drawer, Input, Select, Table, Tag } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

import {template_ads} from '#/ultils/config'
import { useLazyQuery } from '@apollo/client';
import { GET_TEMPLATE_ADS, GET_TEMPLATE_ITEMS } from '#/graphql/query';
import Client from '#/ultils/client';

type Tag = {
  id: number;
  title: String;
};

type TemplateAds = (keyof typeof template_ads)[]

type ListKeys = TemplateAds[]

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
  product_typ: String;
  image_url: String;
  key: number;
  template_name?: string;
  template_type?: string;
};

function Index({open, setOpen, ads}: any) {
  const [adsPreview, setAdsPreview] = useState([])
  const [loading, setLoading] = useState<boolean>(false)
  const [getTemplateAds] = useLazyQuery(GET_TEMPLATE_ADS)
  const [getTemplateItems] = useLazyQuery(GET_TEMPLATE_ITEMS)

  const getNameTemplateAds = (name_ads_account: string) => {
    const names = Object.keys(template_ads)
    for (const name of names) {
      const dataOfTemplateNames = template_ads[name as keyof typeof template_ads]
      console.log(dataOfTemplateNames, "dataOfTemplateNames")

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
        const {data: {template_ads}} = await getTemplateAds({
          variables: {
            where: {
              name: {
                _eq: nameTemplate
              },
              type: {
                _eq: ad?.template_type || "image"
              }
            }
          }
        })

        const template =  template_ads[0]
        results.push({
          ...ad,
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
    console.log(value)
    const {key} = row
    const currentDatas: any = [...adsPreview]
    const findIndex = currentDatas.findIndex((data: Product) => data.key === key)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      template_type: value
    }

    setAdsPreview(currentDatas)
  }

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
      title: 'Camp',
      key: 'name_ads_account',
      dataIndex: 'name_ads_account',
      width: 250,
    },
    {
      title: 'Template',
      key: 'template',
      dataIndex: 'template',
      width: 300,
      render: (_: any, row: any) => {

        return (
          <div>
            <Tag color="blue">{row.template_name}</Tag>
            <Select
              onChange={(value) => handleSelectTypeOfTemplate(value, row)}
              style={{width: "100px"}}
              defaultValue={row.template_type}
              options={[{value: "image", label: "Image"}, {value: "video", label: "Video"}]}
            />
          </div>
        )
      }
    },
    {
      title: 'User',
      key: 'user',
      dataIndex: 'user',
      render: () => <Input placeholder='Phu'/>
    },
    {
      title: 'Account',
      key: 'account',
      dataIndex: 'account'
    },
    {
      title: 'URL tags',
      key: 'url_tag',
      dataIndex: 'url_tag'
    },
    {
      title: 'Image Hash',
      key: 'image_hash',
      dataIndex: 'image_hash'
    }
  ]

  const handleExportCamp = async () => {
    let dataExports: any = []

    for await (const ad of adsPreview) {
      const {template_type, template_name} = ad
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

      dataExports = dataExports.concat(template_ads_item)
    }

    console.log(dataExports, "dataExports dataExports")
  }

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      width="90vw"
      placement='left'
    >
      <div className='flex justify-end'>
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