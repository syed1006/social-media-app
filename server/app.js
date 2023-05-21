const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

//allowing cross origin resource sharing
app.use(cors());

//middlewares
//to parse json data 
app.use(express.json());
//to parse url encoded data;
app.use(express.urlencoded({extended: true}));
app.use(helmet());
app.use(morgan('common'));

//routes

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);












module.exports = app;