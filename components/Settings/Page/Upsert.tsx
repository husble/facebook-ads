import React, { useEffect, useState } from 'react'
import { Page, PAGE_CODE, PAGE_TYPE, PagEdit } from '.'
import { Button, Form, Input, message, Modal } from 'antd';
import Client from '#/ultils/client';
import { UPSERT_CONFIG_BY_TYPE_CODE } from '#/graphql/muation';

type PageProps = {
  pageEdit: PagEdit | null;
  setPageEdit: Function;
  fetchData: Function;
  pages: Page[]
}

function Index({pageEdit, setPageEdit, fetchData, pages}: PageProps) {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!pageEdit) {
      form.setFieldsValue({
        label: "",
        value: "",
      })
      return
    }

    const {label, value} = pageEdit

    form.setFieldsValue({
      label,
      value,
    })
    setVisible(true)
  }, [pageEdit?.value])

  const upSertPage = async (values: Page) => {
    try {
      const {value, label} = values
      const new_datas = [...pages]
      if (!pageEdit) {
        new_datas.push({value, label})
      } else {
        const {index} = pageEdit
        new_datas[index] = {label, value}
      }
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
      setVisible(false)
      setPageEdit(null)
      message.success("Update is successfull !!!")
    } catch (error) {
      if (!pageEdit) {
        message.error("Create is error !!!")
        return
      }

      message.error("Update is error !!!")
    }
  }

  return (
    <div>
      <Button onClick={() => setVisible(true)} type='primary'>Create</Button>
      <Modal
        open={visible}
        onCancel={() => {
          setVisible(false)
          setPageEdit(null)
        }}
        footer={false}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={upSertPage}
        >
          <Form.Item
            label="Name"
            name="label"
            rules={[{required: true}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Page Id"
            rules={[{required: true}]}
            name="value"
          >
            <Input />
          </Form.Item>
          <div>
            <Button type='primary' htmlType='submit'>{!pageEdit ? "Create" : "Update"}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Index