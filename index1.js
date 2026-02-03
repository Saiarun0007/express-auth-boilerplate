const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const r1 = require('./routes/r1');
const User = require('./models/user');
const app = express();

const dbUrl = 'mongodb://localhost:27017/testdb';

mongoose.connect(dbUrl).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(flash());
app.use(express.urlencoded({ extended: true }));

// 2. Configure session to use MongoStore
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ // This requires connect-mongo v4 or higher
        mongoUrl: 'mongodb://localhost:27017/testdb',
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        req.flash('error', 'You must be logged in to view this page.');
        return res.redirect('/login');
    }
    next();
};

app.use('/verySecret', requireLogin, r1);

app.get('/', (req, res) => {
    res.send('this is homepage');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
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
        res.send("An error occurred during login.");
    }
});

app.get('/register', (req, res) => {
    res.render('regester');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        req.session.user_id = newUser._id;
        res.redirect('/verySecret');
    } catch (e) {
        res.send("Error during registration.");
    }
});

app.get('/secret', requireLogin, (req, res) => {
    res.send('This is a secret route!');
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});