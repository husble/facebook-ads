import { Button, Form, Input, message, Modal, Space } from 'antd'
import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react'
import { ActionUpdate, CONFIG, DATA_VALUE } from './type'
import { PlusOutlined } from '@ant-design/icons'
import Client from '#/ultils/client'
import { UPSERT_CONFIG } from '#/graphql/muation'

function Index(props: any, ref: Ref<ActionUpdate>) {
  const {refetch} = props
  const [dataEdit, setData] = useState<CONFIG | null>(null)
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => ({
    action: (row) => {
      const {data} = row
      form.setFieldsValue({
        data: data.value
      })
      setData(row)
    }
  }), [])

  async function saveConfigTarget(values: {data: DATA_VALUE[]}) {
    const {data} = values
    try {
      const mappingData = data.map(value => {
        const {id, key, label} = value

        return {
          id, key, label
        }
      })

      if (!dataEdit) return
      const {id, type, code} = dataEdit
      await Client.mutate({
        mutation: UPSERT_CONFIG,
        variables: {
          object: {
            id,
            type,
            code,
            data: {
              value: mappingData
            }
          }
        }
      })
      refetch()
      message.success("Update is successfull !!!")
    } catch (error) {
      console.log(error)
      message.error("Update is error")
    }
  }
  
  return (
    <Modal
      open={Boolean(dataEdit)}
      title={`Update - ${dataEdit?.code}`}
      onCancel={() => setData(null)}
      width="90vw"
      footer={null}
    >
      <Form
        form={form}
        onFinish={saveConfigTarget}
      >
        <Form.List name="data">
          {(fields, {add, remove}) => (
            <>
              {fields.map(({key, name}) => (
                <Space key={key} style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 20px"}}>
                  <Form.Item
                    label="Label"
                    name={[name, "label"]}
                    rules={[{required: true, message: "Label is required"}]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="ID"
                    name={[name, "id"]}
                    rules={[{required: true, message: "ID is required"}]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Key"
                    name={[name, "key"]}
                    rules={[{required: true, message: "Key is required"}]}
                  >
                    <Input />
                  </Form.Item>
                  <Button onClick={() => remove(name)}>-</Button>
                </Space>
              ))}
              <Button icon={<PlusOutlined />} onClick={add}>Add Data</Button>
            </>
          )}
        </Form.List>
        <div style={{display: "flex", justifyContent: "flex-end"}}>
          <Button htmlType='submit' type='primary'>Save</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default forwardRef(Index)