import { gql } from "@apollo/client";

export const GET_PRODUCT_ADS = gql`
  query product_ads($where: product_ads_bool_exp, $limit: Int = 50, $offset: Int) {
    product_ads(where: $where, limit: $limit, offset: $offset) {
      store_id
      title
      name_ads_account
      image_url
      product_type
      link
      pr
      tags
      key: id
    }
    product_ads_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`

export const GET_STORES = gql`
  query store_2 {
    store_2 {
      id
      shop
      timezone
      name
    }
  }
`

export const GET_SETTINGS_PRODUCT_ADS = gql`
  query setting_product_ads {
    setting_product_ads {
      id
      title
      name
      description
    }
  }
`

export const GET_SETTINGS_PRODUCT_TYPES = gql`
  query setting_product_type($where: setting_product_type_bool_exp, $limit: Int = 10, $offset: Int) {

    setting_product_type(
      where: $where
      order_by: {
        title: asc
      }
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
  
`