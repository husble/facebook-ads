import { GET_PIXELS } from '#/graphql/query'
import { Button, Table } from 'antd'
import React, { useEffect, useState } from 'react'

import UpSertFbPixel from "#/components/Settings/Pixels/Upsert"
import Client from '#/ultils/client'
import { FbPixel } from '#/ultils'

function Index() {
  const [pixels, setPixels] = useState<FbPixel[]>([])
  const [pixleEdit, setPixelEdit] = useState<FbPixel | null>(null)

  const fetchData = async () => {
    const {data} = await Client.query({
      query: GET_PIXELS,
      variables: {
        where: {}
      },
      fetchPolicy: "no-cache"
    })

    setPixels(data.fb_pixels)
  }
  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Pixel Id",
      dataIndex: "pixel_id",
      key: "pixel_id"
    },
    {
      title: "Instagram",
      dataIndex: "instagram_id",
      key: "instagram_id"
    },
    {
      title: "Action",
      dataIndex: "is_modified",
      key: "is_modified",
      render: (is_modified: boolean, row: FbPixel) => {
        return (
          is_modified ? <Button type='primary' onClick={() => setPixelEdit(row)}>Edit</Button> : ""
        )
      }
    }
  ]

  return (
    <div>
      <UpSertFbPixel
        pixleEdit={pixleEdit}
        setPixelEdit={setPixelEdit}
        fetchData={fetchData}
      />
      <Table
        columns={columns}
        dataSource={pixels}
        pagination={false}
      />
    </div>
  )
}

export default Index