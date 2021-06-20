const express = require('express');
const app = express();
const morgan = require("morgan");

const product = require('./routes/product');
const user = require('./routes/user');
const paymentMethod = require('./routes/payment-method');
const sales = require('./routes/sales');
const deliveryman = require('./routes/deliveryman');
const discount = require('./routes/discount');
const salesType = require('./routes/sales-type');
const preSales = require('./routes/pre-sales');
const chatPhone = require('./routes/chat-phone');
const expectedTime = require('./routes/expected-time');

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }
    next();
});

app.use('/product', product);
app.use('/deliveryman', deliveryman);
app.use('/user', user);
app.use('/payment-method', paymentMethod);
app.use('/sales', sales);
app.use('/discount', discount);
app.use('/sales-type', salesType);
app.use('/pre-sales', preSales);
app.use('/chat-phone', chatPhone);
app.use('/expected-time', expectedTime);

app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
