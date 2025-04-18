export interface Pagination {
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