'use client';

import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Checkbox, Input, message, Select, Table, Tag } from 'antd';
import { ChangeEvent, Key, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import debounce from 'lodash.debounce';
import { FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

import { GET_PRODUCT_ADS, GET_STORES } from '#/graphql/query';
import Settings from '#/components/Settings';
import Step2 from '#/components/Step2';
import withAuth from '#/ultils/withAuth';
import ModalImage from '#/components/ShowImage';
import Filter from '#/components/Filter';
import { UserContext } from '#/components/UserContext';
import { getRecordId, Product } from '#/ultils';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { STORE } from '#/components/Settings/Store';

const LIMIT = 25;

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
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [seachValue, setSearchValue] = useState<string>("")
  const [searchs, setSearch] = useState<string[]>([])
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [paramsProductType, setParamsProductType] = useState<string>('');
  const [selecteds, setSelecteds] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [view_record, setViewRecord] = useState<string>("")
  const storeSearch = useRef<string[]>([])
  const isVideo = useRef<boolean>(false)
  const [paramsCreatedAt, setParamsCreatedAt] = useState<
    Record<string, string>
  >({ _lte: '', _gte: '' });
  const { user } = useContext(UserContext);
  const storeRef = useRef<number>(200);
  const queries = useRef({
    where: {
      _and: {
        store_id: { _eq: 200 }
      }
    },
    limit: LIMIT,
    offset: 0
  });

  useQuery(GET_STORES, {
    onCompleted: ({ store_2 }: {store_2: STORE[]}) => {
      const datas = store_2.filter(store => !!store.status_ads)
      setStores(datas)
    }
  });

  const [fetchAds]: any = useLazyQuery(GET_PRODUCT_ADS, {
    onCompleted: ({
      product_ads,
      product_ads_aggregate,
      product_types
    }: any) => {
      setAds(product_ads);
      setTotal(product_ads_aggregate.aggregate.count);
      setLoading(false);
      setProductTypes(product_types);
    },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    setLoading(true)
    fetchAds({
      variables: {
        ...queries.current
      }
    })
  }, [])

  const handleShowImage = (image_url: string) => {
    setImageUrl(image_url);
  };

  const chooseVideo = (e: CheckboxChangeEvent) => {
    const {checked} = e.target
    isVideo.current = checked

    handleFilterAds()
  }

  const viewRecord = async (tags: string, product_id: string) => {
    const record_id = getRecordId(tags) || ""
    try {
      setViewRecord(product_id)
      const {data: {record_url}} = await axios({
        method: "GET",
        url: process.env.FACEBOOK_API + "/larksuite/record/" + record_id
      })
      window.open(record_url, "_blank")
      setViewRecord("")
    } catch (error) {
      setViewRecord("")
      message.error("Error !!!, please contact admin")
    }
  }

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
      title: <Checkbox onChange={chooseVideo}>Video</Checkbox>,
      key: 'is_video',
      dataIndex: 'is_video',
      render: (is_video: boolean) => {
        if (!is_video) return null;
        return <Tag color="green">Video</Tag>;
      }
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
    },
    {
      title: '',
      key: "record",
      render: (_: any, row: Product) => <Button loading={view_record === row["product_id"]} onClick={() => viewRecord(row["tags"], row["product_id"])} type='dashed'>View Record</Button>
    }
  ];

  const handleGetNewData = () => {
    setLoading(true)
    fetchAds({
      variables: {
        ...queries.current
      }
    });
  };

  const handleSelectStore = (shop: String) => {
    const matchedStore = stores.find((s: STORE) => s.shop === shop);

    if (matchedStore) {
      const storeId = matchedStore.id as number;
      storeRef.current = storeId;
      handleFilterAds()

      // setLoading(false);
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
    preserveSelectedRowKeys: true,
    selectedRowKeys: selecteds.map(slect => slect.product_id)
  };
  function handleFilterAds() {
    setLoading(true);
    const params: any = {};
    const datas = storeSearch.current.map(search => {
      const a = ['title', 'pr', 'name_ads_account', 'tags'].map((s: string) => {
        return ({
          [s]: {
            _iregex: `${search}`
          }
        });
      });
      return {
        _or: a
      }
    })
    if (paramsProductType) {
      params.product_type = {
        _ilike: `%${paramsProductType}%`
      }
    }

    if (paramsCreatedAt['_lte']) {
      params.created_at_string = {
        _lte: moment(paramsCreatedAt['_lte']).toISOString(true),
        _gte: moment(paramsCreatedAt['_gte']).toISOString(true)
      }
    }

    if (isVideo.current) {
      params.is_video = {
        _eq: true
      }
    }

    const new_queries: any = {
      ...queries.current,
      where: {
        store_id: {
          _eq: storeRef.current
        },
        _and: datas,
        ...params
        // _or: params[0] ? [...params] : [{ title: { _ilike: '%%' } }]
      },
      offset: 0,
      limit: LIMIT
    };

    queries.current = new_queries;
    setPage(1);
    handleGetNewData();
  }

  const onSearch = (value: string) => {
    if (!value) return

    const newSearchs = [...searchs]
    newSearchs.push(value)
    storeSearch.current = newSearchs
    handleFilterAds()
    setSearch(newSearchs)
    setSearchValue("")
  }

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

  const changeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    setSearchValue(value)
  }

  const removeSearch = (seachValue: string) => {
    const newSearch = [...searchs]
    const findIndex = searchs.findIndex(search => search === seachValue)
    newSearch.splice(findIndex, 1)
    storeSearch.current = newSearch
    handleFilterAds()
    setSearch(newSearch)
  }

  return (
    <div>
      <header className="sticky top-0 z-50 py-4 px-5 shadow-shadow-section bg-white flex justify-between flex-wrap">
        <Select
          defaultValue={stores[0]?.label || ""}
          onChange={handleSelectStore}
          options={stores.map((store: STORE) => ({
            value: store.shop,
            label: store.label
          }))}
          key={stores[0]?.label || ""}
          style={{minWidth: 200}}
        />
        <Input.Search
          allowClear
          className="!w-[400px] inline-block"
          onSearch={onSearch}
          value={seachValue}
          onChange={changeSearch}
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
      <div className='py-4 px-5 sticky top-20 z-50 bg-white'>
        {searchs.map(search => (
          <span className='bg-black text-white px-3 py-1 rounded mr-2'>
            <span>{search}</span>
            <span onClick={() => removeSearch(search)} className='ml-2 cursor-pointer'>x</span>
          </span>
        ))}
      </div>
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
              pageSize: 25,
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
      <Step2 stores={stores} storeId={storeRef.current} ads={selecteds} open={openStep2} setOpen={setOpenStep2} setSelecteds={setSelecteds} />
      <ModalImage setImageUrl={setImageUrl} image_url={image_url} />
    </div>
  );
}

export default withAuth(Home);
