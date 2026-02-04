const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
    res.render('regester');
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    const hashedPassword = await bcrypt.hash(password, 10); // In real applications, hash the password before storing

    const newUser = new User({ username, password: hashedPassword });
    // res.send('Registration successful! :' + hashedPassword);
    await newUser.save().then(() => {
        console.log('User registered successfully');
    }).catch((err) => {
        console.error('Error registering user', err);
    });
    req.session.user_id = newUser._id; // Store user ID in session

    res.redirect('/verySecret');
});

module.exports = router;