const fs = require('fs');
const Tour = require('../models/tourModel');
const APIQuery = require('../utils/APIQuery');
const wrapperAsync = require('../utils/wrapperAsync');
const AppError = require('../utils/appError');

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

exports.getTour = wrapperAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.getAllTours = wrapperAsync(async (req, res) => {
    const apiQuery = new APIQuery(Tour.find(), req.query).filter().sort().limitFields().paginate();

    const tours = await apiQuery.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.createTour = wrapperAsync(async (req, res) => {
    const newTour = await Tour.create(req.body); // validator for create is enabled by default

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
});

exports.updateTour = wrapperAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true, // validator for update is disabled by default
    });

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = wrapperAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
