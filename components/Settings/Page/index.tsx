import { Button, message, Popconfirm, Table } from 'antd';
import React, { useEffect, useState } from 'react'

import UpSertPage from '#/components/Settings/Page/Upsert'
import Client from '#/ultils/client';
import { GET_CONFIG } from '#/graphql/query';
import { PAGES } from '#/ultils/config';
import { UPSERT_CONFIG_BY_TYPE_CODE } from '#/graphql/muation';

export interface Page {
  label: String;
  value: string;
}

export interface PagEdit extends Page  {
  index: number;
}

export const PAGE_TYPE = "fb_ads"
export const PAGE_CODE = "pages"

function Index() {
  const [pages, setPage] = useState<Page[]>([])

  const [pageEdit, setPageEdit] = useState<PagEdit & {} | null>(null)

  const fetchData = async () => {
    try {
      const {data: {configs}} = await Client.query({
        query: GET_CONFIG,
        variables: {
          where: {
            type: {
              _eq: PAGE_TYPE
            },
            code: {
              _eq: PAGE_CODE
            }
          }
        },
        fetchPolicy: "no-cache"
      })
      const pages = configs[0].data.value
      if (!pages) throw "Pages Config is not found"
      setPage(pages)
    } catch (error) {
      return PAGES
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const deletePage = async (index: number) => {
    try {
      const new_datas = [...pages]
      new_datas.splice(index, 1)
      await Client.mutate({
        mutation: UPSERT_CONFIG_BY_TYPE_CODE,
        variables: {
          object: {
            type: PAGE_TYPE,
            code: PAGE_CODE,
            data: {
              value: new_datas
            }
          }
        }
      })
      fetchData()
    } catch (error) {
      message.warning("Delete page is error !!!")
    }
  }
  
  const columns = [
    {
      title: "Name",
      dataIndex: "label",
      key: "label"
    },
    {
      title: "Page Id",
      dataIndex: "value",
      key: "page_id"
    },
    {
      title: "Action",
      dataIndex: "_",
      key: "_",
      render: (_: unknown, row: Page) => {
        const {label, value} = row
        const index = pages.findIndex(page => page.value === value)
        return (
          <>
            <Button onClick={() => setPageEdit({label, value, index})} type='primary'>Edit</Button>
            <Popconfirm title="Please confirm" onConfirm={() => deletePage(index)}>
              <Button style={{marginLeft: 10}} type='dashed'>Delete</Button>
            </Popconfirm>
          </>
        )
      }
    }
  ]

  return (
    <div>
      <UpSertPage
        pageEdit={pageEdit}
        setPageEdit={setPageEdit}
        fetchData={fetchData}
        pages={pages}
      />
      <Table
        columns={columns}
        dataSource={pages}
        pagination={false}
        scroll={{
          y: 'calc(100vh - 200px)'
        }}
      />
    </div>
  )
}

export default Index