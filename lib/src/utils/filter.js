"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSugarFilter = void 0;
/**
 * Transforms an object into an array of filter objects. If a value in the object is an array,
 * it will create an `$or` filter object with each element in the array. Otherwise, it simply
 * adds the key and value as a filter object. If there's only one filter object, it returns that object.
 * If there are multiple, it returns them wrapped in an `$and` operator.
 *
 * @param {SugarFilterType} filter - The filter object containing fields and their corresponding values (either numbers, strings, or arrays of numbers or strings).
 * @returns {Object | { $and: Object[] }} A single filter object or an object with an `$and` operator containing an array of filter objects.
 *
 * @example
 * const filter = {
 *     name: "John",
 *     age: 30,
 *     tags: ["active", "new"]
 * };
 * const result = createFilter(filter);
 * // Output: { "$and": [{ "name": "John" }, { "age": 30 }, { "$or": [{ "tags": "active" }, { "tags": "new" }] }] }
 */
const createSugarFilter = (filter) => {
    const params = Object.keys(filter);
    const filterArr = [];
    for (let param of params) {
        const value = filter[param];
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const $orFilter = value.map((ele) => {
                    return { [param]: ele };
                });
                filterArr.push({ $or: $orFilter });
            }
        }
        else if (value !== undefined) {
            filterArr.push({ [param]: value });
        }
    }
    if (filterArr.length === 1) {
        return filterArr[0];
    }
    else {
        return { $and: filterArr };
    }
};
exports.createSugarFilter = createSugarFilter;
//# sourceMappingURL=filter.js.map