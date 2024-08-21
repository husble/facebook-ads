import { GET_CONFIG } from '#/graphql/query'
import { COUNTRIES, GENDERS, Product, TARGET, createAgeOptions } from '#/ultils'
import { useQuery } from '@apollo/client'
import { InputNumber, Radio, Select } from 'antd'
import React, { useState } from 'react'
import { CONFIG, DATA_VALUE, TYPE_TARGET } from '../Settings/Target/type'

const {Option} = Select

const AGES = createAgeOptions()

function Index({record, handleChooseSelect, is_all}: {record: Product | TARGET, handleChooseSelect: Function, is_all: boolean}) {
  const [targets, setTarget] = useState<any[]>([])
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
  return (
    <div className='flex items-center flex-wrap gap-2'>
      <div className='flex items-center gap-1'>
        <strong>Daily Budget:</strong>
        <InputNumber
          prefix="$"
          value={record.ad_set_daily_budget}
          key={Math.random()}
          onBlur={(e) => handleChooseSelect({value: e.target.value, record, field_name: "ad_set_daily_budget", is_all})}
        />
      </div>
      <div className='flex items-center gap-1'>
        <strong>Location:</strong>
        <Select
          value={record.countries}
          key={Math.random()}
          options={COUNTRIES}
          mode='multiple'
          onChange={(value) => handleChooseSelect({value, record, field_name: "countries", is_all})}
        />
      </div>
      <div className='flex items-center gap-1'>
        <strong>Age:</strong>
        <Select
          style={{ width: '70px' }}
          key={Math.random()}
          value={record.age_min}
          showSearch
          onChange={(value) => handleChooseSelect({value, record, field_name: "age_min", is_all})}
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
          onChange={(value) => handleChooseSelect({value, record, field_name: "age_max", is_all})}
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
          onChange={(e) => handleChooseSelect({value: e.target.value, record, field_name: "gender", is_all})}
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
          onChange={(value) => handleChooseSelect({value, record, field_name: "flexiable", is_all})}
        />
      </div>
    </div>
  )
}

export default Index