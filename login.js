const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Register = require('./schema1.js');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

async function connectToDb() {
    try {
        await mongoose.connect('mongodb+srv://amruta:vieFC9VXxVSgoPzM@cluster0.rgbuaxs.mongodb.net/EventManagement?retryWrites=true&w=majority&appName=Cluster0');
        console.log('DB Connection established');
        const port = process.env.PORT || 8003;
        app.listen(port, function () {
            console.log(`Listening on port ${port}`);
        });
    } catch (error) {
        console.log("Couldn't establish connection");
        console.log(error);
    }
}

connectToDb();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'amrutaks018@gmail.com',
        pass: 'amruta@14'
    }
});

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

app.post('/register', async function(request, response) {
    try {
        const verificationToken = generateVerificationToken();
        const newUser = await Register.create({
            email: request.body.email,
            username: request.body.username,
            password: request.body.password,
            verificationToken: verificationToken
        });

        const verificationLink = `http://localhost:8003/verify-email?token=${verificationToken}&email=${request.body.email}`;

        const mailOptions = {
            from: 'amrutaks018@gmail.com',
            to: request.body.email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationLink}`,
            html: `<p>Please verify your email by clicking the following link: <a href="${verificationLink}">Verify Email</a></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return response.status(500).json({ message: 'Error sending email' });
            }
            response.status(201).json({
                status: 'success',
                message: 'User created successfully. Please verify your email.',
                user: newUser
            });
        });
    } catch (error) {
        console.error('Error creating user:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to create user',
            error: error.message
        });
    }
});

app.get('/verify-email', async function(request, response) {
    try {
        const { token, email } = request.query;

        const user = await Register.findOne({ email: email });

        if (!user) {
            return response.status(400).json({ message: 'Invalid email or token' });
        }

        if (user.verificationToken !== token) {
            return response.status(400).json({ message: 'Invalid token' });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        response.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Error verifying email:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to verify email',
            error: error.message
        });
    }
});

app.post('/login', async function(request, response) {
    try {
        const { username, password } = request.body;
        const user = await Register.findOne({ username: username, password: password });

        if (user && user.verified) {
            response.status(200).json({
                status: 'success',
                message: 'Valid user'
            });
        } else if (user && !user.verified) {
            response.status(401).json({
                status: 'failure',
                message: 'Please verify your email first'
            });
        } else {
            response.status(401).json({
                status: 'failure',
                message: 'Invalid user'
            });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        response.status(500).json({
            status: 'failure',
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});
