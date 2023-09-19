import { gql } from "@apollo/client";

export const GET_PRODUCT_ADS = gql`
  query product_ads($where: product_ads_bool_exp) {
    product_ads(where: $where) {
      store_id
      product_id
      handle
      title
      name_ads_account
      vendor

      product_ads_tags {
        id
        title
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

      product_types: setting_product_types {
        id
        title
        description
        value
      }
    }
  }
`