import type { DrawerProps, RadioChangeEvent } from 'antd';
import { Button, DatePicker, Drawer, Radio, Select, Space } from 'antd';
import moment from 'moment';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const App = ({
  open,
  setOpen,
  productTypes,
  setParamsProductType,
  handleFilterAds,
  setParamsCreatedAt
}: any) => {
  const [placement, setPlacement] = useState<DrawerProps['placement']>('right');

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
    setParamsProductType(value);
  };

  const onSearch = (value: string) => {
    console.log('search:', value);
  };

  const filterOption = (
    input: string,
    option: any
  ) => option?.label?.toLowerCase()?.indexOf(input?.toLowerCase()) !== -1

  const handleSubmit = () => {
    console.log('%cindex.tsx line:30 objec', 'color: #007acc;');
    handleFilterAds();

    setOpen(!open);
  };

  const handleTime = (value: any) => {
    setParamsCreatedAt({
      _gte: value[0].$d,
      _lte: value[1].$d
    });

    console.log(
      '%cindex.tsx line:46 handleTime',
      'color: #007acc;',
      moment(value[0].$d).format('DD/MM/YYYY')
    );
  };

  return (
    <>
      <Drawer
        title="Filter Product"
        placement={placement}
        closable={false}
        onClose={onClose}
        open={open}
        key={placement}
      >
        <Select
          className="my-3"
          style={{ width: '100%' }}
          showSearch
          placeholder="Select a person"
          optionFilterProp="children"
          onChange={onChange}
          onSearch={onSearch}
          filterOption={filterOption}
          options={productTypes.map((p: any) => ({
            value: p.title,
            label: p.title
          }))}
        />

        <RangePicker showTime onChange={handleTime} />

        <Button className="my-4" type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Drawer>
    </>
  );
};

export default App;
