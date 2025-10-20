import { UPDATE_STORE } from '#/graphql/muation';
import { GET_STORES } from '#/graphql/query'
import { getProductsets } from '#/ultils';
import { CATAlOGS } from '#/ultils/config';
import { useMutation, useQuery } from '@apollo/client'
import { Checkbox, Form, Input, InputNumber, message, Select, Table, Typography } from 'antd';
import React, { useState } from 'react'

export type STORE = {
  id: number;
  shop: string;
  timezone: String;
  name: String;
  store_ads: string;
  label: string;
  product_set: number | null;
  product_catalog: number | null;
  status_ads: boolean;
  options: {label: string; value: string | number}[];
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
  form: any
}

const {Option} = Select

function Index() {
  const [stores, setStore] = useState<STORE[]>([])
  const [form] = Form.useForm()
  const [editingKey, setEditingKey] = useState<string>("");
  const [updateStore] = useMutation(UPDATE_STORE)
  const [productSetOptions, setProductSetOptions] = useState<{label: string; value: string | number}[]>([]);

  const EditableCell: React.FC<EditableCellProps> = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    required = true,
    ...restProps
  }) => {
    let inputNode =  <Input allowClear />;
      const [loadingSets, setLoadingSets] = useState(false);

    switch (inputType) {
      case "checkbox":
        inputNode = <Checkbox />;
        break;

      case "number":
        inputNode = <InputNumber />;
        break;

      case "select":
        // Determine which field is being rendered
        if (dataIndex === "product_catalog") {
          inputNode = (
            <Select
              placeholder="Select catalog"
              onChange={async (catalogId) => {
                try {
                  setLoadingSets(true);
                  const {productSets} = await getProductsets(catalogId);
                  const options = productSets.map((s: any) => ({
                    label: s.name,
                    value: s.id,
                  }));

                  setProductSetOptions(options);
                  const firstSet = options[0]?.value ?? null;
                  form.setFieldsValue({
                    product_catalog: catalogId,
                    product_set: firstSet,
                  });
                } catch (e) {
                  setProductSetOptions([])
                  message.error("Failed to load product sets");
                  form.setFieldsValue({ product_set: null });
                } finally {
                  setLoadingSets(false);
                }
              }}
            >
              {record.options?.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          );
        } else if (dataIndex === "product_set") {
          inputNode = (
            <Select
              placeholder="Select product set"
              loading={loadingSets}
              notFoundContent={loadingSets ? "Loading..." : null}
            >
              {productSetOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          );
        }
        break;
      default:
        break;
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

  useQuery(GET_STORES, {
    onCompleted: ({store_2}) => setStore(store_2) 
  })

  const isEditing = (record: STORE) => record.shop === editingKey;
  const edit = async (record: STORE) => {
    // Load product sets if catalog already exists
    if (record.product_catalog) {
      try {
        const { productSets } = await getProductsets(record.product_catalog);
        const options = productSets.map((s: any) => ({
          label: s.name,
          value: s.id,
        }));
        setProductSetOptions(options);
      } catch (err) {
        message.warning("Failed to load product sets for this catalog");
        setProductSetOptions([]);
      }
    }

    // set form values (including catalog & product_set)
    form.setFieldsValue({
      ...record,
      product_catalog: record.product_catalog || null,
      product_set: record.product_set || null,
    });

    // prepare editing
    setEditingKey(record.shop);

    // attach catalog list to this row
    const newStores = [...stores];
    const index = newStores.findIndex(store => store.shop === record.shop);
    newStores[index] = {
      ...stores[index],
      options: CATAlOGS,
    };
    setStore(newStores);
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
        product_catalog: row.product_catalog || null,
        product_set: row.product_set || null,
      });
      
      await updateStore({
        variables: {
          id: item.id,
          _set: {
            ...row,
            product_set: row.product_set || null,
            product_catalog: row.product_catalog || null,
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
              cell: EditableCell
            },
          }}
          rowKey="shop"
        />
      </Form>
    </div>
  )
}

export default Index