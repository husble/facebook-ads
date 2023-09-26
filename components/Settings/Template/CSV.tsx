import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileExcelOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Spin, message } from 'antd';

import { transformArrayKeys } from '#/ultils/index';
import { InsertTemplateAds, InsertTemplateAdsItem } from '#/graphql/muation';

function Index({
  currentTemplate,
  setCurrentTemplate,
  refetch,
  fetchTemplateAdsItems
}: any) {
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [insertTemplateAdsItem] = useMutation(InsertTemplateAdsItem);

  const importExcel = (file: File) => {
    setLoading(true);
    const fileReader = new FileReader();

    fileReader.onload = async (event: any) => {
      try {
        const { result } = event.target;
        const workbook = XLSX.read(result, { type: 'binary' });

        let data: any = [];
        for (const Sheet in workbook.Sheets) {
          XLSX.utils.sheet_to_json(workbook.Sheets[Sheet]);
          if (workbook.Sheets.hasOwnProperty(Sheet)) {
            data = XLSX.utils.sheet_to_json(workbook.Sheets[Sheet]);
          }
        }

        const templates = transformArrayKeys<string>(data);

        console.log(
          '%cCSV.tsx line:27 data',
          'color: #007acc;',
          templates.map((t) => ({
            ...t,
            template_ads_id: currentTemplate
          }))
        );

        await insertTemplateAdsItem({
          variables: {
            objects: templates.map((t) => ({
              ...t,
              template_ads_id: currentTemplate
            }))
          }
        });

        refetch();
        fetchTemplateAdsItems();

        message.success('Import successfull!!!');
        setLoading(false);
      } catch (e) {
        console.log(e);
        message.error('Import error!!!');
        setLoading(false);
      }
    };

    setCurrentTemplate('');

    fileReader.readAsBinaryString(file);
  };

  const onImportExcel = (event: any) => {
    const { files } = event.target;

    if (files.length === 1) {
      setFileName(files[0].name);
      importExcel(files[0]);
    }

    event.target.value = '';
  };

  return (
    <Spin spinning={loading}>
      <label
        htmlFor="file-input"
        className="ant-btn ant-btn-primary btn-upload ml-1 d-flex align-items-center"
        style={{
          cursor: 'pointer'
        }}
      >
        <FileExcelOutlined style={{ fontSize: '16px' }} />
        <span className="upload-text">Upload Template</span>
      </label>
      <input
        id="file-input"
        name="file-input"
        className="file-uploader"
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={onImportExcel}
      />
      {fileName && (
        <div className="mx-2">
          <PaperClipOutlined style={{ fontSize: '16px' }} />
          <a className="mx-1" style={{ verticalAlign: 'sub' }}>
            {fileName}
          </a>
        </div>
      )}
    </Spin>
  );
}

export default Index;
