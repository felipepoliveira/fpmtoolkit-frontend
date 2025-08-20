import { useEffect, useState } from "react"
import { mockPaginationMetadata, PaginationMetadata } from "../../types/backend-api/pagination"

type DataSourceFunction<Type> = (currentPage: number, itemsPerPage: number, _mockedDataSource: Type[]) => Promise<Type[]>
type PaginationSourceFunction = (itemsPerPage: number, _mockedPagination: PaginationMetadata) => Promise<PaginationMetadata>

interface PaginationCursor {
    /**
     * Advances to the next page.
     */
    nextPage: () => void;
    /**
     * Goes back to the previous page.
     */
    previousPage: () => void;
    /**
     * Sets the current page to the specified page number.
     * @param page The page number to set as current.
     */
    setPage: (page: number) => void;
    /**
     * Refreshes the current page, re-triggering data fetch.
     */
    refresh: () => void;
    /**
     * Return a flag indicating if the pagination is on the last page
     * @returns 
     */
    onLastPage: () => boolean;
}

interface PaginatedQuery<Type> {
    /**
     * Data retrieved from the pagination operation
     */
    data: Type[],
    /**
     * Current pagination metadata
     */
    pagination: PaginationMetadata,
    /**
     * Cursor to navigate in the pagination data
     */
    cursor: PaginationCursor,
}



export function usePaginatedQuery<Type>({ dataSourceFn, paginationSourceFn, itemsPerPage, ...cfg }:  {
    /**
     * The data source function that will fetch data
     */
    dataSourceFn: DataSourceFunction<Type>,
    /**
     * The pagination function that will retrieve pagination metadata
     */
    paginationSourceFn: PaginationSourceFunction,
    /**
     * How many items should be contained per page
     */
    itemsPerPage: number,
    
    /// Other configurations goes here
    /**
     * If undefined or true will always restrict the cursor to pagination bounds where
     * the minimum value of the page will be 1 and the maximum will be pagination.totalPages
     */
    restrictCursorToPaginationBounds?: boolean,
}) : PaginatedQuery<Type> {

    const [data, setData] = useState<Type[]>([])
    const [pagination, setPagination] = useState(mockPaginationMetadata(itemsPerPage))
    const [currentPage, setCurrentPage] = useState(pagination.currentPage)

    const cursor : PaginationCursor = {
        nextPage: () => setCurrentPage(coercePaginationBoundsIfDefined(currentPage + 1)),
        previousPage: () => setCurrentPage(coercePaginationBoundsIfDefined(currentPage - 1)),
        setPage: (page: number) => setCurrentPage(coercePaginationBoundsIfDefined(page)),
        refresh: () => setCurrentPage(coercePaginationBoundsIfDefined(currentPage)),
        onLastPage: () => currentPage == pagination.totalPages
    }

    function coercePaginationBoundsIfDefined(value: number): number {
        if (!cfg.restrictCursorToPaginationBounds || cfg.restrictCursorToPaginationBounds === true) {
            if (value < 1) return 1
            else if (value > pagination.totalPages) return pagination.totalPages
            else return value
        } else {
            return value
        }
    }

    /**
     * Trigger pagination fetching operations
     */
    useEffect(() => {
        const fetchPagination = async () => {
            setPagination(await paginationSourceFn(itemsPerPage, mockPaginationMetadata(itemsPerPage)))
        }
        fetchPagination()
    }, [currentPage])

    /**
     * Trigger data fetching operations
     */
    useEffect(() => {
        const fetchData = async () => {
            setData(await dataSourceFn(currentPage, itemsPerPage, []))
        }
        fetchData()
    }, [pagination])
    
    return {
        data: data,
        pagination: pagination,
        cursor: cursor
    }

}