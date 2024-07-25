"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = deepMerge;
function deepMerge(obj1, obj2) {
    const result = {};
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key]) && obj2.hasOwnProperty(key)) {
                result[key] = deepMerge(obj1[key], obj2[key]);
            }
            else {
                result[key] = obj1[key];
            }
        }
    }
    for (const key in obj2) {
        if (obj2.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
            result[key] = obj2[key];
        }
    }
    return result;
}
