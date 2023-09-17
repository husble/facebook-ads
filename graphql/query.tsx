import { gql } from "@apollo/client";

export const GET_STORES = gql`
  query store_2 {
    store_2 {
      id
      shop
    }
  }
`