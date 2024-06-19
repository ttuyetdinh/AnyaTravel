const wrapperAsync = require('../utils/wrapperAsync');
const AppError = require('../utils/appError');
const APIQuery = require('../utils/APIQuery');

exports.getOne = (Model, populateOptions) =>
    wrapperAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate(populateOptions);
        const doc = await query;
        const collectionName = getCollectionName(Model);

        if (!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                [collectionName]: doc,
            },
        });
    });

exports.getAll = (Model) =>
    wrapperAsync(async (req, res) => {
        // To allow for nested GET reviews on tour
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        const apiQuery = new APIQuery(Model.find(filter), req.query).filter().sort().limitFields().paginate();
        const docs = await apiQuery.query;

        const collectionName = getCollectionName(Model);

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                [collectionName]: docs,
            },
        });
    });

exports.createOne = (Model) =>
    wrapperAsync(async (req, res) => {
        const doc = await Model.create(req.body);
        const collectionName = getCollectionName(Model);

        res.status(201).json({
            status: 'success',
            data: {
                [collectionName]: doc,
            },
        });
    });

exports.updateOne = (Model) =>
    wrapperAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        const collectionName = getCollectionName(Model);

        if (!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                [collectionName]: doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    wrapperAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        const collectionName = getCollectionName(Model);

        if (!doc) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

// helper
const getCollectionName = (Model) => {
    return Model.modelName.toLowerCase();
};
