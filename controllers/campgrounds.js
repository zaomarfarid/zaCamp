const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds, title: ' - Campgrounds' });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new', { title: ' - New' });
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('campgrounds/show', { campground, title: ` - ${campground.title}` });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground, title: ' - Edit' });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
    campground.images.push(...(req.files.map(file => ({ url: file.path, filename: file.filename }))));
    await campground.save();
    console.log(campground.images)
    if (req.body.deleteImages) {
        req.body.deleteImages.forEach(async filename => {
            await cloudinary.uploader.destroy(filename);
        });
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}