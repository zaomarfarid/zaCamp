const express = require('express');
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
        console.log(user);
        req.flash('success', 'Welcome to zaCamp!');
        res.redirect('/');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
});

module.exports = router;