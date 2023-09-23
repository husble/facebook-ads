import styled from 'styled-components';

const Style = styled.div`
  background: white;

  .table_packages table thead tr th {
    font-weight: 700;
  }
  .btn-upload {
    height: 40px;
  }

  .file-uploader {
    display: none;
  }

  .base_costs {
    .base_cost_header {
      background-color: #fff;
      padding: 20px;
      box-shadow: var(--shadow);
      top: 0;
      position: sticky;
      margin-bottom: 20px;
      z-index: 10;
    }

    .ant-tabs > .ant-tabs-nav {
      position: sticky;
      top: 140px;
      z-index: 20;
      background-color: #fff;
      font-weight: bold;
      padding: 15px;
      box-shadow: var(--shadow);
    }

    .report_cost {
      table,
      th,
      td {
        border: 1px solid #000;
        padding: 5px 20px;
        text-align: center;
      }

      .btn_toggle {
        cursor: pointer;
        padding: 0 10px;
      }

      tr.hide {
        display: none;
      }
    }

    .not_calc_by_sku {
      background-color: yellow !important;
    }

    .not_cost_est_real {
      background-color: red !important;
    }

    .not_calc_by_sku_cost_est_real {
      background-color: pink !important;
    }

    .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background: unset;
    }
  }
`;

export default Style;
