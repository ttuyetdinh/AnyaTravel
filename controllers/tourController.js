const fs = require('fs');
const Tour = require('../models/tourModel');
const { APIQuery } = require('../ultis/APIQuery');

exports.aliasTopTours = (req, res, next) => {
    // middleware
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next(); // call the next action
};

exports.getToursStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.getAllTours = async (req, res) => {
    try {
        const tourQuery = new APIQuery(Tour, req.query).filter().sort().limitFields().paginate();

        const tours = await tourQuery.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body); // validator for create is enabled by default

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true, // validator for update is disabled by default
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            data: error,
        });
    }
};
