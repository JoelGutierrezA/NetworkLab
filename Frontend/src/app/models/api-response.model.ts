export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    // Some endpoints might return these at top level, but we should standardize.
    // For now, we include them to support legacy responses if needed,
    // but ideally we move towards strict `data` usage.
    [key: string]: any;
}
