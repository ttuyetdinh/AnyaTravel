const fs = require('fs');
const Tour = require('../models/tourModel');
const APIQuery = require('../utils/APIQuery');
const wrapperAsync = require('../utils/wrapperAsync');
const AppError = require('../utils/appError');
const factory = require('./controllerFactory');

exports.aliasTopTours = (req, res, next) => {
    // middleware
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next(); // call the next action
};

exports.getToursStats = wrapperAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                expectRevenue: {
                    $sum: {
                        $multiply: ['$price', '$maxGroupSize'],
                    },
                },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: -1 },
        },
        {
            $match: {
                // like the having in sql
                // _id: { $ne: 'easy' },
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = wrapperAsync(async (req, res) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        { $unwind: '$startDates' },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStart: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0, // ignore the id field
            },
        },
        {
            $sort: { month: 1 },
        },
        // {
        //     $limit: 12,
        // },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
