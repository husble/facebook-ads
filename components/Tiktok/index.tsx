import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Badge, Button, Input, message, Select, Tag, Tooltip } from 'antd'
import axios, { AxiosError, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import Image from 'next/image'
import { useQuery } from '@apollo/client'
import TextArea from 'antd/es/input/TextArea'

import { PLATFORM, Product } from '#/ultils'
import { GET_TEMPLATE_ADS_COPY } from '#/graphql/query'
import Table from "#/components/Table"
import { getTemplateMessage, getVideoByRecordId, updateTemplate } from '#/ultils/video'
import { renderBtnActionVideo } from '../Video'
import { CopyTwoTone } from '@ant-design/icons'
import { ViewIcon } from '../svg'
type Props = {
  open: boolean;
  setOpen: Function;
  ads: Product[];
  setSelecteds: Function;
  platform: PLATFORM;
  login: Function;
}

type Reponse = {
  msg: string;
  product_id: string;
  post_id: string;
  code: number;
  video_tiktok_id: string;
}

function Index({ads, open, platform, setSelecteds, login}: Props) {
  const [loading, setLoading] = useState(false)
  const [adsPreview, setAdsPreview] = useState<Product[]>([])
  const templateAds = useRef([])
  useQuery(GET_TEMPLATE_ADS_COPY, {
    variables: {
      where: {}
    },
    onCompleted: ({ template_ads_copy }) => {
      templateAds.current = template_ads_copy;
    }
  });

  const handleChangeMessage = (e: ChangeEvent<HTMLTextAreaElement>, record: Product) => {
    const { key } = record;
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      title: e.target.value
    };

    setAdsPreview(currentDatas);
  }

  useEffect(() => {
    if (platform !== PLATFORM.TIKTOK || !open) return
    setLoading(true)
    async function mappingData() {
      const results = []
      for await(const ad of ads) {
        const data_video = await getVideoByRecordId(ad)

        results.push({
          ...ad,
          ...data_video,
          key: ad.product_id
        })
      }
      
      setLoading(false)
      setAdsPreview(results)
    }
    mappingData()
  },[ads, open])

  const handleChangeImageUrl = (e: ChangeEvent<HTMLInputElement>, record: Product) => {
    const { key } = record;
    const {value} = e.target
    const currentDatas: any = [...adsPreview];
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );
    if (/https:\/\//.test(value)) {
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        video_url: value,
        video_record_id: ""
      };
    } else {
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        video_record_id: value,
        video_url: ""
      };
    }
    setAdsPreview(currentDatas)
  }

  const removeCampaign = (record: Product) => {
    const newAdPreviews = [...adsPreview]
    const index = newAdPreviews.findIndex(ad => ad.product_id === record.product_id)
    newAdPreviews.splice(index, 1)

    const newAds = [...ads]
    const indexAds = newAds.findIndex(ad => ad.product_id === record.product_id)
    newAds.splice(indexAds, 1)

    setSelecteds(newAds)
    setAdsPreview(newAdPreviews)
  }

  const viewVideo = (video_tiktok_id: string) => {
    const user = JSON.parse(Cookies.get(PLATFORM.TIKTOK) || "{}")
    if (!user.creator_username) {
      message.warning("Login please!!!")
      return
    }

    window.open(`https://www.tiktok.com/@${user.creator_username}/video/${video_tiktok_id}?lang=en`)
  }
  
  const columns = [
    {
      title: 'Title',
      key: 'title',
      dataIndex: 'title',
      render: (title: string, record: Product) => {
        const no_video_url = !record["video_url"]
        const {image_url, link} = record
        return (
          <>
            <div className='d-flex items-center gap-2'>
              {no_video_url ? <Badge.Ribbon color='red' placement='start' text="No Video">
                {(image_url && image_url.indexOf("http") !== -1) ? <Image
                  src={image_url}
                  alt='image'
                  width={80}
                  height={80}
                /> : null}
              </Badge.Ribbon> : (
                <>
                  {(image_url && image_url.indexOf("http") !== -1) ? <Image
                    src={image_url}
                    alt='image'
                    width={80}
                    height={80}
                  /> : null}
                </>
              )}
              <a target="_blank" href={`${link}`}>
                {title}
              </a>
            </div>
          </>
        );
      }
    },
    {
      title: "Video Id",
      key: "video_tiktok_id",
      dataIndex: "video_tiktok_id",
      width: 300,
      render: (video_tiktok_id: string) => (
        video_tiktok_id ? <Tag color='green'>
          <p style={{display: "flex", margin: 0, alignItems: "center", gap: 10}}>{video_tiktok_id} <span onClick={() => viewVideo(video_tiktok_id)}><ViewIcon /></span></p>
        </Tag> : null
      )
    },
    {
      title: 'Post Id',
      key: 'post_id',
      dataIndex: 'post_id',
      render: (post_id: string, record: Product) => (
        <>
          {record.msg?.code ? <span className={`${record.msg?.code === 200 ? "msg_success" : "msg_fail"}`}>* {record.msg.title}</span> : null}
          <div style={{display: 'flex', gap: 10}}>
            {post_id ? (
              <>
                <p style={{width: "100%"}}>
                  {post_id}
                  {" "}
                  <Tooltip title="Copy">
                    <CopyTwoTone onClick={() => navigator.clipboard.writeText(post_id)} />
                  </Tooltip>
                </p>
              </>
            ) : null}
          </div>
        </>
      ),
      width: 350
    },
    {
      title: "",
      key: "remove",
      dataIndex: "remove",
      width: 50,
      render: (_: any, row: Product) => (
        <Tooltip title="Remove this campaign">
          <span onClick={() => removeCampaign(row)} className='cursor-pointer text-red-500'>x</span>
        </Tooltip>
      )
    }
  ]

  const handleChooseTemplate = async (value: string) => {
    const message = await getTemplateMessage(value)
    const currentDatas: Product[] = [...adsPreview].map(ad => ({
      ...ad,
      body: message || "" 
    }))
    setAdsPreview(currentDatas);
  } 

  const handleChooseTemplateForOneRecord = async (value: string, record: Product) => {
    const currentDatas = await updateTemplate(value, record, adsPreview, PLATFORM.TIKTOK)
    setAdsPreview(currentDatas);
  }

  const handleGetPostId = async () => {
    const mappingMsg = (datas: Reponse[]) => {
      if (datas.length == 0) {
        const newAdPreviews = adsPreview.map(ad => {
          return {
            ...ad,
            msg: null
          }
        })
        setAdsPreview(newAdPreviews)
        return
      }
      const newAdPreviews = adsPreview.map(ad => {
        const data = datas.find(data => data["product_id"] === ad["product_id"])
        if (!data) return ad
        return {
          ...ad,
          msg: {
            code: data["code"],
            title: data["msg"],
          },
          post_id: data["post_id"],
          video_tiktok_id: data["video_tiktok_id"]
        }
      })
      setAdsPreview(newAdPreviews)
    }
    try {
      setLoading(true);
      const user = Cookies.get(PLATFORM.TIKTOK)
      if (!user) {
        await login()
      }

      const {data: {datas}} = await axios.request({
        method: 'POST',
        url:  "/api/tiktok",
        data: adsPreview,
      })
      mappingMsg(datas)
      setLoading(false);
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.log(error)
      if (typeof error === "string") {
        message.error(error)
      } else {
        if (error.response) {
          message.error(error.response.data as string, 2)
        }
      }
      mappingMsg([])
      setLoading(false);
    }
  }

  return (
    <>
      <div className='sticky'>
        <div className="flex justify-between flex-wrap gap-2">
          <div>
            <Select
              style={{ width: '200px', marginBottom: 10 }}
              placeholder="choose template"
              onChange={handleChooseTemplate}
              options={templateAds.current.map((template: any) => ({
                label: template.name,
                value: template.name
              }))}
            />
            <Button className="btn__create--camp ml-2" onClick={handleGetPostId} type="primary">
              Get PostId
            </Button>
          </div>
          <div>
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        open={open}
        dataSource={adsPreview}
        setLoading={setLoading}
        templateType={"video"}
        loading={loading}
        className='camp_table'
        setDataSource={setAdsPreview}
        scroll={{
          y: 'calc(100vh - 200px)'
        }}
        pagination={false}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <ul key={record.title} className={`camp_list_items`}>
                <li>
                  <div className='camp_target flex items-center gap-2 flex-wrap'>
                    <Select
                      style={{ width: '200px', marginBottom: 10 }}
                      placeholder="choose template"
                      onChange={(value) => handleChooseTemplateForOneRecord(value, record)}
                      options={templateAds.current.map((template: any) => ({
                        label: template.name,
                        value: template.name
                      }))}
                    />
                  </div>
                </li>
                <li style={{width: "100%"}}>
                <div className='camp_type'>
                  <span className='camp_item--label'>Video </span>
                  <Input
                    onChange={(e) => handleChangeImageUrl(e, record)}
                    style={{width: '90%'}}
                    defaultValue={record.video_record_id || record.video_url}
                    key={record.video_url}
                    placeholder='input video url or record_id'
                  />
                  {renderBtnActionVideo(record, setLoading, adsPreview, setAdsPreview)}
                </div>
                </li>
                <li style={{width: "100%"}}>
                  <span className='camp_item--label'>Message</span>
                  <TextArea
                    onBlur={(e) => handleChangeMessage(e, record)}
                    rows={5} style={{width: "100%"}}
                    defaultValue={record.body}
                    key={record.body}
                  />
                </li>
              </ul>
            )
          }
        }}

      />
    </>
  )
}

export default Index