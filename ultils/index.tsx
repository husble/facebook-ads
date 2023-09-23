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
