/**
 * Filters the fields of an object based on the specified mode and fields array.
 * @param {object} obj - The object to filter.
 * @param {string[]} fields - The array of fields to include or exclude.
 * @param {string} [mode='include'] - The mode of filtering. Possible values are 'include' and 'exclude'.
 * @param {boolean} [includeId=false] - Whether to include the 'id' field in the filtered object.
 * @returns {object} - The filtered object.
 */
exports.filterFields = (obj, fields, mode = 'include', includeId = false) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (
            (includeId && el === '_id') ||
            (mode === 'include' && fields.includes(el)) ||
            (mode === 'exclude' && !fields.includes(el))
        ) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};
