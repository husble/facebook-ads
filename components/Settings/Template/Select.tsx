import { DeleteTemplateAds } from '#/graphql/muation';
import { useMutation } from '@apollo/client';
import { Button, Select, message } from 'antd';
import { useState } from 'react';

const Index = ({ templateAds, setCurrentTemplate, fetchTemplateAdsItems, currentTemplate }: any) => {
  const [template, setTemplate] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [deleteTempAds] = useMutation(DeleteTemplateAds)
  const onChange = (value: string, option: any) => {
    const [id, can_delete] = value.split("+")
    setCurrentTemplate(id);
    setTemplate(option.label)
    setCanDelete(can_delete === "true")
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  const onDeleted = async () => {
    try {
      await deleteTempAds({
        variables: {
          id: currentTemplate
        }
      })
      fetchTemplateAdsItems()
      message.success("Update successfull !!!")
    } catch (error) {
      message.error("Delete error !!!")
    }
  }

  const filterOption = (input: string, option: any) =>
    option?.label?.toLowerCase()?.indexOf(input?.toLowerCase()) !== -1;

  return (
    <div>
      <div>
        <Select
          style={{ width: '400px' }}
          showSearch
          placeholder="Select a person"
          optionFilterProp="children"
          onChange={onChange}
          onSearch={onSearch}
          filterOption={filterOption}
          options={templateAds.map((t: any) => ({label: `${t.name} - ${t.type}`, value: `${t.id}+${t.can_delete}`}))}
        />
      </div>
      {template ? <Button onClick={onDeleted} disabled={!canDelete} style={{backgroundColor: "#c33f3f", color: "#fff"}} className='my-2 inline-block'>Delete {template}</Button> : null}
    </div>
  );
};

export default Index;
