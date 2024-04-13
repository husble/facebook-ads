import { INSERT_TEMPLATE_ADS_COPY, UPDATE_TEMPLATE_ADS_COPY } from '#/graphql/muation';
import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, message as Noti } from 'antd'
import Client from '#/ultils/client';
import TextArea from 'antd/es/input/TextArea'

type TemplateAdCopy = {
  name: string;
  message: string;
  id: string;
}

function Index({templateEdit, setTemplateEdit, fetchData}: {templateEdit: TemplateAdCopy | null, setTemplateEdit: Function, fetchData: Function}) {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!templateEdit) {
      form.setFieldsValue({
        name: "",
        message: ""
      })
      return
    }

    const {name, message} = templateEdit

    form.setFieldsValue({
      name,
      message
    })
    setVisible(true)
  }, [templateEdit?.id])

  const upSertTemplateAdCopy = async (values: TemplateAdCopy) => {
    try {
      const {message, name} = values
      if (!templateEdit) {
        await Client.mutate({
          mutation: INSERT_TEMPLATE_ADS_COPY,
          variables: {
            object: {
              name,
              message
            }
          }
        })
        fetchData()
        setVisible(false)
        setTemplateEdit(null)
        Noti.success("Create is successfull !!!")
        return
      }
      const {id} = templateEdit
      await Client.mutate({
        mutation: UPDATE_TEMPLATE_ADS_COPY,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          _set: {
            name,
            message
          }
        }
      })
      fetchData()
      setVisible(false)
      setTemplateEdit(null)
      Noti.success("Update is successfull !!!")
    } catch (error) {
      if (!templateEdit) {
        Noti.error("Create is error !!!")
        return
      }

      Noti.error("Update is error !!!")
    }
  }

  return (
    <>
      <Button onClick={() => setVisible(true)} type='primary'>Create</Button>
      <Modal
        open={visible}
        onCancel={() => {
          setVisible(false)
          setTemplateEdit(null)
        }}
        footer={false}
      >
        <Form
          layout='vertical'
          form={form}
          onFinish={upSertTemplateAdCopy}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{required: true}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Message"
            rules={[{required: true}]}
            name="message"
          >
            <TextArea rows={5} />
          </Form.Item>
          <div>
            <Button type='primary' htmlType='submit'>{!templateEdit ? "Create" : "Update"}</Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default Index