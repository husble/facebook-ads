import { Select } from 'antd';

const Index = ({ templateAds, setCurrentTemplate }: any) => {
  const onChange = (value: string) => {
    setCurrentTemplate(value);
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  const filterOption = (input: any, option: { label: any; value: any }) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <div>
      <Select
        style={{ width: '400px' }}
        showSearch
        placeholder="Select a person"
        optionFilterProp="children"
        onChange={onChange}
        onSearch={onSearch}
        filterOption={filterOption}
        options={templateAds}
      />
    </div>
  );
};

export default Index;
