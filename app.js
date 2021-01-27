const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

const port = 3000;

// connect to mongoDB using mongooose
mongoose.connect('mongodb://localhost:27017/za-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
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

// CRUD

// home page
app.get('/', (req, res) => {
    res.render('home', { title: '' });
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
