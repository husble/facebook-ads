import React, { useState } from 'react'
import { Badge, Button, List, Modal, Tooltip } from 'antd'

import { addNameVideoCreator, getCreatorName, Product, VIDEO } from '#/ultils';

type Props = {
  videos: VIDEO[];
  record: Product;
  adsPreview: Product[];
  setAdsPreview: Function;
}
function Index({videos, adsPreview, setAdsPreview, record}: Props) {
  const [visible, setVisiable] = useState<boolean>(false)
  const [videoUrl, setVideoUrl] = useState<string>("")

  function getVideoId(video_url: string) {
    const [_, video_id] = video_url.split("=download&id=")
    return video_id
  }

  function createVideoUrl(video_url: string) {
    const [_, video_id] = video_url.split("=download&id=")
    return `https://drive.google.com/file/d/${video_id}/view`
  }

  function viewVideo(video_url: string) {
    setVideoUrl(video_url)
  }

  function chooseVideo(video: VIDEO) {
    const currentDatas = [...adsPreview]
    const {link, name} = video
    const {key, name_ads_account, template_type, vc_name} = record
    const findIndex = currentDatas.findIndex(
      (data: Product) => data.key === key
    );
    const new_vc_name = getCreatorName(name)

    currentDatas[findIndex] = {
      ...currentDatas[findIndex],
      video_url: link,
      name_ads_account: addNameVideoCreator({old_vc_name: vc_name, vc_name: new_vc_name, name_ads_account, template_type}),
      vc_name: new_vc_name
    }
    setAdsPreview(currentDatas);
    setVideoUrl(link)
    setVisiable(false)
  }

  return (
    <div>
      <Badge count={videos.length}>
        <Tooltip title="Click to choose another video">
          <Button onClick={() => setVisiable(true)} type='primary' size='small'>Video</Button>
        </Tooltip>
      </Badge>
      <Modal
        open={visible}
        onCancel={() => setVisiable(false)}
        width={"90vw"}
        footer={null}
      >
        <div className='video_wrap' style={{display: "flex", gap: 20}}>
          <iframe loading={"lazy"} src={`https://drive.google.com/file/d/${getVideoId(videoUrl || videos[0]["link"])}/preview`} width="640" height="360"></iframe>
          <List
            itemLayout='horizontal'
            dataSource={videos}
            renderItem={video => (
              <List.Item>
                <div>
                  <div style={{display: 'flex', gap: 10}}>
                    {video['link'] === videoUrl ? <svg
                      id="Layer_1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      viewBox="0 0 30 30"
                      xmlSpace="preserve"
                      width={30}
                      height={30}
                    >
                      <path
                        style={{
                          fill: "#E2E2E2",
                        }}
                        d="M15 30c8.285 0 15 -6.715 15 -15S23.285 0 15 0 0 6.715 0 15s6.715 15 15 15"
                      />
                      <path
                        style={{
                          fill: "#ED1C24",
                        }}
                        d="m28.549 7.532 -5.334 -0.423 -0.427 -5.247 -4.523 2.158L15.149 0l-2.902 4.104 -4.652 -2.454 -0.256 5.374 -5.291 0.254 2.005 5.078L0 14.852l4.139 3.131 -2.091 4.443 5.164 0.593 0.299 5.078 4.822 -2.285L15.49 30l2.816 -4.231 4.438 2.158 0.384 -5.247 5.164 -0.127 -1.92 -4.358L30 15.064l-3.968 -3.216zm-14.967 12.242 -4.214 -3.743 0.934 -1.051 3.094 2.748 6.315 -8.086 1.108 0.865z"
                      />
                      <path
                        style={{
                          fill: "#FFFFFF",
                        }}
                        points="228.608,302.528 175.808,255.648 159.872,273.584 231.792,337.472 355.296,179.296  336.384,164.528 "
                        d="M13.395 17.726L10.301 14.979L9.368 16.03L13.582 19.774L20.818 10.506L19.71 9.64Z"
                      />
                    </svg> : null}
                    <div>
                      <p style={{margin: 0}}><strong>{video["name"]}</strong></p>
                      <a target="_blank" href={createVideoUrl(video['link'])}>
                        {video['link']}
                      </a>
                    </div>
                  </div>
                  <div className='btn_action'>
                    <Button onClick={() => viewVideo(video['link'])} size='small' type='dashed'>View</Button>
                    <Button onClick={() => chooseVideo(video)} style={{marginLeft: 10}} size='small' type='dashed'>Choose this video</Button>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </div>
  )
}

export default Index