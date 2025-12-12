"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalToNumber = decimalToNumber;
exports.numberToDecimal = numberToDecimal;
exports.dateToISOString = dateToISOString;
exports.isoStringToDate = isoStringToDate;
exports.sanitizeObject = sanitizeObject;
const library_1 = require("@prisma/client/runtime/library");
/**
 * Transform Prisma Decimal to number for API responses
 */
function decimalToNumber(value) {
    if (!value)
        return null;
    return value.toNumber();
}
/**
 * Transform number to Prisma Decimal for database operations
 */
function numberToDecimal(value) {
    if (value === null || value === undefined)
        return null;
    return new library_1.Decimal(value);
}
/**
 * Transform date to ISO string for API responses
 */
function dateToISOString(value) {
    if (!value)
        return null;
    return value.toISOString();
}
/**
 * Transform ISO string to Date for database operations
 */
function isoStringToDate(value) {
    if (!value)
        return null;
    return new Date(value);
}
/**
 * Remove sensitive fields from object
 */
function sanitizeObject(obj, fieldsToRemove) {
    const sanitized = { ...obj };
    fieldsToRemove.forEach((field) => {
        delete sanitized[field];
    });
    return sanitized;
}
