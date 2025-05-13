import { Product } from "#/ultils"
import { Button, message } from "antd"

import Video from "#/components/Video/video"
import { getLinkVideoByRecordID } from "#/ultils/video"

export const renderBtnActionVideo = (record: Product, setLoading: Function, adsPreview: Product[], setAdsPreview: Function) => {
  const {video_record_id, video_url, list_video} = record
  const viewVideo = (video_url: string | undefined, video_record_id: string | undefined) => {
    if (!video_url) return
    if (!video_record_id) {
      if (video_url.indexOf("=download&id=")) {
        const [_, video_id] = video_url.split("=download&id=")
        window.open(`https://drive.google.com/file/d/${video_id}/view`, "_blank")
      } else {
        window.open(video_url, "_blank")
      }
      return
    }
    const [_, video_id] = video_url.split("=download&id=")
    window.open(`https://drive.google.com/file/d/${video_id}/view`, "_blank")
  }

  const updateVideoUrlRecord = async (video_record_id: string, record: Product) => {
    try {
      setLoading(true)
      const {video_url, list_video, video_name} = await getLinkVideoByRecordID(video_record_id)
      const currentDatas = [...adsPreview]
      const {key} = record
      const findIndex = currentDatas.findIndex(
        (data: Product) => data.key === key
      );
  
      currentDatas[findIndex] = {
        ...currentDatas[findIndex],
        video_url,
        list_video,
        video_name
      }
      setAdsPreview(currentDatas);
      setLoading(false)
    } catch (error) {
      message.error("Error when trying get video url")
      setLoading(false)
    }
  }

  return (
    <div style={{display: "flex", gap: 10, marginTop: 10}}>
      {video_record_id ? <Button type='primary' size='small' onClick={() => updateVideoUrlRecord(video_record_id || "", record)}>Get Link Video</Button>: null}
      {video_url ? <Button type='primary' size='small' onClick={() => viewVideo(video_url, video_record_id)}>View</Button> : null}
      
      {list_video && list_video.length > 1 ? <Video record={record} adsPreview={adsPreview} setAdsPreview={setAdsPreview} videos={list_video || []} /> : null} 
    </div>
  )
}