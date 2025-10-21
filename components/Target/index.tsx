import React, { useCallback, useEffect, useState } from 'react'

import { GET_CONFIG } from '#/graphql/query'
import { COUNTRIES, GENDERS, Product, TARGET, createAgeOptions, getProductsets } from '#/ultils'
import { useQuery } from '@apollo/client'
import axios from 'axios'
import debounce from 'lodash.debounce'
import { InputNumber, message, Radio, Select } from 'antd'
import { CONFIG, DATA_VALUE, TYPE_TARGET } from '../Settings/Target/type'
import { COUNTRY } from '../Facebook'
import { CATAlOGS } from '#/ultils/config'


const {Option} = Select

type Props = {
  record: Product | TARGET;
  handleChooseSelect: Function;
  is_all: boolean;
  countries: COUNTRY[];
  setCountries: Function;
}

const AGES = createAgeOptions()

function Index({record, handleChooseSelect, is_all, countries, setCountries}: Props) {
  const [targets, setTarget] = useState<any[]>([])
  const [loading, setLoading] = useState(false);
  const [loadingProductSets, setLoadingProductSets] = useState(false);
  const [productSets, setProductSet] = useState([])
  useQuery(GET_CONFIG, {
    variables: {
      where: {
        type: {
          _eq: TYPE_TARGET
        }
      }
    },
    onCompleted: ({configs}: {configs: CONFIG[]}) => {
      const results = []

      function createOptions(values: DATA_VALUE[], code: string) {
        return values.map(value => {
          const {id, key, label} = value

          return {
            label,
            value: `${code.toLowerCase().replaceAll(" ", "_")}=${id}=${key}`
          }
        })
      }

      for (const config of configs) {
        const {code, data} = config
        const {value} = data
        if (typeof value === "string") {
          results.push({
            label: code,
            value
          })
        } else {
          results.push({
            label: code,
            options: createOptions(value, code)
          })
        }
      }
      setTarget(results)
    }
  })

  useEffect(() => {
    const fetchProductsets = async () => {
      if (!record.product_catalog) return
      setLoadingProductSets(true)
      const {productSets} = await getProductsets(record.product_catalog)
      const options = productSets.map((s: any) => ({
        label: s.name,
        value: s.id,
      }));
      setProductSet(options)
      setLoadingProductSets(false)
    }

    fetchProductsets()
  }, [record.product_catalog])

  const searchCountries = useCallback(debounce(async (value: string) => {
    try {
      setLoading(true)
      const {data: {countries}} = await axios.request({
        method: 'GET',
        url: process.env.FACEBOOK_API + "/facebook/search_countries" + "?search=" + value,
      })

      setCountries(countries)
      setLoading(false)
    } catch (error) {
      message.error("Error fetching countries")
      setLoading(true)
    }
  }, 300), [])

  const chooseCountry = (value: number[]) => {
    const data_update = {languages: value}
    handleChooseSelect({value, record, field_name: "languages", is_all, data_update})
  }

  const chooseCatalog = async (value: string | number) => {
    setLoadingProductSets(true)
    const {productSets} = await getProductsets(value)
    setProductSet(productSets)
    handleChooseSelect({value, record, field_name: "", is_all, data_update: {
      product_catalog: value,
      product_set: productSets[0].id
    }})
    setLoadingProductSets(false)
  }

  const chooseProductsets = async (value: string | number) => {
    handleChooseSelect({value, record, field_name: "product_set", is_all, data_update: {product_set: value}})
  } 

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <div className='flex items-center gap-1'>
        <strong>Daily Budget:</strong>
        <InputNumber
          prefix="$"
          value={record.ad_set_daily_budget}
          key={Math.random()}
          onBlur={(e) => handleChooseSelect({value: e.target.value, record, field_name: "ad_set_daily_budget", is_all, data_update: {ad_set_daily_budget: e.target.value}})}
        />
      </div>
      <div className='flex items-center gap-1'>
        <strong>Location:</strong>
        <Select
          value={record.countries}
          key={Math.random()}
          options={COUNTRIES}
          mode='multiple'
          style={{minWidth: 100}}
          onChange={(value) => handleChooseSelect({value, record, field_name: "countries", is_all, data_update: {countries: value}})}
        />
      </div>
      <div>
        <Select<number[]>
          showSearch
          style={{minWidth: 200}}
          onSearch={searchCountries}
          notFoundContent={loading ? "Loading..." : "No results"}
          filterOption={false}
          loading={loading}
          onChange={chooseCountry}
          mode="multiple"
          value={record.languages || []}
          allowClear
          placeholder="choose languages"
        >
          {countries.map(country => (
            <Option key={`${country.key}`} value={country.key}>{country.name}</Option>
          ))}
        </Select>
      </div>
      {/* <div className='flex items-center gap-1'>
        <strong>Location:</strong>
        <Select
          value={record.countries}
          key={Math.random()}
          options={COUNTRIES}
          mode='multiple'
          onChange={(value) => handleChooseSelect({value, record, field_name: "countries", is_all})}
        />
      </div> */}
      <div className='flex items-center gap-1'>
        <strong>Age:</strong>
        <Select
          style={{ width: '70px' }}
          key={Math.random()}
          value={record.age_min}
          showSearch
          onChange={(value) => handleChooseSelect({value, record, field_name: "age_min", is_all, data_update: {age_min: value}})}
        >
          {AGES.map(age => (
            <Option key={age.label} value={age.value}>{age.label}</Option>
          ))}
        </Select>
        {" "}
        <Select
          style={{ width: '70px' }}
          key={Math.random()}
          value={record.age_max}
          showSearch
          onChange={(value) => handleChooseSelect({value, record, field_name: "age_max", is_all, data_update: {age_max: value}})}
        >
          {AGES.map(age => (
            <Option key={age.label} value={age.value}>{age.label}</Option>
          ))}
        </Select>
      </div>
      <div className='flex items-center gap-1'>
        <strong>Gender:</strong>
        <Radio.Group
          value={record.gender}
          key={Math.random()}
          onChange={(e) => handleChooseSelect({value: e.target.value, record, field_name: "gender", is_all, data_update: {gender: e.target.value}})}
        >
          {GENDERS.map(gender => (
            <Radio key={gender.value} value={gender.value}>{gender.label}</Radio>
          ))}
        </Radio.Group>
      </div>
      <div className='flex items-center gap-1'>
        <strong>Target:</strong>
        <Select
          key={Math.random()}
          style={{width: 200}}
          options={targets}
          value={record.flexiable}
          onChange={(value) => handleChooseSelect({value, record, field_name: "flexiable", is_all, data_update: {flexiable: value}})}
        />
      </div>
      <div style={{width: "100%"}} className='flex items-center gap-1'>
        <strong>Ad sources:</strong>
        <Select
          key={Math.random()}
          style={{width: 200}}
          options={CATAlOGS}
          value={record?.product_catalog}
          onChange={chooseCatalog}
          placeholder="Please select a catalog"
        />
        <Select
          key={Math.random()}
          style={{width: 200}}
          options={productSets}
          value={record?.product_set}
          onChange={chooseProductsets}
          loading={loadingProductSets}
          disabled={loadingProductSets}
          showSearch
          placeholder="Please select a product set"
        />
      </div>
    </div>
  )
}

export default Index