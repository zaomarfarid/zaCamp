const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

// get route to view all campgrounds  
router.get('/', catchAsync(campgrounds.index));

// get route to add new campground  
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// post route redirects to the NEW added campground based on its id
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// get route to show campground by id  
router.get('/:id', catchAsync(campgrounds.showCampground));

// get route to edit campground by id  
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// put route to edit campground by id  
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// delete route to delete campground by id  
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;