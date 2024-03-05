type TPaginationParams = Partial<{
    page: number;
    limit: number;
    total: number;
    previous?: { page: number };
    next?: { page: number };
}>;

type TPaginationResult = {
    page: number;
    total: number;
};
