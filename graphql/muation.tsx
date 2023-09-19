import { gql } from "@apollo/client";

export const UpdateProductType = gql`
  mutation update_setting_product_type_by_pk(
    $id: Int!
    $_set: setting_product_type_set_input
  ) {
    update_setting_product_type_by_pk(
      pk_columns: {
        id: $id
      },
      _set: $_set
    ) {
      id
    }
  }
`

export const InsertProductType = gql`
  mutation insert_setting_product_type_one(
    $object: setting_product_type_insert_input!
  ) {
    insert_setting_product_type_one(object: $object) {
      id
    }
  }
`

export const DeleteProductType = gql`
  mutation delete_setting_product_type_by_pk(
    $id: Int!
  ) {
    delete_setting_product_type_by_pk(id: $id) {
      id
    }
  }
`