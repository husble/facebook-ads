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
  { label: 'Creative Image', value: 'creative_image' },
  { label: 'Creative Video', value: 'creative_video' }
]

export const GENDERS = [
  { label: 'All gender', value: 'All gender' },
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

export const FLEXABLE = [
  
]