'use client';

import React, { useEffect, useState } from 'react';

import Select from './Select';
import CSV from './CSV';

import Style from './Style';
import { useQuery } from '@apollo/client';
import { GET_TEMPLATE_ADS } from '#/graphql/query';

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

  const { refetch } = useQuery(GET_TEMPLATE_ADS, {
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

  useEffect(() => {
    refetch();
  }, []);

  return (
    <Style>
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
    </Style>
  );
}

export default Index;
