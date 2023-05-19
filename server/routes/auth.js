const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../helpers/transporter')

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

//Route-1: Check if username is available in database
router.post('/username', async(req, res)=>{
    try {
        const {username} = req.body
        const user = await User.findOne({username})
        if(user){
            return res.status(400).json({
                status: 'failure',
                message: 'username is not available',
                isAvailabel: false
            })
        }
        return res.status(200).json({
            status: 'success',
            message: 'username is available',
            isAvailabel: true
        })
    } catch (error) {
        return res.status(500).json({
            status: 'failure',
            message: error.message
        })
    }
})

//Route-2: Register a new user
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({min: 8, max: 16}),
], async(req, res)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'failure',
            message: errors.array()
        })
    }

    try {
        const {name, email, username, password} = req.body;
        //checking if email already exist in database
        let user = await User.findOne({email})
        if(user?.isActive){
            return res.status(400).json({
                status: 'failure',
                message: 'This email already exist.'
            })
        }
        else if(user?.isActive === false){
            const hash = await bcrypt.hash(password, 10);
            await User.updateOne({email}, {
                $set:{name, password, username}
            });
        }
        else{
            //generating the hash of the password
            const hash = await bcrypt.hash(password, 10);
            //creating new user
            user = await User.create({
                name, email, username, 'password': hash
            });
        }
        return res.status(201).json({
            status: 'success',
            message: 'User registered successfully'
        })
        
    } catch (error) {
        return res.status(500).json({
            status: 'failure',
            message: error.message
        })
    }
})

//Route-4 Send a email on successfull registration;
router.post('/email',body('email').isEmail(), async (req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'failure',
            message: errors.array()
        })
    }
    try {
        const {email} = req.body;

        const user = await User.findOne({email},{name: 1});
        if(!user){
            return res.status(400).json({
                status: 'failure',
                message: 'user does not exist'
            })
        }

        //creating a jwt token asynchronously and sending the verification email
        jwt.sign(
            {
                user: user._id
            },
            JWT_SECRET,
            {
                expiresIn: '1d'
            },
            (err, emailToken)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        status: 'failure',
                        message: err.message
                    })
                }
                const url = `${process.env.BACKEND}${process.env.PORT?process.env.PORT:5000}/api/v1/auth/verify/${emailToken}`
                transporter.sendMail({
                    to: email,
                    subject: ' Account Verification - Please Confirm Your Email Address',
                    html:`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Document</title>
                        </head>
                        <body style="font-family:'Times New Roman', Times, serif;">
                            <table style="padding: 20px;">
                                <tr>
                                    <td style="text-align: center;color: #E02122;background-color: #FFD8E1;padding-bottom: 20px;">
                                        <h1 style="margin-bottom: 0;font-weight: bold;"><span style="font-size: 50px;">V</span>ibe<span style="font-size: 50px;">V</span>erse</h1>
                                        <small style="font-size: 20px;">Vibe with your tribe.</small>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <h2>Dear ${user.name},</h2>
                                        <p>
                                            Thank you for joining <strong>VibeVerse</strong>! We're excited to have you on board. Before we can get started, we kindly request you to verify your email address to ensure the security and authenticity of your account.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p>To complete the verification process, please click on the following link:</p>
                                        <a href="${url}" style="background-color:#2F58CD;text-decoration: none;padding: 5px;font-size: 16px;color: white;border-radius: 2px;">Click here</a>
                                        <p>Please note that this link is unique to your account and will expire in <strong>1 day</strong>. If you are unable to click the link directly, please copy and paste it into your web browser's address bar.</p>
                                        <p>${url}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p>By verifying your email address, you'll gain access to all the features and functionalities of VibeVerse, including personalized recommendations, social connections, and the ability to fully engage with our community. Your verified email address will also serve as a means of communication for important updates, notifications, and account recovery.</p>
                                        <p>
                                            If you did not sign up for VibeVerse or believe this email was sent to you in error, please disregard it. Your account will remain inactive.
                                        </p>
                                        <p>
                                            Should you encounter any issues or require further assistance, our support team is always here to help. Feel free to reach out to us at service.laundrylobsters@gmail.com with any questions or concerns you may have.
                                        </p>
                                        <p>
                                            Thank you for your cooperation in this matter. We look forward to your active participation within our community. Welcome to VibeVerse!
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p>Best regards,</p>
                                        <p>
                                            Syed Salman <br/>
                                            Full stack developer(MERN) <br/>
                                            VibeVerse <br/>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    `
                })
            }
        )

        res.status(200).json({
            status: 'success',
            message: 'Verification email sent successfully',
        })
    } catch (error) {
        return res.status(500).json({
            status: 'failure',
            message: error.message
        })
    }
    
})

//Route-3: Logging in a existing user
router.post('/login', [
    body('password').isLength({min: 8, max: 16})
], async(req, res)=>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'failure',
            message: errors.array()
        })
    }

    try {
        const {username, password} = req.body
        const user = await User.findOne({username},{password: 1});
        if(!user){
            return res.status(400).json({
                status: 'failure',
                message: 'user does not exist, please register'
            })
        }

        //checking if password and hash matches
        const result = bcrypt.compare(password, user.password)
        if(!result){
            return res.status(401).json({
                status: 'failure',
                message: 'username and password does not match!'
            })
        }
        //generating a token
        const token = jwt.sign({
            data: user._id
        }, JWT_SECRET, {
            expiresIn: '1d'
        })
        return res.status(200).json({
            status: 'success',
            message: 'successfully logged in.',
            token,
            user
        })
    } catch (error) {
        return res.status(500).json({
            status: 'failure',
            message: error.message
        })
    }
})

module.exports = router;
