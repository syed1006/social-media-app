const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PWD
    }
})

module.exports = transporter