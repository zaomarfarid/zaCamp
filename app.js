const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const port = 3000;

// connect to mongoDB using mongooose
mongoose.connect('mongodb://localhost:27017/za-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// check the database connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => { console.log('Database connected') });

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// to parse req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

// review validation middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// CRUD functionality

// home page
app.get('/', (req, res) => {
    res.render('home', { title: '' });
});

// get route to view all campgrounds  
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds, title: ' - Campgrounds' });
}));

// get route to add new campground  
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new', { title: ' - New' });
});

// post route redirects to the NEW added campground based on its id
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// get route to show campground by id  
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground, title: ` - ${campground.title}` });
}));

// get route to edit campground by id  
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground, title: ' - Edit' });
}));

// put route to edit campground by id  
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
}));

// delete route to delete campground by id  
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// post route to add a review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete route to delete a review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res,) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

// all other routes 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// error handler
app.use((err, req, res, next) => {
    !err.statusCode && (err.statusCode = '500');
    !err.message && (err.message = 'Oh No, Something went wrong');
    res.status(err.statusCode).render('error', { err });
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
});
