'use client';

import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';

import ProductType from '#/components/Settings/ProductType';
import Pixels from '#/components/Settings/Pixels';
import AdCopy from '#/components/Settings/AdCopy';
import Target from '#/components/Settings/Target';
import Page from '#/components/Settings/Page';
import Store from '#/components/Settings/Store';

type ModalProps = {
  open: boolean;
  setOpen: Function;
};

interface List {
  title: string;
  components: any;
}

function Index({ open, setOpen }: ModalProps) {
  const [lists, setLists] = useState<List[]>([
    { title: 'Product Type', components: <ProductType /> },
    { title: 'Template Ad Copy', components: <AdCopy /> },
    { title: 'Pixels', components: <Pixels /> },
    { title: 'Target', components: <Target /> },
    { title: 'Page', components: <Page /> },
    { title: 'Store', components: <Store /> },
  ]);

  return (
    <>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        width="90vw"
        style={{
          top: 20,
          height: 'calc(100vh - 40px)',
          overflow: 'hidden'
        }}
        footer={false}
      >
        <Tabs
          tabPosition="left"
          items={lists.map((list: List) => {
            return {
              label: `${list.title}`,
              key: list.title,
              children: list.components
            };
          })}
        />
      </Modal>
    </>
  );
}

export default Index;
