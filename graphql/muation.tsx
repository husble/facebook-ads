import { gql } from '@apollo/client';

export const UpdateProductType = gql`
  mutation update_setting_product_type_by_pk(
    $id: Int!
    $_set: setting_product_type_set_input
  ) {
    update_setting_product_type_by_pk(pk_columns: { id: $id }, _set: $_set) {
      id
    }
  }
`;

export const InsertProductType = gql`
  mutation insert_setting_product_type_one(
    $object: setting_product_type_insert_input!
  ) {
    insert_setting_product_type_one(object: $object) {
      id
    }
  }
`;

export const DeleteProductType = gql`
  mutation delete_setting_product_type_by_pk($id: Int!) {
    delete_setting_product_type_by_pk(id: $id) {
      id
    }
  }
`;

export const InsertTemplateAds = gql`
  mutation insert_template_ads($objects: [template_ads_insert_input!]!) {
    insert_template_ads(objects: $objects) {
      returning {
        id
        name
      }
    }
  }
`;

export const InsertTemplateAdsItem = gql`
  mutation insert_template_ads_item(
    $objects: [template_ads_item_insert_input!]!
  ) {
    insert_template_ads_item(
      objects: $objects
      on_conflict: {
        constraint: template_ads_item_pkey
        update_columns: [
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
        ]
      }
    ) {
      returning {
        id
      }
    }
  }
`;
