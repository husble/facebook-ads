import { Button, message, Switch, Table, TablePaginationConfig } from 'antd';
import { ExpandableConfig } from 'antd/es/table/interface';
import React, { use, useCallback, useEffect, useState } from 'react'

import { Product } from '#/ultils';
import { getLinkVideoByRecordID } from '#/ultils/video';

type Props = {
  columns: any[];
  dataSource: Product[];
  scroll?: ({
    x?: number | true | string;
    y?: number | string;
  } & {
    scrollToFirstRowOnChange?: boolean;
  }) | undefined;
  // expandedRowKeys: string[];
  onExpand?: ((expanded: boolean, record: Product) => void) | undefined;
  loading: boolean;
  setLoading: (loading: boolean) => void | undefined;
  setDataSource: (data: Product[]) => void;
  pagination: false | TablePaginationConfig | undefined;
  className: string;
  expandable?: ExpandableConfig<Product> | undefined;
  templateType: string;
  open: boolean;
}

function Index(props: Props) {
  const {dataSource, columns, scroll, loading, setLoading, setDataSource, className, pagination, expandable, templateType, open} = props
  const [showAll, setShowAll] = useState(false)
  const [expendRows, setExpendRows] = useState<string[]>([]);

  useEffect(() => {
    if (!showAll || !open) return
    const expendRows = dataSource.map(ad => ad.key)
    setExpendRows(expendRows)
  }, [open, showAll, dataSource])

  const changeShowAll = (checked: boolean) => {
    setShowAll(checked)
    if (!checked) {
      setExpendRows([])
      return
    }
  }
  
  const renderBtnGetAllVideo = useCallback(() => {
    if (templateType.indexOf("video") === -1) return
    async function gettAllVideo() {
      try {
        setLoading(true)
        const dataPromises = dataSource.map(ad => {
          return getLinkVideoByRecordID(ad?.video_record_id || null)
        })
  
        const resultPromises = await Promise.all(dataPromises)
        const currentDatas = dataSource.map((ad, index) => ({
          ...ad,
          video_url: resultPromises[index]['video_url'],
          video_record_id: resultPromises[index]['video_record_id'] || "",
          video_name: resultPromises[index]['video_name'] || "",
        }))
        setLoading(false)
        setDataSource(currentDatas)
      } catch (error) {
        message.error("Error when trying get video url")
        setLoading(false)
      }
    }
    return (
      <Button onClick={gettAllVideo} size='small' type='primary'>Get All Video</Button>
    )
  }, [dataSource])
  const hanldeExpend = (expend: boolean, record: Product) => { 
    const newExpendRows = expendRows
    if (expend) {
      newExpendRows.push(record.product_id)
    } else {
      const index = newExpendRows.findIndex(key => key === record.product_id)
      newExpendRows.splice(index, 1)
    }

    if (newExpendRows.length === dataSource.length) {
      setShowAll(true)
    } else {
      setShowAll(false)
    }
    setExpendRows(newExpendRows)
  }
  return (
    <>
      <div style={{display: "flex", gap: 10, marginTop: 10}}>
        <Switch checked={showAll} onChange={changeShowAll} unCheckedChildren='Show All' checkedChildren='Show All' />
        {renderBtnGetAllVideo()}
      </div>
      <Table
        loading={loading}
        pagination={pagination}
        dataSource={dataSource}
        columns={columns}
        scroll={scroll}
        expandable={{
          ...expandable,
          onExpand: hanldeExpend,
          expandedRowKeys: expendRows
        }}
        className={className}
      />
    </>
  )
}

export default Index