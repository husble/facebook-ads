import { Table } from 'antd';

const Index = ({ templateAdsItems, loading }: any) => {
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
    'new_objective'
  ];

  const columns = stringArray.map((s: string) => ({
    title: s,
    key: s,
    dataIndex: s,
    render: (pr: String) => <div>{pr}</div>
  }));

  return (
    <div>
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
