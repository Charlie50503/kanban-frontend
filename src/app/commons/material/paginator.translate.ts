import { MatPaginatorIntl } from '@angular/material/paginator';

export class MatPaginatorIntlTw extends MatPaginatorIntl {
  override itemsPerPageLabel = '每頁筆數';
  override nextPageLabel = '下一頁';
  override previousPageLabel = '上一頁';
  override firstPageLabel = '首頁';
  override lastPageLabel = '尾頁';

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number,
  ): string => {
    if (length === 0 || pageSize === 0) {
      return `目前為第 0 頁，總共 0 頁，共 0 筆`;
    }
    length = Math.max(length, 0);
    const totalPageSize = Math.ceil(length / pageSize); // 總頁數
    const START_INDEX: number = page * pageSize;
    const END_INDEX: number =
      START_INDEX < length
        ? Math.min(START_INDEX + pageSize, length)
        : START_INDEX + pageSize;
    return `目前為第 ${page + 1} 頁，總共 ${totalPageSize} 頁，共 ${length} 筆`;
  };
}
