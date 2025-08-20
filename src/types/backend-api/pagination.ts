import { TablePaginationConfig } from "antd";

export interface PaginationMetadata {
    /**
     * * The number of items per page
     */
    itemsPerPage: number,
    /**
     * Store the number of pages
     */
    totalPages: number,
    /**
     * The total number of records in the database
     */
    totalRecords: number,
    /**
     * The current page of the pagination
     */
    currentPage: number,
}

export function mockPaginationMetadata(itemsPerPage: number): PaginationMetadata {
    return {
        currentPage: 1,
        itemsPerPage,
        totalPages: 1,
        totalRecords: 0
    }
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