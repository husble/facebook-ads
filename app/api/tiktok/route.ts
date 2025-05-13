import { PLATFORM } from '#/ultils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const tiktok = request.cookies.get(PLATFORM.TIKTOK)
    if (!tiktok) throw "Please login !!!"

    const {access_token} = JSON.parse(tiktok["value"])
    const adsPreview = await request.json()
    const {data: {datas}} = await axios.request({
      method: 'POST',
      url: process.env.FACEBOOK_API + "/tiktok/create_post",
      data: adsPreview,
      headers: {
        Authorization: access_token
      }
    })

    return NextResponse.json({
      datas
    });
  } catch (error) {
    console.log("hihihihihihi", error)
    if (typeof error === "string") {
      return new NextResponse(error, { status: 400 });
    }
  }
}
