const express = require('express');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        await User.register(user, password);
        req.flash('success', 'Welcome to zaCamp!');
        res.redirect('/');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/campgrounds');
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
});



module.exports = router;