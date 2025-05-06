import { TablePaginationConfig } from "antd";

export interface PaginationMetadata {
    /**
     * * The number of items per page
     */
    itemsPerPage: number,
    /**
     * The total number of records in the database
     */
    totalRecords: number,
    /**
     * The current page of the pagination
     */
    currentPage: number,
}

export function parsePaginationMetadataToAntTablePaginationConfig(
    p: PaginationMetadata, 
    currentPage: number, 
    onPageChangeCallback: (page: number) => void | undefined,
    otherProps: TablePaginationConfig = {}): TablePaginationConfig {

    return {
        current: currentPage,
        pageSize: p.itemsPerPage,
        total: p.totalRecords,
        onChange(page) {
            onPageChangeCallback(page)
        },
        ...otherProps,
    }

}