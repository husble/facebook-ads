import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import { Button, Input, Modal, Select } from 'antd';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [type, setType] = useState<string>('image');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleChange = (value: string) => {
    console.log('%cCreate.tsx line:20 value', 'color: #007acc;', value);
  };
  return (
    <div className=" my-3">
      <Button type="primary" onClick={showModal}>
        Create Template
      </Button>
      <Modal
        title="Create Template Ads"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="d-flex my-3">
          <Input
            placeholder="Name of template"
            onChange={(
              e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setNameTemplate(e.target.value);
            }}
          />
          <Select
            className="mx-2"
            defaultValue={type}
            style={{ width: 120 }}
            onChange={handleChange}
            options={[
              { value: 'image', label: 'image' },
              { value: 'video', label: 'video' }
            ]}
          />
        </div>
        <Button className="" type="primary">
          Submit
        </Button>
      </Modal>
    </div>
  );
};

export default App;
