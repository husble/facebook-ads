'use client';

import { useMutation, useQuery } from '@apollo/client';
import { Button, Input, Table, message } from 'antd';
import React, { ChangeEvent, Key, useEffect, useRef, useState } from 'react';

import {
  GET_SETTINGS_PRODUCT_ADS,
  GET_SETTINGS_PRODUCT_TYPES
} from '#/graphql/query';
import { DeleteProductType, UpdateProductType } from '#/graphql/muation';
import debounce from 'lodash.debounce';

import AddNew from '#/components/Settings/ProductType/AddNew';

type ModalProps = {
  open: boolean;
  setOpen: Function;
};

type ProductType = {
  id: number;
  title: String;
  description: String;
  value: String;
};

type Ads = {
  id: number;
  title: String;
  name: String;
  description: String;
  product_types: ProductType[];
};

const LIMIT = 10;

function Index() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [ads, setAds] = useState<ProductType[]>([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [updateProductType] = useMutation(UpdateProductType);
  const [deleteProductType] = useMutation(DeleteProductType);
  const [idEdit, setIdEdit] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const nameRef: any = useRef(null);
  const descriptionRef: any = useRef(null);
  const valueRef: any = useRef(null);
  const queries = useRef({
    where: {},
    limit: LIMIT,
    offset: 0
  });

  useQuery(GET_SETTINGS_PRODUCT_ADS, {
    onCompleted: ({ setting_product_ads }) => {
      setAds(setting_product_ads);
    }
  });

  const { refetch } = useQuery(GET_SETTINGS_PRODUCT_TYPES, {
    variables: {
      ...queries.current
    },
    onCompleted: ({ setting_product_type, setting_product_type_aggregate }) => {
      setTypes(setting_product_type);
      setTotal(setting_product_type_aggregate.aggregate.count);
      setLoading(false);
    },
    fetchPolicy: 'cache-and-network'
  });

  const handleGetNewData = () => {
    refetch({
      ...queries.current
    });
  };

  const handleUpdateProductType = async (e: any) => {
    const title = nameRef.current.input.value;
    const description = descriptionRef.current.input.value;
    const value = valueRef.current.input.value;

    if (!title || !description) {
      message.error('Please input title and description');

      return;
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
      });

      refetch({
        where: {}
      });
      message.success('Successfull !!!');
      setIdEdit(-1);
    } catch (error) {
      message.error('Error !!!');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProductType({
        variables: {
          id
        }
      });

      refetch({
        where: {}
      });
      message.success('Successfull !!!');
    } catch (error) {
      message.error('Error !!!');
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'title',
      dataIndex: 'title',
      render: (title: string, row: ProductType) => {
        const { id } = row;

        if (id === idEdit)
          return <Input required ref={nameRef} defaultValue={title} />;

        return <p>{title}</p>;
      }
    },
    {
      title: 'Value',
      key: 'value',
      dataIndex: 'value',
      render: (value: string, row: ProductType) => {
        const { id } = row;

        if (id === idEdit) return <Input ref={valueRef} defaultValue={value} />;

        return <p>{value}</p>;
      }
    },
    {
      title: 'Description',
      key: 'description',
      dataIndex: 'description',
      render: (description: string, row: ProductType) => {
        const { id } = row;

        if (id === idEdit)
          return (
            <Input required ref={descriptionRef} defaultValue={description} />
          );

        return <p>{description}</p>;
      }
    },
    {
      title: '',
      key: 'action',
      dataIndex: 'action',
      render: (_: any, row: ProductType) => (
        <>
          {row.id === idEdit ? (
            <Button onClick={handleUpdateProductType} type="primary">
              Update
            </Button>
          ) : (
            <Button onClick={() => setIdEdit(row.id)} type="primary">
              Edit
            </Button>
          )}
          <Button
            onClick={() => handleDelete(row.id)}
            className="ml-2"
            type="primary"
          >
            Delete
          </Button>
        </>
      )
    }
  ];

  const handleSearch = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLoading(true);
    const new_queries = {
      ...queries.current,
      where: {
        title: {
          _ilike: `%${value}%`
        }
      },
      offset: 0,
      limit: LIMIT
    };

    queries.current = new_queries;
    setPage(1);
    handleGetNewData();
  }, 300);

  const handleChangePage = (page: number) => {
    setLoading(true);
    const new_queries = {
      ...queries.current,
      offset: (page - 1) * LIMIT
    };

    queries.current = new_queries;
    handleGetNewData();
    setPage(page);
  };

  return (
    <>
      <div className="p-3 h-5/6">
        <div className="flex justify-end">
          <Input
            width={400}
            className="w-[400px] inline-block"
            style={{ width: '400px !important' }}
            allowClear
            onChange={handleSearch}
          />
          <Button type="primary" onClick={() => setOpenAdd(true)}>
            Add New
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={types}
          loading={loading}
          pagination={{
            total,
            current: page,
            onChange: handleChangePage
          }}
          scroll={{
            y: 'calc(100vh - 240px)'
          }}
        />
      </div>
      <AddNew open={openAdd} setOpen={setOpenAdd} ads={ads} refetch={refetch} />
    </>
  );
}

export default Index;
