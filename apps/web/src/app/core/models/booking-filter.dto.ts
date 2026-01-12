export class AvailableJobFilterDTO {
    serviceId?: number;
    startDateFrom?: string;
    startDateTo?: string;
    minPrice?: number;
    maxPrice?: number;
    province?: string;
    sortBy?: string; // "date", "price"
    sortOrder?: string; // "asc", "desc"
    pageIndex: number = 1;
    pageSize: number = 10;
}
