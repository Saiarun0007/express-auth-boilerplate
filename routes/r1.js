
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', handler);

async function handler(req, res) {

    const { user_id } = req.session;
    // You can use the user_id to fetch user-specific data if needed
    const user = await User.findById(user_id);
    res.render('secret', { username: user.username });

}
module.exports = router;