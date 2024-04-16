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
  { label: 'EU', value: 'EU' }
]

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
};

export type TARGET = {
  ad_set_daily_budget: number;
  countries: string[];
  age_max: number;
  age_min: number;
  gender: string;
  flexiable: string;
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

export const FLEXIABLE_OPTIONS = [
  {
    label: "No",
    value: ""
  },
  {
    label: "Interests",
    options: [
      {
        label: "Dogs (animals)",
        value: "interests=6003332344237=Dogs",
      },
      {
        label: "Cats (animals)",
        value: "interests=6003159378782=Cats",
      },
      {
        label: "Family (social concept)",
        value: "interests=6003476182657=Family",
      }
    ]
  },
  {
    label: "Realationship statuses",
    options: [
      {
        label: "Married",
        value: "relationship_statuses=2=Married",
      },
      {
        label: "In relationship",
        value: "relationship_statuses=3=In relationship"
      },
    ]
  }
]