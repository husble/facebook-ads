'use client';

import { GET_PRODUCT_ADS, GET_STORES } from '#/graphql/query';
import { useQuery } from '@apollo/client';
import { Select, Table, Tag } from 'antd';
import { Key, useRef, useState } from 'react';

import Settings from '#/components/Settings';
import withAuth from '#/ultils/withAuth';

const { Option } = Select;

type STORE = {
  id: Key;
  shop: String;
  timezone: String;
  name: String;
};

type Tag = {
  id: number;
  title: String;
};

type Product = {
  store_id: String;
  product_id: String;
  handle: String;
  title: String;
  name_ads_account: String;
  vendor: String;
  product_ads_tags: Tag[];
};
function Home() {
  const [stores, setStores] = useState<STORE[]>([]);
  const [open, setOpen] = useState(false);
  const [ads, setAds] = useState([]);
  const queries = useRef({});

  useQuery(GET_STORES, {
    onCompleted: ({ store_2 }) => {
      setStores(store_2);
    }
  });

  useQuery(GET_PRODUCT_ADS, {
    variables: {
      where: queries.current
    },
    onCompleted: ({ product_ads }) => {
      setAds(product_ads);
    }
  });

  const columns = [
    {
      title: 'Date',
      key: 'date',
      dataIndex: 'date'
    },
    {
      title: 'Camp',
      key: 'name_ads_account',
      dataIndex: 'name_ads_account'
    },
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      render: (title: string, row: Product) => {
        const vendor = row.vendor?.replaceAll(' ', '').toLowerCase();
        return (
          <a
            target="_blank"
            href={`https://admin.shopify.com/store/${vendor}/products/${row.product_id}`}
          >
            {title}
          </a>
        );
      }
    },
    {
      title: 'PR',
      key: 'product_ads_tags',
      dataIndex: 'product_ads_tags',
      render: (product_ads_tags: Tag[]) => {
        const PR = product_ads_tags.find(
          (adsTag: Tag) => adsTag.title.indexOf('PR') !== -1
        )?.title;

        if (!PR) return null;
        return <Tag color="blue">{PR}</Tag>;
      }
    },
    {
      title: 'Tags',
      key: 'product_ads_tags',
      dataIndex: 'product_ads_tags',
      render: (product_ads_tags: Tag[]) => (
        <>
          {product_ads_tags.map((tag: Tag) => (
            <Tag key={tag.id} color="blue">
              {tag.title}
            </Tag>
          ))}
        </>
      )
    }
  ];

  const handleSelectStore = (shop: String) => {
    console.log(shop, 'shop shopshop');
  };

  return (
    <div>
      <header className="sticky top-0 z-50 py-4 px-5 shadow-shadow-section bg-white flex justify-between">
        <Select
          defaultValue="pawsionate.myshopify.com"
          onChange={handleSelectStore}
          options={stores.map((store: STORE) => ({
            value: store.shop,
            label: store.shop
          }))}
        />
        <div>
          <span onClick={() => setOpen(!open)} className="cursor-pointer">
            Settings
          </span>
        </div>
      </header>
      <main>
        <section className="py-3 px-5">
          <Table
            columns={columns}
            dataSource={ads}
            pagination={{
              pageSize: 50
            }}
            scroll={{
              y: `calc(100vh - 100px)`
            }}
          />
        </section>
      </main>
      <Settings open={open} setOpen={setOpen} />
    </div>
  );
}

export default Home;
