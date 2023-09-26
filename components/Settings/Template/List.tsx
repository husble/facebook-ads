import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Modal, Table, message } from 'antd';

import {
  DeleteTemplateAdsItem,
  InsertTemplateAdsItem
} from '#/graphql/muation';
import { useState } from 'react';

const Index = ({
  templateAdsItems,
  loading,
  refetch,
  fetchTemplateAdsItems
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [type, setType] = useState<string>('image');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleChange = (value: string) => {
    setType(value);
  };

  const [deleteTemplateAdsItem] = useMutation(DeleteTemplateAdsItem);
  const [insertTemplateAdsItem] = useMutation(InsertTemplateAdsItem);

  const stringArray: string[] = [
    'ad_name',
    'ad_status',
    'additional_custom_tracking_specs',
    'body',
    'call_to_action',
    'conversion_tracking_pixels',
    'creative_type',
    'image_file_name',
    'image_hash',
    'instagram_account_id',
    'instagram_preview_link',
    'link',
    'link_description',
    'link_object_id',
    'optimize_text_per_person',
    'optimized_ad_creative',
    'permalink',
    'preview_link',
    'url_tags',
    'use_page_as_actor',
    'video_retargeting',
    'video_file_name',
    'video_id',
    'ad_set_bid_strategy',
    'ad_set_daily_budget',
    'ad_set_lifetime_budget',
    'ad_set_lifetime_impressions',
    'ad_set_name',
    'ad_set_run_status',
    'ad_set_time_start',
    'age_max',
    'age_min',
    'attribution_spec',
    'billing_event',
    'brand_safety_inventory_filtering_levels',
    'countries',
    'destination_type',
    'flexible_inclusions',
    'gender',
    'location_types',
    'optimization_goal',
    'optimized_conversion_tracking_pixels',
    'optimized_event',
    'use_accelerated_delivery',
    'buying_type',
    'campaign_name',
    'campaign_objective',
    'campaign_start_time',
    'campaign_status',
    'new_objective',
    'Action'
  ];

  const columns = stringArray.map((s: string) => ({
    title: s,
    key: s,
    dataIndex: s,
    render: (pr: String, row: any) => {
      if (s === 'Action') {
        return (
          <div style={{ cursor: 'pointer' }}>
            <DeleteOutlined
              onClick={async () => {
                await deleteTemplateAdsItem({
                  variables: {
                    id: row.id
                  }
                });

                fetchTemplateAdsItems();
                refetch();
                message.success('Delete Template Success');
              }}
            />
            <CopyOutlined
              className="mx-3"
              color="blue"
              onClick={async () => {
                const data = { ...row };

                delete data['id'];
                delete data['__typename'];

                await insertTemplateAdsItem({
                  variables: {
                    objects: [{ ...data }]
                  }
                });

                fetchTemplateAdsItems();
                refetch();
                message.success('Clone Template Success');
              }}
            />

            <EditOutlined
              onClick={() => {
                setIsModalOpen(!isModalOpen);
              }}
            />
          </div>
        );
      }
      return <div>{pr}</div>;
    }
  }));

  return (
    <div>
      <Modal
        title="Update Template Ads Items"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        Update Template Ads Item Waiting !!!
      </Modal>
      <Table
        columns={columns}
        dataSource={templateAdsItems}
        // rowSelection={rowSelection}
        pagination={{
          pageSize: 25
        }}
        scroll={{
          x: 'max-content'
        }}
        loading={loading}
      />
    </div>
  );
};

export default Index;
