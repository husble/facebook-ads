"use client"

import { useMutation, useQuery } from '@apollo/client';
import { Button, Input, Modal, Table, message } from 'antd'
import React, { Key, useEffect, useRef, useState } from 'react'

import { GET_SETTINGS_PRODUCT_ADS } from '#/graphql/query';
import { DeleteProductType, UpdateProductType } from '#/graphql/muation';

import AddNew from "#/components/Settings/AddNew"

type ModalProps = {
  open: boolean;
  setOpen: Function;
}

type ProductType = {
  id: number;
  title: String;
  description: String;
  value: String;
}

type Ads = {
  id: number;
  title: String;
  name: String;
  description: String;
  product_types: ProductType[]
}

function Index({open, setOpen}: ModalProps) {
  const [types, setTypes] = useState<ProductType[]>([])
  const [ads, setAds] = useState<ProductType[]>([])
  const [openAdd, setOpenAdd] = useState(false)
  const [updateProductType] = useMutation(UpdateProductType)
  const [deleteProductType] = useMutation(DeleteProductType)
  const [idEdit, setIdEdit] = useState<number>(-1)

  const nameRef: any = useRef(null)
  const descriptionRef: any = useRef(null)
  const valueRef: any = useRef(null)

  const {refetch} = useQuery(GET_SETTINGS_PRODUCT_ADS, {
    onCompleted: ({setting_product_ads}) => {

      const mappingData: ProductType[] = []
      setting_product_ads.forEach((ad: Ads) => {
        ad.product_types.forEach((product_type: ProductType) => {
          const {description, title, id, value} = product_type
          mappingData.push({
            title,
            description,
            id,
            value
          })
        })
      })

      setTypes(mappingData)
      setAds(setting_product_ads)
    },
    fetchPolicy: "cache-and-network"
  })

  const handleUpdateProductType = async (e: any) => {
    const title = nameRef.current.input.value
    const description = descriptionRef.current.input.value
    const value = valueRef.current.input.value

    if (!title || !description) {
      message.error("Please input title and description")

      return
    }

    try {
      
      await updateProductType({
        variables: {
          id: idEdit,
          _set: {
            title,
            description,
            value
          }
        }
      })

      refetch()
      message.success("Successfull !!!")
      setIdEdit(-1)
    } catch (error) {
      message.error("Error !!!")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProductType({
        variables: {
          id
        }
      })

      refetch()
      message.success("Successfull !!!")
    } catch (error) {
      message.error("Error !!!")
    }
  }

  const columns = [
    {
      title: "Name",
      key: "title",
      dataIndex: "title",
      render: (title: string, row: ProductType) => {
        const {id} = row
        
        if (id === idEdit) return <Input required ref={nameRef} defaultValue={title} />

        return <p>{title}</p>
      }
    },
    {
      title: "Value",
      key: "value",
      dataIndex: "value",
      render: (value: string, row: ProductType) => {
        const {id} = row
        
        if (id === idEdit) return <Input ref={valueRef} defaultValue={value} />

        return <p>{value}</p>
      }
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
      render: (description: string, row: ProductType) => {
        const {id} = row
        
        if (id === idEdit) return <Input required ref={descriptionRef} defaultValue={description} />

        return <p>{description}</p>
      }
    },
    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: (_: any, row: ProductType) => (
        <>
          {row.id === idEdit ? (
            <Button onClick={handleUpdateProductType} type='primary'>Update</Button>
          ) : (
            <Button onClick={() => setIdEdit(row.id)} type='primary'>Edit</Button>
          )}
          <Button onClick={() => handleDelete(row.id)} className='ml-2' type='primary'>Delete</Button>
        </>
      )
    }
  ]
  
  return (
    <>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        width="90vw"
      > 
        <div className='p-3'>
          <div className='flex justify-end'>
            <Button type='primary' onClick={() => setOpenAdd(true)}>Add New</Button>
          </div>
          <Table
            columns={columns}
            dataSource={types}
          />
        </div>
      </Modal>
      <AddNew
        open={openAdd}
        setOpen={setOpenAdd}
        ads={ads}
        refetch={refetch}
      />
    </>
  )
}

export default Index