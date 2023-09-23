'use client';

import { useQuery } from '@apollo/client';
import { Button, Input, Select, Table, Tag } from 'antd';
import { ChangeEvent, Key, useRef, useState } from 'react';
import Image from 'next/image';
import debounce from 'lodash.debounce';
import { FilterOutlined } from '@ant-design/icons';

import { GET_PRODUCT_ADS, GET_STORES } from '#/graphql/query';
import Settings from '#/components/Settings';
import Step2 from '#/components/Step2';
import withAuth from '#/ultils/withAuth';
import ModalImage from '#/components/ShowImage';
import Filter from '#/components/Filter';
import moment from 'moment';

const LIMIT = 25;

type STORE = {
  id: Key;
  shop: String;
  timezone: String;
  name: String;
};

type Product = {
  store_id: String;
  product_id: String;
  handle: String;
  title: String;
  name_ads_account: String;
  vendor: String;
  pr: String;
  link: String;
  product_typ: String;
  image_url: String;
  key: number;
  template_name?: string;
  template_type?: string;
  template_user?: string;
  template_account?: string;
  created_at_string: string;
};

type ProductType = {
  title: String;
};

function Home() {
  const [stores, setStores] = useState<STORE[]>([]);
  const [open, setOpen] = useState(false);
  const [openStep2, setOpenStep2] = useState(false);
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [image_url, setImageUrl] = useState<string>('');
  const [storeCurrent, setStoreCurrent] = useState<Number>(200);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [paramsProductType, setParamsProductType] = useState<string>('');
  const [paramsCreatedAt, setParamsCreatedAt] = useState<
    Record<string, string>
  >({ _lte: '', _gte: '' });

  const queries = useRef({
    where: {
      store_id: { _eq: 200 }
    },
    limit: LIMIT,
    offset: 0
  });
  const [selecteds, setSelecteds] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);

  useQuery(GET_STORES, {
    onCompleted: ({ store_2 }) => {
      setStores(store_2);
    }
  });

  const { refetch } = useQuery(GET_PRODUCT_ADS, {
    variables: {
      ...queries.current
    },
    onCompleted: ({ product_ads, product_ads_aggregate, product_types }) => {
      setAds(product_ads);
      setTotal(product_ads_aggregate.aggregate.count);
      setLoading(false);
      setProductTypes(
        product_types.map(
          (t: ProductType) => t.title !== '' && { title: t.title }
        )
      );
    },
    fetchPolicy: 'cache-and-network'
  });

  const handleShowImage = (image_url: string) => {
    setImageUrl(image_url);
  };

  const columns = [
    {
      title: 'Image',
      key: 'image_url',
      dataIndex: 'image_url',
      render: (image_url: string) => {
        if (image_url)
          return (
            <Image
              className="cursor-pointer"
              onClick={() => handleShowImage(image_url)}
              width={40}
              height={40}
              alt="image"
              src={image_url}
            />
          );

        return null;
      }
    },
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      render: (title: string, row: Product) => {
        return (
          <a target="_blank" href={`${row.link}`}>
            <div>{title}</div>
            <Tag color="red">
              {moment(row.created_at_string).format('DD/MM/YYYY mm:hh')}
            </Tag>
          </a>
        );
      }
    },
    {
      title: 'PR',
      key: 'pr',
      dataIndex: 'pr',
      render: (pr: String) => <Tag color="blue">{pr}</Tag>
    },
    {
      title: 'Product Type',
      key: 'product_type',
      dataIndex: 'product_type',
      render: (pr: String) => <Tag color="red">{pr}</Tag>
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: string) => (
        <>
          {tags?.split(', ').map((tag: string) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </>
      )
    }
  ];

  const handleGetNewData = () => {
    refetch({
      ...queries.current
    });
  };

  const handleSelectStore = (shop: String) => {
    const matchedStore = stores.find((s: STORE) => s.shop === shop);

    setLoading(true);

    if (matchedStore) {
      const storeId = matchedStore.id;
      const new_queries: any = {
        ...queries.current,
        where: {
          ...queries.current.where,
          store_id: {
            _eq: storeId
          }
        },
        offset: 0,
        limit: LIMIT
      };

      queries.current = new_queries;

      handleGetNewData();

      setLoading(false);
    } else {
      // Handle the case where no matching store was found
      setLoading(false);
      console.log('No matching store found for shop:', shop);
    }
  };

  const onSelectChange = (_: React.Key[], selectedRows: Product[]) => {
    setSelecteds(selectedRows);
  };

  const rowSelection = {
    selections: selecteds,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true
  };

  const handleFilterAds = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const value = e?.target?.value;
    setLoading(true);

    const params: any = [];

    if (value) {
      ['title', 'pr', 'name_ads_account', 'tags'].map((s: string) => {
        params.push({
          [s]: {
            _ilike: `%${value}%`
          }
        });
      });
    }

    if (paramsProductType || value) {
      params.push({
        product_type: {
          _ilike: `%${paramsProductType ? paramsProductType : value}%`
        }
      });
    }

    if (paramsCreatedAt['_lte']) {
      params.push({
        created_at_string: {
          _lte: moment(paramsCreatedAt['_lte']).toISOString(true),
          _gte: moment(paramsCreatedAt['_gte']).toISOString(true)
        }
      });
    }

    const new_queries: any = {
      ...queries.current,
      where: {
        _or: [...params]
      },
      offset: 0,
      limit: LIMIT
    };

    queries.current = new_queries;
    setPage(1);
    handleGetNewData();
  }, 300);

  const handleChangePge = (page: number) => {
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
    <div>
      <header className="sticky top-0 z-50 py-4 px-5 shadow-shadow-section bg-white flex justify-between flex-wrap">
        <Select
          defaultValue="pawsionate.myshopify.com"
          onChange={handleSelectStore}
          options={stores.map((store: STORE) => ({
            value: store.shop,
            label: store.shop
          }))}
        />
        <Input
          allowClear
          className="w-[400px] inline-block"
          style={{ width: '400px !important' }}
          onChange={handleFilterAds}
        />
        <div>
          <Button
            className="mx-4"
            onClick={() => {
              setOpenFilter(!openFilter);
            }}
          >
            <FilterOutlined />
          </Button>
          <Button
            disabled={selecteds.length === 0 ? true : false}
            onClick={() => setOpenStep2(true)}
            type="primary"
            className="mr-4"
          >
            Next Step
          </Button>
          <span
            onClick={() => setOpen(!open)}
            className="cursor-pointer font-bold text-black"
          >
            Settings
          </span>
        </div>
      </header>
      <main>
        {selecteds.length ? (
          <div className="px-5">
            <Tag color="orange">Selected {selecteds.length} items</Tag>
          </div>
        ) : null}
        <section className="px-5">
          <Table
            columns={columns}
            dataSource={ads}
            rowSelection={rowSelection}
            loading={loading}
            pagination={{
              pageSize: 50,
              current: page,
              total,
              onChange: handleChangePge
            }}
          />
        </section>
      </main>
      <Filter
        open={openFilter}
        setOpen={setOpenFilter}
        productTypes={productTypes}
        setParamsProductType={setParamsProductType}
        handleFilterAds={handleFilterAds}
        setParamsCreatedAt={setParamsCreatedAt}
      />
      <Settings open={open} setOpen={setOpen} />
      <Step2 ads={selecteds} open={openStep2} setOpen={setOpenStep2} />
      <ModalImage setImageUrl={setImageUrl} image_url={image_url} />
    </div>
  );
}

export default Home;
