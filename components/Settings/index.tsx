'use client';

import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';

import ProductType from '#/components/Settings/ProductType';
import Template from '#/components/Settings/Template';
import AdCopy from '#/components/Settings/AdCopy';

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
    { title: 'Template', components: <Template /> },
    { title: 'Template Ad Copy', components: <AdCopy /> }
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
