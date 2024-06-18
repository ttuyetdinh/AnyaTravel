const lodash = require('lodash');
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            minLength: [10, 'A tour name must have at least 10 characters'],
            maxLength: [40, 'A tour name must have at most 40 characters'],
        },
        slugName: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false, // Hide this field from the output
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        // add virtual properties when converting to JSON or Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Virtual properties
tourSchema.virtual('durationWeeks').get(function () {
    const weeks = Math.trunc(this.duration / 7);
    const days = this.duration % 7;
    return `${weeks} weeks and ${days} days`;
});

// Mongoose does not populate virtual by default, need to specify it in populate()
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// document middleware: runs before .save(), .validate(), remove(), init()
tourSchema.pre('save', function (next) {
    this.slugName = lodash.kebabCase(this.name);
    next();
});
// only need for embedding not referencing
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// query middleware: runs before find(), findOne(), findOneAndUpdate(), etc.
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: 'name email',
    });
    next();
});

// aggregation middleware: runs before aggregation
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
