/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { Task } from '../models/task';
export interface Column {

  /**
   * 欄位顏色
   */
  color: string;

  /**
   * 欄位唯一識別碼
   */
  id?: string;

  /**
   * 欄位順序
   */
  order: number;

  /**
   * 欄位內的任務列表
   */
  tasks?: Array<Task>;

  /**
   * 欄位標題
   */
  title: string;
}
