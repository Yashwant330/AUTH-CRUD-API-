import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import NoteModel from '../models/notes.model.js';
import userModel from '../models/users.models.js';

const app = express();

app.use(express.json());
app.use(cookieParser());



/**
 * @ROUTE POST /api/auth/register
 * @DESCRIPTION Register user
 * @ACCESS Public
 */

app.post('/api/auth/register', async (req, res) => {

    try {

        const { name, email } = req.body;

        // validations

        if (!name) {
            return res.status(400).json({
                error: "Name is required"
            });
        }

        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }

        if (name.trim().length < 3) {
            return res.status(400).json({
                error: "Name must be at least 3 characters long"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format"
            });
        }

        // check existing user

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            });
        }

        // create user

        const newUser = await userModel.create({
            name,
            email
        });

        // create token

        const token = JSON.stringify({
            id: newUser._id,
            email: newUser.email
        },process.env.JWT_SECRET);

        // store token in cookies

        res.cookie("token", token, {
            httpOnly: true
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});


/**
 * @ROUTE GET /api/auth/me
 * @DESCRIPTION Get logged in user
 * @ACCESS Private
 */

app.get('/api/auth/me', async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const decoded = JSON.parse(token);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.status(200).json({
            message: "Current User",
            user
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});





/**
 * @ROUTE POST /api/notes
 * @DESCRIPTION Create note
 * @ACCESS Private
 */

app.post('/api/notes', async (req, res) => {

    try {

        const { title, description } = req.body;

        // get token from cookies

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        // convert token string to object

         
         const user=jwt.verify(token,process.env.JWT_SECRET);


        req.user = user;

        console.log("Logged In User:", req.user);

        // validations

        if (!title) {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        if (!description) {
            return res.status(400).json({
                error: "Description is required"
            });
        }

        if (title.trim().length < 3) {
            return res.status(400).json({
                error: "Title must be at least 3 characters long"
            });
        }

        if (description.trim().length < 4) {
            return res.status(400).json({
                error: "Description must be at least 4 characters long"
            });
        }

        // create note

        const newNote = await NoteModel.create({
            title,
            description,
            user: req.user.email
        });

        return res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});


/**
 * @ROUTE GET /api/notes
 * @DESCRIPTION Get all notes
 * @ACCESS Private
 */

app.get('/api/notes', async (req, res) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const user = JSON.parse(token);

        const notes = await NoteModel.find({
            user: user.email
        });

        return res.status(200).json({
            message: "Notes fetched successfully",
            notes
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});


/**
 * @ROUTE PATCH /api/notes/:id
 * @DESCRIPTION Update note
 * @ACCESS Private
 */

app.patch('/api/notes/:id', async (req, res) => {

    try {

        const { id } = req.params;
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({
                error: "Description is required"
            });
        }

        if (description.trim().length < 4) {
            return res.status(400).json({
                error: "Description must be at least 4 characters long"
            });
        }

        const note = await NoteModel.findById(id);

        if (!note) {
            return res.status(404).json({
                error: "Note not found"
            });
        }

        note.description = description;

        await note.save();

        return res.status(200).json({
            message: "Note updated successfully",
            note
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});


/**
 * @ROUTE DELETE /api/notes/:id
 * @DESCRIPTION Delete note
 * @ACCESS Private
 */

app.delete('/api/notes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const note = await NoteModel.findById(id);

        if (!note) {
            return res.status(404).json({
                error: "Note not found"
            });
        }

        await NoteModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }

});

export default app;