import { body } from 'express-validator';

export const changePasswordValidator = [
    body('oldPassword')
        .trim()
        .notEmpty().withMessage('oldPassword es requerido')
        .isString().withMessage('oldPassword debe ser texto')
        .isLength({ min: 6 }).withMessage('oldPassword debe tener al menos 6 caracteres'),

    body('newPassword')
        .trim()
        .notEmpty().withMessage('newPassword es requerido')
        .isString().withMessage('newPassword debe ser texto')
        .isLength({ min: 6 }).withMessage('newPassword debe tener al menos 6 caracteres'),
];
