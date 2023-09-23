import Modal from 'antd/es/modal/Modal'
import Image from 'next/image';
import React from 'react'

interface Props {
  setImageUrl: Function;
  image_url: string;
}

function Index({image_url, setImageUrl}: Props) {
  return (
    <Modal
      open={image_url ? true : false}
      onCancel={() => setImageUrl("")}
      footer={null}
      style={{
        top: 20
      }}
    >
      <Image
        src={image_url}
        width={0}
        height={0}
        sizes="100vw"
        alt='image'
        style={{ width: '100%', height: 'auto' }}
      />
    </Modal>
  )
}

export default Index