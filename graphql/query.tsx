import { gql } from '@apollo/client';

export const GET_PRODUCT_ADS = gql`
  query product_ads(
    $where: product_ads_bool_exp
    $limit: Int = 25
    $offset: Int
  ) {
    product_types: product_ads(
      distinct_on: product_type
      where: { product_type: { _is_null: false } }
    ) {
      title: product_type
    }
    product_ads(
      where: $where
      limit: $limit
      offset: $offset
      order_by: { created_at_string: desc }
    ) {
      store_id
      title
      name_ads_account
      image_url
      product_type
      link
      pr
      tags
      key: id
      created_at_string
    }
    product_ads_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_STORES = gql`
  query store_2 {
    store_2(where: { store_ads: { _is_null: false } }) {
      id
      shop
      timezone
      name
    }
  }
`;

export const GET_SETTINGS_PRODUCT_ADS = gql`
  query setting_product_ads {
    setting_product_ads {
      id
      title
      name
      description
    }
  }
`;

export const GET_SETTINGS_PRODUCT_TYPES = gql`
  query setting_product_type(
    $where: setting_product_type_bool_exp
    $limit: Int = 10
    $offset: Int
  ) {
    setting_product_type(
      where: $where
      order_by: { title: asc }
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      value
    }
    setting_product_type_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_TEMPLATE_ADS = gql`
  query template_ads($where: template_ads_bool_exp) {
    template_ads(where: $where, distinct_on: [name]) {
      id
      name
      type
    }
  }
`;

export const GET_TEMPLATE_ADS_LIST = gql`
  query template_ads {
    template_ads(order_by: { name: asc }) {
      id
      name
      type
      can_delete
    }
  }
`;

export const GET_TEMPLATE_ITEMS = gql`
  query template_ads_item($where: template_ads_item_bool_exp) {
    template_ads_item(where: $where) {
      ad_name
      ad_status
      additional_custom_tracking_specs
      body
      call_to_action
      conversion_tracking_pixels
      creative_type
      image_file_name
      image_hash
      instagram_account_id
      device_platforms
      instagram_preview_link
      link
      link_description
      link_object_id
      optimize_text_per_person
      optimized_ad_creative
      permalink
      preview_link
      url_tags
      use_page_as_actor
      video_retargeting
      video_file_name
      video_id
      ad_set_bid_strategy
      ad_set_name
      ad_set_run_status
      ad_set_time_start
      attribution_spec
      billing_event
      brand_safety_inventory_filtering_levels
      countries
      destination_type
      flexible_inclusions
      gender
      location_types
      optimization_goal
      optimized_conversion_tracking_pixels
      optimized_event
      use_accelerated_delivery
      buying_type
      campaign_name
      campaign_objective
      campaign_start_time
      campaign_status
      new_objective
      created_at
      updated_at
      template_ads_id
      ad_set_daily_budget
      ad_set_lifetime_budget
      ad_set_lifetime_impressions
      age_max
      age_min
      instagram_positions
      facebook_positions
      messenger_positions
      publisher_platforms
    }
  }
`;

export const GET_TEMPLATE_ADS_ITEMS = gql`
  query template_ads_item($id: uuid) {
    template_ads_item(where: { template_ads_id: { _eq: $id } }) {
      id
      ad_name
      ad_status
      additional_custom_tracking_specs
      body
      call_to_action
      conversion_tracking_pixels
      creative_type
      image_file_name
      image_hash
      instagram_account_id
      instagram_preview_link
      link
      link_description
      link_object_id
      optimize_text_per_person
      optimized_ad_creative
      permalink
      preview_link
      url_tags
      use_page_as_actor
      video_retargeting
      video_file_name
      video_id
      ad_set_bid_strategy
      ad_set_daily_budget
      ad_set_lifetime_budget
      ad_set_lifetime_impressions
      ad_set_name
      ad_set_run_status
      ad_set_time_start
      age_max
      age_min
      attribution_spec
      billing_event
      brand_safety_inventory_filtering_levels
      countries
      destination_type
      flexible_inclusions
      gender
      location_types
      optimization_goal
      optimized_conversion_tracking_pixels
      optimized_event
      use_accelerated_delivery
      buying_type
      campaign_name
      campaign_objective
      campaign_start_time
      campaign_status
      new_objective
      template_ads_id
      device_platforms
    }
  }
`;


export const GET_TEMPLATE_ADS_ITEM = gql`
  query template_ads_item_by_pk($id: uuid!) {
    template_ads_item_by_pk(id: $id) {
      id
      ad_name
      ad_status
      additional_custom_tracking_specs
      body
      call_to_action
      conversion_tracking_pixels
      creative_type
      image_file_name
      image_hash
      instagram_account_id
      instagram_preview_link
      link
      link_description
      link_object_id
      optimize_text_per_person
      optimized_ad_creative
      permalink
      preview_link
      url_tags
      use_page_as_actor
      video_retargeting
      video_file_name
      video_id
      ad_set_bid_strategy
      ad_set_daily_budget
      ad_set_lifetime_budget
      ad_set_lifetime_impressions
      ad_set_name
      ad_set_run_status
      ad_set_time_start
      age_max
      age_min
      attribution_spec
      billing_event
      brand_safety_inventory_filtering_levels
      countries
      destination_type
      flexible_inclusions
      gender
      location_types
      optimization_goal
      optimized_conversion_tracking_pixels
      optimized_event
      use_accelerated_delivery
      buying_type
      campaign_name
      campaign_objective
      campaign_start_time
      campaign_status
      new_objective
      template_ads_id
      device_platforms
    }
  }
`