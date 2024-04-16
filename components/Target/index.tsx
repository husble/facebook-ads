import { COUNTRIES, FLEXIABLE_OPTIONS, GENDERS, Product, TARGET, createAgeOptions } from '#/ultils'
import { InputNumber, Radio, Select } from 'antd'
import React from 'react'

const {Option} = Select

const AGES = createAgeOptions()

function Index({record, handleChooseSelect, is_all}: {record: Product | TARGET, handleChooseSelect: Function, is_all: boolean}) {
  return (
    <>
      <strong>Daily Budget</strong>
        <InputNumber
          prefix="$"
          value={record.ad_set_daily_budget}
          key={Math.random()}
          onBlur={(e) => handleChooseSelect({value: e.target.value, record, field_name: "ad_set_daily_budget", is_all})}
        />
        <strong>Location: </strong>
        <Select
          value={record.countries}
          key={Math.random()}
          options={COUNTRIES}
          mode='multiple'
          onChange={(value) => handleChooseSelect({value, record, field_name: "countries", is_all})}
        />
        <strong> Age: </strong>
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
        <strong> Gender: </strong>
        <Radio.Group
          value={record.gender}
          key={Math.random()}
          onChange={(e) => handleChooseSelect({value: e.target.value, record, field_name: "gender", is_all})}
        >
          {GENDERS.map(gender => (
            <Radio key={gender.value} value={gender.value}>{gender.label}</Radio>
          ))}
        </Radio.Group>
        <strong>Target</strong>
        <Select
          key={Math.random()}
          style={{width: 200}}
          options={FLEXIABLE_OPTIONS}
          value={record.flexiable}
          onChange={(value) => handleChooseSelect({value, record, field_name: "flexiable", is_all})}
        />
    </>
  )
}

export default Index