import { BIG_QUERY_TYPE, MODE } from 'src/constants';

export const GET_ITEM_BQUERY_ITEM_NAME_ITEM_TYPE = `SELECT RETAILER_ID as ID,
ITEM_TYPE as Type,
ITEM_NAME as  Name,
ITEM_QUANTITY as Quantity,
ITEM_BRAND as Brand,
ITEM_PRICE Price,
FROM \`retailer-system-373507.Retailer_System.data\` 
where ITEM_NAME = @item_name  and ITEM_TYPE = @item_type`;

export const UPDATE_DATA_BIGQUERY = `UPDATE \`retailer-system-373507.Retailer_System.data\`
SET ITEM_QUANTITY = ITEM_QUANTITY - @quantity
WHERE retailer_id = @retailer_id and item_id = @item_id`;

export const GET_ALL_UNAPPROVED_DATA =
  'SELECT * FROM `retailer-system-373507.nonApprovedData.data`';
export const GET_ITEM_UNAPPROVED_DATA =
  'SELECT * FROM `retailer-system-373507.nonApprovedData.data` where ITEM_ID = @item_id';

export const REJECT_UNAPPROVED_DATA =
  'DELETE FROM `retailer-system-373507.nonApprovedData.data` where ITEM_ID = @item_id';

export const GET_ITEM_BQUERY_RETAILER = `SELECT * FROM 
\`retailer-system-373507.Retailer_System.data\`
where 
RETAILER_ID = @retailer_id`;
export const DELETE_DATA_UNAPPROVED =
  'DELETE FROM `retailer-system-373507.nonApprovedData.data` where ITEM_ID = @item_id';
export const LIST_ALL_ITEMS_BQUERY = `SELECT * FROM 
\`retailer-system-373507.Retailer_System.data\``;
export const GET_ITEMS_TYPE_RETAILER = `SELECT * FROM
 \`retailer-system-373507.Retailer_System.data\`
  WHERE RETAILER_ID = @RETAILER_ID 
  AND 
  ITEM_ID = @ITEM_ID`;
export const SCHEMA = [
  {
    name: 'ITEM_ID',
    type: BIG_QUERY_TYPE.INTEGER,
    mode: MODE.required,
  },
  {
    name: 'RETAILER_ID',
    type: BIG_QUERY_TYPE.INTEGER,
    mode: MODE.required,
  },
  {
    name: 'ITEM_TYPE',
    type: BIG_QUERY_TYPE.STRING,
    mode: MODE.required,
  },
  {
    name: 'ITEM_NAME',
    type: BIG_QUERY_TYPE.STRING,
    mode: MODE.required,
  },
  {
    name: 'ITEM_QUANTITY',
    type: BIG_QUERY_TYPE.INTEGER,
    mode: MODE.required,
  },
  {
    name: 'ITEM_BRAND',
    type: BIG_QUERY_TYPE.STRING,
    mode: MODE.required,
  },
  {
    name: 'ITEM_PRICE',
    type: BIG_QUERY_TYPE.INTEGER,
    mode: MODE.required,
  },
];
