const fs = require('fs');
const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
    // middleware
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next(); // call the next action
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
        //--basic query
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields']; // excude mongoDB query operators
        excludedFields.forEach((el) => delete queryObj[el]);

        //--advanced query
        // const products = await Product.find({ price: { $gte: 50, $lte: 100 } }); for range
        // const products = await Product.find({ price: { $in: [50, 100] } }); for exact match (multiple values)
        // const products = await Product.find({ price: 50 }); for exact match (single value)

        const queryStr = JSON.stringify(queryObj).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));

        //--sorting results
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //--limiting fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v'); // field for tracking versioning of a document of a collection in MongoDB
        }

        //--pagniation
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit;

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist');
        }
        query = query.skip((page - 1) * limit).limit(limit);

        const tours = await query;

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
        const newTour = await Tour.create(req.body);

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
            runValidators: true,
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
