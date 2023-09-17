"use client"

import { GET_STORES } from '#/graphql/query'
import { useQuery } from '@apollo/client'
import { Select, Table } from 'antd'
import { Key, useState } from 'react'

const {Option} = Select

type STORE = {
  id: Key;
  shop: String;
}

export default function Home() {
  const [stores, setStores] = useState<STORE[]>([])
  useQuery(GET_STORES, {
    onCompleted: ({store_2}) => {
      setStores(store_2)
    }
  })

  const columns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date"
    },
    {
      title: "Product type",
      key: "product_type",
      dataIndex: "product_type"
    },
    {
      title: "PR",
      key: "pr",
      dataIndex: "pr"
    },
    {
      title: "Title",
      key: "title",
      dataIndex: "title"
    },
    {
      title: "MB",
      key: "mb_name",
      dataIndex: "mb_name"
    },
    {
      title: "Ads Account",
      key: "ads_account",
      dataIndex: "ads_account"
    }
  ]

  const datas = [
    {
      title: "123"
    },
    {
      title: "123"
    },
    {
      title: "123"
    },
    {
      title: "123"
    },
    {
      title: "123"
    }
  ]

  const handleSelectStore = (shop: String) => {
    console.log(shop, "shop shopshop")
  }

  return (
    <div>
      <header className='sticky top-0 z-50 py-4 px-5 shadow-shadow-section bg-white'>
        <Select
          defaultValue="pawsionate.myshopify.com"
          onChange={handleSelectStore}
          options={stores.map((store: STORE) => ({value: store.shop, label: store.shop}))}
        />
      </header>
      <main>
        <section className='py-3 px-5'>
          <Table
            columns={columns}
            dataSource={datas}
            pagination={{
              pageSize: 50
            }}
            scroll={{
              y: `calc(100vh - 100px)`
            }}
          />
        </section>
      </main>
    </div>
  )
}
