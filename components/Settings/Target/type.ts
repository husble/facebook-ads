export const TYPE_TARGET = "target"

export type DATA_VALUE = {
  label: string;
  id: string;
  key: string;
}

export type CONFIG_DATA = {
  value: DATA_VALUE[] | string
}  

export type CONFIG = {
  type: string;
  code: string;
  data: CONFIG_DATA;
  id: string;
  action?: boolean;
}

export type ActionUpdate = {
  action: (row: CONFIG) => void
}