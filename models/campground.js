const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete' || 'deleteMany', async deletedCampground => {
    if (deletedCampground) {
        // deletedCampground.images.forEach(async image => {
        //     await cloudinary.uploader.destroy(image.filename);
        // });
        await Review.deleteMany({ _id: { $in: deletedCampground.reviews } });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);