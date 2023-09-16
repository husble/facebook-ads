import { Table } from 'antd'
import Image from 'next/image'

export default function Home() {

  const columns = [
    {
      title: "Title",
      key: "title",
      dataIndex: "title"
    }
  ]

  return (
    <div>
      <Table
        columns={columns}
        dataSource={[{
          title: "123"
        }]}
      />
    </div>
  )
}
