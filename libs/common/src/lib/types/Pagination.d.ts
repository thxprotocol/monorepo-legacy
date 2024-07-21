type TPaginationParams = Partial<{
    page: number;
    limit: number;
    total: number;
    previous?: { page: number };
    next?: { page: number };
    metadata?: Record<string, any>;
}>;

type TPaginationResult = {
    page: number;
    total: number;
};
