export interface IPagination {
    count: number;
    nextPage: number;
    previousPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pages: number;
    page: number;
    limit: number;
    pagingCounter: number;
}
