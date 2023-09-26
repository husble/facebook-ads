'use client';

import React, { useEffect, useState } from 'react';

import Select from './Select';
import CSV from './CSV';

import Style from './Style';
import { useQuery } from '@apollo/client';
import { GET_TEMPLATE_ADS_LIST, GET_TEMPLATE_ADS_ITEMS } from '#/graphql/query';
import List from './List';
import { Button } from 'antd';
import Create from './Create';

export interface TemplateAds {
  id: string;
  name: string;
  type: string;
}

export interface TemplateOption {
  label: string;
  value: string;
}

function Index() {
  const [currentTemplate, setCurrentTemplate] = useState<string>('');
  const [templateAds, setTemplateAds] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [templateAdsItems, setTemplateAdsItems] = useState([]);

  const { refetch } = useQuery(GET_TEMPLATE_ADS_LIST, {
    variables: {},
    onCompleted: ({ template_ads }) => {
      setTemplateAds(
        template_ads.map((t: TemplateAds) => ({
          label: `${t.name} - ${t.type}`,
          value: t.id
        }))
      );
    },
    onError: (error) => {
      console.log('%cindex.tsx line:32 error', 'color: #007acc;', error);
    },
    fetchPolicy: 'cache-and-network'
  });

  const dataTemplateAdsItems = useQuery(GET_TEMPLATE_ADS_ITEMS, {
    variables: {},
    onCompleted: ({ template_ads_item }) => {
      setTemplateAdsItems(template_ads_item);
    },
    onError: (error) => {
      console.log('%cindex.tsx line:32 error', 'color: #007acc;', error);
    },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (currentTemplate) {
      setLoading(true);

      dataTemplateAdsItems.refetch({
        id: currentTemplate
      });

      setLoading(false);
    }
  }, [currentTemplate, templateAdsItems]);

  return (
    <Style>
      <Create />
      <div className="d-flex">
        <Select
          templateAds={templateAds}
          currentTemplate={currentTemplate}
          setCurrentTemplate={setCurrentTemplate}
        />
        {currentTemplate && (
          <CSV
            currentTemplate={currentTemplate}
            setCurrentTemplate={setCurrentTemplate}
          />
        )}
      </div>
      <List templateAdsItems={templateAdsItems} loading={loading} />
    </Style>
  );
}

export default Index;
