const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const ExpressError = require('./utils/ExpressError');

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

// serve static assets
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// importing routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// home page
app.get('/', (req, res) => {
    res.render('home', { title: '' });
});

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
