import React, { useRef, useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_CONFIG } from '#/graphql/query'
import { ActionUpdate, CONFIG, DATA_VALUE } from './type'
import { Button, Table } from 'antd'

import UpdateTarget from "#/components/Settings/Target/Update"

const TYPE_TARGET = "target"

function Index() {
  const [configs, setConfigs] = useState([])
  const ref = useRef<ActionUpdate>(null)
  const {refetch} = useQuery(GET_CONFIG, {
    variables: {
      where: {
        type: {
          _eq: TYPE_TARGET
        }
      }
    },
    fetchPolicy: "cache-and-network",
    onCompleted: ({configs}: {configs: CONFIG[]}) => {
      function mappingData() {
        const results: any = []

        configs.forEach(config => {
          const item: any = {}
          const {code, data, id, type} = config
          item["code"] = code
          item["type"] = type
          item["id"] = id
          item["action"] = true
          item["data"] = data
          const {value} = data
          
          if (typeof value === "string") {
            item["label"] = value
          } else {
            const childrens: DATA_VALUE[] = []
            value.forEach(data => {
              const {id, key, label} = data

              childrens.push({
                label,
                id,
                key
              })
            })

            item.children = childrens
          }

          results.push(item)
        })
        setConfigs(results)
      }

      mappingData()
    }
  })

  function updateTarget(row: CONFIG) {
    ref.current?.action(row)
  }

  const columns = [
    {
      title: "Name",
      key: "code",
      dataIndex: "code",
      width: 200
    },
    {
      title: "Label",
      key: "label",
      dataIndex: "label",
      width: 200
    },
    {
      title: "ID",
      key: "id",
      dataIndex: "id",
      width: 200,
      render: (id: string, row: CONFIG) => {
        if (row.action) return null

        return <span>{id}</span>
      }
    },
    {
      title: "Key",
      key: "key",
      dataIndex: "key"
    },
    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: (action: boolean, row: CONFIG) => {
        if (!action) return null

        return (
          <>
            <Button onClick={() => updateTarget(row)} type='primary'>Edit</Button>
          </>
        )
      }
    }
  ]
  return (
    <div>
      <Table
        dataSource={configs}
        columns={columns}
        rowKey={"id"}
        scroll={{
          y: 'calc(100vh - 200px)'
        }}
      />
      <UpdateTarget refetch={refetch} ref={ref} />
    </div>
  )
}

export default Index