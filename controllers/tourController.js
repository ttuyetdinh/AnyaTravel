const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// Middleware implementation to check if the ID is valid
exports.checkId = (req, res, next, val) => {
    console.log(`Tour id is: ${val}`);
    if (parseInt(val) > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }
    next();
};

// Middleware implementation to check if the body contains the name prop
exports.checkBody = (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({
            status: 'fail',
            message: 'Name is missing',
        });
    }
};

exports.deleteTour = (req, res) => {
    const id = parseInt(req.params.id);
    const tour = tours.find((e) => e.id === id);

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
};

exports.updateTour = (req, res) => {
    const id = parseInt(req.params.id);
    const tour = tours.find((e) => e.id === id);

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Updated tour',
        },
    });
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    });
};

exports.getTour = (req, res) => {
    const id = parseInt(req.params.id);
    const tour = tours.find((e) => e.id === id);

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
};
