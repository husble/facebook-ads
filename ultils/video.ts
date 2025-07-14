import { GET_TEMPLATE_ADS_COPY_PK } from "#/graphql/query"
import { getCreatorName, getRecordId, PLATFORM, Product, VIDEO } from "."
import Client from "./client"
import { LINK_DATAS } from "./config"

export const getLinkVideoByRecordID = async (record_id: string | null) => {
  if (!record_id) return {
    video_url: "",
    list_video: [],
    vc_name: "",
    video_name: ""
  }

  const res = await fetch(`https://spy.husble.com/api/video-v2?record=${record_id}`)
  const data: VIDEO[] = await res.json()

  if (!data || data.length === 0) return {
    video_url: "",
    list_video: [],
    vc_name: "",
    video_name: ""
  }
  return {
    vc_name: getCreatorName(data[0]["name"]),
    video_url: data[0]["link"],
    list_video: data,
    video_name: data[0]["name"],
    video_record_id: record_id
  }
}

export const getVideoByRecordId = async (ad: Product) => {
  const {tags, video_url, video_record_id, vc_name: vc_name_data} = ad
  if (video_url) return {
    video_url,
    video_record_id: "",
    vc_name: vc_name_data,
    list_video: []
  }
  
  const record_id = video_record_id || getRecordId(tags)

  const {video_url: new_video_url, list_video, vc_name, video_name} = await getLinkVideoByRecordID(record_id)
  return {
    video_url: new_video_url,
    vc_name,
    video_record_id: record_id,
    list_video,
    video_name
  }
}

export const getTemplateMessage = async (value: string) => {
  const {data: {template_ads_copy_by_pk}} = await Client.query({
    query: GET_TEMPLATE_ADS_COPY_PK,
    variables: {
      name: value
    }
  })

  const message = template_ads_copy_by_pk?.message || ""

  return message
}

export const updateTemplate = async (value: string, record: Product, adsPreview: Product[], platform: PLATFORM) => {
  const message = await getTemplateMessage(value)
  const currentDatas: Product[] = [...adsPreview];
  const { key } = record;
  const findIndex = currentDatas.findIndex(
    (data: Product) => data.key === key
  );
  const store_name = record.store_2.shop
  if (platform === PLATFORM.FACEBOOK) {
    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      body: `${message} \n Customize yourss: ${currentDatas[findIndex]["redirect_url"]}` || ""
    };
  }

  if (platform === PLATFORM.TIKTOK) {
    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      body: message || ""
    };
  }
  return currentDatas
}