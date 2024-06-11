//  a wrapper to wrap the async function and catch the error for Express middleware
const wrapperAsync =
    (fn) =>
    (...args) => {
        const func = fn(...args);
        const next = args[args.length - 1];
        return Promise.resolve(func).catch(next);
    };

module.exports = wrapperAsync;
// Fully syntax version
// const wrapperrAsync = function (fn) {
//     return function (...args) {
//         const func = fn(...args);
//         const next = args[args.length - 1];
//         return Promise.resolve(func).catch((error) => next(error));
//     };
// };
