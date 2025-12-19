import { Request } from 'express';
import { ResultSetHeader as MySQLResultSetHeader, RowDataPacket as MySQLRowDataPacket, OkPacket } from 'mysql2';

// TIPOS DE MYSQL2

/**
 * Tipo para resultados de queries SELECT
 * Representa una fila de datos retornada por MySQL
 */
export type RowDataPacket = MySQLRowDataPacket;

/**
 * Tipo para resultados de INSERT, UPDATE, DELETE
 * Contiene información sobre filas afectadas, insertId, etc.
 */
export type ResultSetHeader = MySQLResultSetHeader;

/** Tipo para operaciones que retornan OK */
export type MySQLOkPacket = OkPacket;

// TIPOS DE JWT

/** Payload del JWT usado en autenticación */
export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

/** Resultado de decodificar un JWT (puede ser null si falla) */
export type DecodedJwt = JwtPayload | null;

// TIPOS DE EXPRESS EXTENDIDOS

/**
 * Request de Express extendido con información del usuario autenticado
 * Usado después del middleware authenticateToken
 */
export interface AuthRequest extends Request {
    user?: JwtPayload;
}

// TIPOS DE RESPUESTAS API

/** Formato estándar de respuesta API */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

/** Respuesta de error API */
export interface ApiErrorResponse {
    success: false;
    message: string;
    error?: string;
}

/** Respuesta exitosa de API */
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    message?: string;
    data?: T;
}

// TIPOS DE ERRORES MYSQL

/** Error de MySQL con código y detalles */
export interface MySQLError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
}

/** Type guard para verificar si un error es un MySQLError */
export function isMySQLError(error: unknown): error is MySQLError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof (error as MySQLError).code === 'string'
    );
}

/** Type guard para verificar si un error tiene mensaje */
export function hasMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: string }).message === 'string'
    );
}
