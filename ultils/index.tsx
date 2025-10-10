import { message } from "antd";
import axios from "axios";

export const transformArrayKeys = <T extends string>(
  arrayOfObjects: Record<string, T>[]
): Record<string, T>[] => {
  return arrayOfObjects.map((obj) => {
    const transformedObj: Record<string, T> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowercaseKey = key.toLowerCase().replace(/ /g, '_');
        transformedObj[lowercaseKey] = obj[key];
      }
    }

    return transformedObj as Record<string, T>;
  });
};

export const TYPES = [
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Created Image', value: 'creative_image' },
  { label: 'Created Video', value: 'creative_video' }
]

export const GENDERS = [
  { label: 'All gender', value: 'All' },
  { label: 'Men', value: 'Men' },
  { label: 'Women', value: 'Women' }
]

export const COUNTRIES = [
  { label: 'US', value: 'US' },
  { label: 'CA', value: 'CA' },
  { label: 'AU', value: 'AU' },
  { label: 'EU', value: 'EU' },
  { label: 'FR', value: 'FR' }
]

export enum PLATFORM {
  FACEBOOK = 'facebook',
  TIKTOK = 'tiktok'
}

export const createAgeOptions = () => {
  const options = []
  for (let index = 13; index <= 65; index++) {
    options.push({
      label: index,
      value: index
    })
  }

  return options
}

type Tag = {
  id: number;
  title: String;
};

type Store = {
  shop: string;
}

export type Product = {
  store_id: string;
  product_id: string;
  handle: string;
  title: string;
  name_ads_account: string;
  vendor: string;
  product_ads_tags: Tag[];
  tags: string;
  pr: string;
  link: string;
  product_type: string;
  image_url: string;
  key: string;
  template_name?: string;
  template_type?: string;
  template_user?: string;
  template_account?: string;
  image_video?: string;
  created_at_string: string;
  link_object_id?: string;
  story_id: string;
  store_2: Store;
  post_id?: string;
  body: string;
  customize_link?: string;
  video_url?: string;
  gender: string;
  age_max: number;
  age_min: number;
  countries: string[];
  ad_set_daily_budget: number;
  flexiable: string;
  is_clone: boolean;
  template_adset_name: string;
  tab: string;
  video_record_id?: string;
  list_video?: VIDEO[];
  vc_name: string;
  mb_record_id: string;
  video_name: string;
  msg: {
    title: string;
    code: number
  } | null;
  redirect_url: string;
  languages: number[] | null
};

export type TARGET = {
  ad_set_daily_budget: number;
  countries: string[];
  age_max: number;
  age_min: number;
  gender: string;
  flexiable: string;
  languages: number[] | null
}

export type PAYLOAD_SELECT = {
  value: string | string[] | number | null;
  record: Product;
  field_name: string;
  is_all: boolean;
}

export type FbPixel = {
  name: string;
  pixel_id: string;
  id: string;
  store_id: number;
  instagram_id: string;
}

export type TemplateAdCopy = {
  id: string;
  name: string;
  message: string;
}

export type VIDEO = {
  id: string;
  name: string;
  link: string;
}

export function getCreatorName(video_name: string) {
  const lastName = video_name.split("-").pop()
  const name = lastName?.split(".")[0]?.trim()
  
  return name || ""
}

export function addNameVideoCreator({old_vc_name, vc_name, name_ads_account, template_type}: {old_vc_name: string, vc_name: string, name_ads_account: string, template_type?: string}) {
  function resetCreatorName(name_ads_account: string, old_vc_name: String) {
    const splitNames = name_ads_account.split("-")
    const indexVC = splitNames.findIndex(name => name === old_vc_name)
    if (indexVC === -1) return name_ads_account
    splitNames.splice(indexVC, 1)

    return splitNames.join("-")
  }
  if (template_type?.includes("image")) return resetCreatorName(name_ads_account, old_vc_name)

  if (!vc_name) return name_ads_account
  const splitNames = resetCreatorName(name_ads_account, old_vc_name).split("-")
  const indexPr = splitNames.findIndex(name => name.includes("PR"))
  if (indexPr === -1) return name_ads_account

  splitNames.splice(indexPr + 1, 0, vc_name)

  return splitNames.join("-")
}

export function getRecordId(tags: string) {
  const list_tags = tags.split(", ")
  for (const tag of list_tags) {
    if (/^rec[A-Za-z0-9]+$/.test(tag)) return tag
  }

  return ""
}

export async function getRedirectUlr(product_id: string, shop: string) {
  try {
    
    const {data: {redirect_url}} = await axios({
      method: "GET",
      url: process.env.FACEBOOK_API + "/shopify/products/" + product_id,
      params: {
        shop
      }
    })
    return redirect_url
  } catch (error) {
    message.error("Error when trying get redirect url, please check !!!")
  }
}