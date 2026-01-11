export class AvailableJobFilterDTO {
    serviceId?: number;
    startDateFrom?: string;
    startDateTo?: string;
    minPrice?: number;
    maxPrice?: number;
    province?: string;
    sortBy?: string; // "date", "price"
    sortOrder?: string; // "asc", "desc"
    skip: number = 0;
    take: number = 20;
}
