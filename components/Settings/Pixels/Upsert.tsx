import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, message } from 'antd'
import Client from '#/ultils/client';
import { INSERT_FB_PIXEL, UPDATE_FB_PIXEL } from '#/graphql/muation';
import { FbPixel } from '#/ultils';

function Index({pixleEdit, setPixelEdit, fetchData}: {pixleEdit: FbPixel | null, setPixelEdit: Function, fetchData: Function}) {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!pixleEdit) {
      form.setFieldsValue({
        name: "",
        pixel_id: "",
        instagram_id: ""
      })
      return
    }

    const {name, pixel_id, instagram_id} = pixleEdit

    form.setFieldsValue({
      name,
      pixel_id,
      instagram_id
    })
    setVisible(true)
  }, [pixleEdit?.pixel_id])

  const upSertTemplateAdCopy = async (values: FbPixel) => {
    try {
      const {pixel_id, name, instagram_id} = values
      if (!pixleEdit) {
        await Client.mutate({
          mutation: INSERT_FB_PIXEL,
          variables: {
            object: {
              name,
              pixel_id,
              instagram_id
            }
          }
        })
        fetchData()
        setVisible(false)
        setPixelEdit(null)
        message.success("Create is successfull !!!")
        return
      }
      const {id} = pixleEdit
      await Client.mutate({
        mutation: UPDATE_FB_PIXEL,
        variables: {
          where: {
            id: {
              _eq: id
            }
          },
          _set: {
            name,
            pixel_id,
            instagram_id
          }
        }
      })
      fetchData()
      setVisible(false)
      setPixelEdit(null)
      message.success("Update is successfull !!!")
    } catch (error) {
      if (!pixleEdit) {
        message.error("Create is error !!!")
        return
      }

      message.error("Update is error !!!")
    }
  }

  return (
    <>
      <Button onClick={() => setVisible(true)} type='primary'>Create</Button>
      <Modal
        open={visible}
        onCancel={() => {
          setVisible(false)
          setPixelEdit(null)
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
            label="Pixel Id"
            rules={[{required: true}]}
            name="pixel_id"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Instagram"
            rules={[{required: true}]}
            name="instagram_id"
          >
            <Input />
          </Form.Item>
          <div>
            <Button type='primary' htmlType='submit'>{!pixleEdit ? "Create" : "Update"}</Button>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default Index