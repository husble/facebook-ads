import { Drawer, Input, Table } from 'antd'
import React, { useEffect, useState } from 'react'

type Tag = {
  id: number;
  title: String;
};

type Product = {
  store_id: String;
  product_id: String;
  handle: String;
  title: String;
  name_ads_account: String;
  vendor: String;
  product_ads_tags: Tag[];
  pr: String;
  link: String;
  product_typ: String;
  image_url: String;
  key: number;
};

function Index({open, setOpen, ads, selects}: any) {
  const [adsPreview, setAdsPreview] = useState([])

  // useEffect(() => {

  //   if (!open) return

  //   const mappingDatas = selects.map((key: number) => ads.find((ad: Product) => ad.key === key))

  //   setAdsPreview(mappingDatas)
  // }, [open])

  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
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
      dataIndex: 'name_ads_account'
    },
    {
      title: 'Template',
      key: 'template',
      dataIndex: 'template'
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

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      width="90vw"
      placement='left'
      title="Preview"
    >

      <Table
        columns={columns}
        dataSource={ads}
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