import { useMutation } from '@apollo/client'
import { Button, Form, Input, Modal, Select, message } from 'antd'
import React from 'react'

import { InsertProductType } from '#/graphql/muation'

function Index({open, setOpen, ads, refetch}: any) {
  const [form] = Form.useForm()
  const [insertProductType] = useMutation(InsertProductType)

  const handleCreate = async (values: any) => {
    
    try {
      
      const {title, description, type, value} = values
  
      await insertProductType({
        variables: {
          object: {
            title,
            description,
            type,
            value
          }
        }
      })
  
      refetch()
      message.success("Successfull !!!")
      setOpen(false)
    } catch (error) {
      message.error("Error !!!")
    }
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <Form onFinish={handleCreate} className='p-3' form={form}>
        <Form.Item
          label="Type"
          name="type"
          rules={[{required: true}]}
        >
          <Select
            options={ads.map((ad: any) => ({label: ad.name, value: ad.name}))}
          />
        </Form.Item>
        <Form.Item
          label="Name"
          name="title"
          rules={[{required: true}]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Value"
          name="value"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{required: true}]}
        >
          <Input />
        </Form.Item>
        <Button type="primary" htmlType='submit'>Ok</Button>
      </Form>
    </Modal>
  )
}

export default Index