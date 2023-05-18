const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan')

const app = express();

//middlewares
//to parse json data 
app.use(express.json());
//to parse url encoded data;
app.use(express.urlencoded({extended: true}));
app.use(helmet());
app.use(morgan('common'));

//routes

const userRoutes = require('./routes/user');

app.use('/api/v1/users', userRoutes);












module.exports = app;