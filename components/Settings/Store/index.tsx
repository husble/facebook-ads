import { UPDATE_STORE } from '#/graphql/muation';
import { GET_STORES } from '#/graphql/query'
import { useMutation, useQuery } from '@apollo/client'
import { Button, Checkbox, Form, Input, InputNumber, message, Popconfirm, Select, Table, Typography } from 'antd';
import React, { Key, useCallback, useMemo, useState } from 'react'

export type STORE = {
  id: number;
  shop: string;
  timezone: String;
  name: String;
  store_ads: string;
  label: string;
  product_set: number | null;
  status_ads: boolean;
  options: {label: string; value: string | number}[]
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | "checkbox" | "select";
  record: STORE;
  index: number;
  children: React.ReactNode;
  required?: boolean;
}

const {Option} = Select

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  required = true,
  onChange,
  ...restProps
}) => {
  let inputNode =  <Input allowClear />;
  switch (inputType) {
    case "checkbox":
      inputNode = <Checkbox />
      break
    case "number":
      inputNode = <InputNumber />
      break

    case "select":
      inputNode = <Select >
        {record.options?.map(option => (
          <Option key={option.label} value={option.value}>{option.label}</Option>
        ))}
      </Select>
    default: break
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required,
              message: `Please Input ${title}!`,
            },
          ]}
          valuePropName={inputType === "checkbox" ? "checked" : undefined}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function Index() {
  const [stores, setStore] = useState<STORE[]>([])
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState<string>("");
  const [updateStore] = useMutation(UPDATE_STORE)
  const catalogs = [
    {
      label: "A",
      value: 1212121212
    },
    {
      label: "B",
      value: 12121212121212
    }
  ]

  useQuery(GET_STORES, {
    onCompleted: ({store_2}) => setStore(store_2) 
  })

  const isEditing = (record: STORE) => record.shop === editingKey;
  const edit = (record: STORE) => {
    form.setFieldsValue({...record});
    setEditingKey(record.shop);
    const newStores = [...stores]
    const index = newStores.findIndex(store => store.shop === record.shop)
    newStores[index] = {
      ...stores[index],
      options: catalogs
    }

    setStore(newStores)
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as STORE;
      const newData = [...stores];
      const index = newData.findIndex(item => key === item.shop);
      if (index === -1) throw "Store not found"
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
        product_set: row.product_set || null
      });
      
      await updateStore({
        variables: {
          id: item.id,
          _set: {
            ...row,
            product_set: row.product_set || null
          }
        }
      })
      setStore(newData);
      setEditingKey("");
    } catch (errInfo) {
      message.error("Update is error !!")
    }
  };

  const cancel = () => {
    setEditingKey("");
  }

  const columns = [
    {
      title: "Domain",
      dataIndex: "shop",
      key: "shop",
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      editable: true,
      required: false
    },
    {
      title: "Active",
      dataIndex: "status_ads",
      key: "status_ads",
      editable: true,
      render: (status_ads: boolean) => <Checkbox disabled checked={status_ads} />
    },
    {
      title: "Product Catalog",
      dataIndex: "product_catalog",
      key: "product_catalog",
      editable: true,
      width: 300,
      required: false,
      onChange: () => {}
    },
    {
      title: "Product set",
      dataIndex: "product_set",
      key: "product_set",
      editable: true,
      width: 300,
      required: false
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      render: (_: any, record: STORE) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.shop)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <span onClick={cancel}>
              <a>Cancel</a>
            </span>
          </span>
        ) : (
          <Typography.Link disabled={!!editingKey} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      }
    }
  ]

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    let inputType = "text"
    switch (col.dataIndex) {
      case "status_ads":
        inputType = "checkbox"
        break
      case "product_catalog":
      case "product_set":
        inputType = "select"
        break
      default:
        break
    }

    return {
      ...col,
      onCell: (record: STORE) => ({
        record,
        inputType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        required: col.required,
      }),
    };
  });


  return (
    <div>
      <Form form={form} component={false}>
        <Table
          columns={mergedColumns}
          dataSource={stores}
          pagination={false}
          scroll={{
            y: 'calc(100vh - 200px)'
          }}
          rowClassName="editable-row"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowKey="shop"
        />
      </Form>
    </div>
  )
}

export default Index