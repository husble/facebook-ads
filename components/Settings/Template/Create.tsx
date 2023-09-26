import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import { Button, Input, Modal, Select, message } from 'antd';
import { useMutation } from '@apollo/client';

import { InsertTemplateAds } from '#/graphql/muation';

const App = ({ refetch }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [type, setType] = useState<string>('image');

  const [insertTemplateAds] = useMutation(InsertTemplateAds);

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
    setType(value);
  };

  const handleSubmit = async () => {
    console.log(
      '%cCreate.tsx line:26 nameTemplate , type',
      'color: #007acc;',
      nameTemplate,
      type
    );

    try {
      await insertTemplateAds({
        variables: {
          objects: [
            {
              name: nameTemplate,
              type
            }
          ]
        }
      });
      message.success('Create Template Success');
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      message.error('Create Template Failed');
      setIsModalOpen(false);
    }
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
        <Button onClick={handleSubmit} className="" type="primary">
          Submit
        </Button>
      </Modal>
    </div>
  );
};

export default App;
