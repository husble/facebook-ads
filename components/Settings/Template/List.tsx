import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Form, Input, Modal, Table, message } from 'antd';

import {
  DeleteTemplateAdsItem,
  InsertTemplateAdsItem,
  UpdateTemplateAdsItem
} from '#/graphql/muation';
import { useRef, useState } from 'react';
import { GET_TEMPLATE_ADS_ITEM } from '#/graphql/query';

const Index = ({
  templateAdsItems,
  loading,
  refetch,
  fetchTemplateAdsItems
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [dataEdit, setDataEdit]: any = useState({})
  const [type, setType] = useState<string>('image');
  const [form] = Form.useForm()
  const idEdit: any = useRef(null)
  const [getTemplateItem]: any = useLazyQuery(GET_TEMPLATE_ADS_ITEM)
  const [edit] = useMutation(UpdateTemplateAdsItem) 
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

  const handleEdit = async (id: string) => {
    const {data: {template_ads_item_by_pk}} = await getTemplateItem({
      variables: {
        id
      }
    })

    const {__typename, template_ads_id, id: idItem, ...data} = template_ads_item_by_pk
    idEdit.current = id
    setDataEdit(data)
  }

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
                handleEdit(row.id)
                setIsModalOpen(true);
              }}
            />
          </div>
        );
      }
      return <div>{pr}</div>;
    }
  }));

  const handleFinish = async (values: any) => {
    try {
      await edit({
        variables: {
          id: idEdit.current,
          _set: {
            ...values
          }
        }
      })
      fetchTemplateAdsItems()
      message.success("Successfull !!!")
    } catch (error) {
      message.error("Error !!!")
    }
  }

  return (
    <div>
      <Modal
        title="Update Template Ads Items"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width="90vw"
        style={{
          top: 20,
          height: 'calc(100vh - 40px)',
          overflowY: 'auto'
        }}
      >
        {Object.keys(dataEdit).length ? <Form
          form={form}
          onFinish={handleFinish}
        >
          {Object.keys(dataEdit).map((data: any) => (
            <Form.Item
              name={data}
              label={data}
              key={data}
              initialValue={dataEdit[data]}
            >
              <Input />
            </Form.Item>
          ))}
          <Button htmlType='submit' type='primary'>Edit</Button>
        </Form> : null}
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
