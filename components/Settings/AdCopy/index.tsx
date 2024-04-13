import { Button, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import Client from '#/ultils/client';
import { GET_TEMPLATE_ADS_COPY } from '#/graphql/query';

import UpSertTemp from "#/components/Settings/AdCopy/UpSert"

type TemplateAdCopy = {
  id: string;
  name: string;
  message: string;
}

function Index() {
  const [templates, setTemplate] = useState<TemplateAdCopy[]>([])
  const [templateEdit, setTemplateEdit] = useState<TemplateAdCopy | null>(null)
  const fetchData = async () => {
    const {data} = await Client.query({
      query: GET_TEMPLATE_ADS_COPY,
      fetchPolicy: "no-cache"
    })

    setTemplate(data.template_ads_copy)
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
      title: "Message",
      dataIndex: "message",
      key: "message"
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_: any, row: TemplateAdCopy) => <Button onClick={() => setTemplateEdit(row)}>Edit</Button>
    }
  ]

  return (
    <div>
      <UpSertTemp
        templateEdit={templateEdit}
        setTemplateEdit={setTemplateEdit}
        fetchData={fetchData}
      />
      <Table
        columns={columns}
        dataSource={templates}
        pagination={false}
      />
    </div>
  )
}

export default Index