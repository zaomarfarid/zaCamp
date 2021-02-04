const express = require('express');
const passport = require('passport');
const router = express.Router();

const users = require('../controllers/users')

router.get('/register', users.renderRegister);

router.post('/register', users.register);

router.get('/login', users.renderLogin);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;