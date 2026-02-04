const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const r1 = require('./routes/r1');
const User = require('./models/user');
const app = express();

mongoose.connect('mongodb://localhost:27017/testdb').then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express Auth API',
            version: '1.0.0',
            description: 'Auto-generated documentation for Login/Register API',
        },
        servers: [{ url: 'http://localhost:3001' }],
    },
    apis: ['./index.js'],
};

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        req.flash('error', 'You must be logged in to view this page.');
        return res.redirect('/login');
    }
    next();
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /verySecret:
 *   get:
 *     summary: Access the secret page (requires login)
 *     responses:
 *       200:
 *         description: Secret page rendered
 *       302:
 *         description: Redirect to /login if not authenticated
 */

app.use('/verySecret', requireLogin, r1);

app.use('/login', require('./routes/login'));
app.use('/register', require('./routes/register'));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns the homepage
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/', (req, res) => {
    res.send('this is homepage');
});

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Render the login page
 *     responses:
 *       200:
 *         description: Login page rendered
 *   post:
 *     summary: Authenticate user and start session
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect to /verySecret on success
 *       200:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /register:
 *   get:
 *     summary: Render the registration page
 *     responses:
 *       200:
 *         description: Registration page rendered
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect to /verySecret after registration
 */

/**
 * @swagger
 * /verySecret:
 *   get:
 *     summary: Access the secret page (requires login)
 *     responses:
 *       200:
 *         description: Secret page rendered
 *       302:
 *         description: Redirect to /login if not authenticated
 */

app.get('/secret', requireLogin, (req, res) => {
    res.send('This is a secret route!', req.body);
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});