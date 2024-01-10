export type TPaginationParams = Partial<{
    page: number;
    limit: number;
    total: number;
    previous?: { page: number };
    next?: { page: number };
}>;

export type TPaginationResult = {
    limit: number;
    page: number;
    total: number;
};
