const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateCampground, isLoggedIn, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

router.route('/')
    // get route to view all campgrounds  
    .get(catchAsync(campgrounds.index))

    // post route redirects to the NEW added campground based on its id
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.single('image'), (req, res) => {
        res.send(req.body, req.file);
    })

// get route to add new campground  
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    // get route to show campground by id  
    .get(catchAsync(campgrounds.showCampground))

    // put route to edit campground by id  
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

    // delete route to delete campground by id  
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


// get route to edit campground by id  
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;