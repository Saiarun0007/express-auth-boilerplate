const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
    res.render('login');
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user_id = user._id;
                res.redirect('/verySecret');
            } else {
                res.send('Invalid password');
            }
        } else {
            res.send('User not found');
        }
    } catch (e) {
        console.error(e);
        res.send("An error occurred during login.", e);
    }
});

module.exports = router;