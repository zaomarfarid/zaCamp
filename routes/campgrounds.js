const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Campground = require('../models/campground');

const { isLoggedIn } = require('../middleware');

// campground validation middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        // const msg = error.details[0].message;
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// get route to view all campgrounds  
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds, title: ' - Campgrounds' });
}));

// get route to add new campground  
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new', { title: ' - New' });
});

// post route redirects to the NEW added campground based on its id
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// get route to show campground by id  
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground, title: ` - ${campground.title}` });
}));

// get route to edit campground by id  
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissoion to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campgrounds/edit', { campground, title: ' - Edit' });
}));

// put route to edit campground by id  
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissoion to do that!');
    } else {
        req.flash('success', 'Successfully updated campground!');
        await Campground.findByIdAndUpdate(id, req.body.campground);
    }
    res.redirect(`/campgrounds/${id}`);
}));

// delete route to delete campground by id  
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;