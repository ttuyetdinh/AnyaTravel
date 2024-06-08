//  a wrapper to wrap the async function and catch the error for Express middleware
module.exports = wrapperAsync =
    (fn) =>
    (...args) => {
        const func = fn(...args);
        const next = args[args.length - 1];
        return Promise.resolve(func).catch(next);
    };

// Fully syntax version
// const wrapperrAsync = function (fn) {
//     return function (...args) {
//         const func = fn(...args);
//         const next = args[args.length - 1];
//         return Promise.resolve(func).catch((error) => next(error));
//     };
// };
