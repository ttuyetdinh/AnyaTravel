const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// COmpound index to optimize the query and prevent duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// static method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stat = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                numberRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stat.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stat[0].numberRating,
            ratingsAverage: stat[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

// document middleware: runs before .save() and .create()
// use post to get all the reviews, including the one just createdx
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
});

// query middleware
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name',
    });
    next();
});

// findByIdAndUpdate, findByIdAndDelete require to use this pattern to update the ratings on update and delete
// purpose: store the TourId in the query object, so that the post middleware can access it
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // this.getQuery() create a new query object, avoid Query was already executed error
    this.r = await this.model.findOne(this.getQuery());
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
