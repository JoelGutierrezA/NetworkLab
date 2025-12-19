export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    // Legacy support
    [key: string]: any;
}
