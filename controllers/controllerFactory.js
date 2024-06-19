const wrapperAsync = require('../utils/wrapperAsync');
const AppError = require('../utils/appError');
const APIQuery = require('../utils/APIQuery');
const tools = require('../utils/tools');

exports.getOne = (Model, populateOptions, filterOptions, filterType, includeId) =>
    wrapperAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (populateOptions) query = query.populate(populateOptions);

        const collectionName = getCollectionName(Model);
        const docs = await query;

        if (!docs) {
            return next(new AppError(`No ${collectionName} found with that ID`, 404));
        }

        const filterDoc = tools.filterFields(docs.toObject(), filterOptions, filterType, includeId);

        res.status(200).json({
            status: 'success',
            results: filterDoc.length,
            data: {
                [collectionName]: filterDoc,
            },
        });
    });

exports.getAll = (Model, filterOptions, filterType, includeId) =>
    wrapperAsync(async (req, res) => {
        // To allow for nested GET reviews on tour
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };
        const collectionName = getCollectionName(Model);

        const apiQuery = new APIQuery(Model.find(filter), req.query)
            .filter()
            .populate()
            .sort()
            .limitFields()
            .paginate();

        const docs = await apiQuery.query;
        const filterDocs = docs.map((doc) => tools.filterFields(doc.toObject(), filterOptions, filterType, includeId));

        res.status(200).json({
            status: 'success',
            results: filterDocs.length,
            data: {
                [collectionName]: filterDocs,
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
