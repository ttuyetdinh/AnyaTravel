class APIQuery {
    constructor(model, queryObj) {
        this.query = model.find();
        this.queryObj = queryObj;
    }

    filter() {
        // basic filter
        const filterObj = { ...this.queryObj }; // copy it because we don't want to modify the original query
        const excludedFields = ['page', 'sort', 'limit', 'fields']; // exclude mongoDB query operators
        excludedFields.forEach((el) => delete filterObj[el]);

        //--advanced query
        // const products = await Product.find({ price: { $gte: 50, $lte: 100 } }); for range
        // const products = await Product.find({ price: { $in: [50, 100] } }); for exact match (multiple values)
        // const products = await Product.find({ price: 50 }); for exact match (single value)
        const filterStr = JSON.stringify(filterObj).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(filterStr));

        return this;
    }

    sort() {
        if (this.queryObj.sort) {
            const sortBy = this.queryObj.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }

        return this;
    }

    limitFields() {
        if (this.queryObj.fields) {
            const fields = this.queryObj.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }

        return this;
    }

    paginate() {
        const page = this.queryObj.page * 1 || 1;
        const limit = this.queryObj.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIQuery;
