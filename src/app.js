import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

import { authMiddleware } from './middleware/auth.middleware.js';
import NoteModel from '../models/notes.model.js';
import userModel from '../models/users.models.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

/**

* REGISTER
  */
  app.post('/api/auth/register', async (req, res) => {
  try {
  const { name, email, password } = req.body;

  ```
   if (!name || !email || !password) {
       return res.status(400).json({
           error: 'All fields are required'
       });
   }

   const existingUser = await userModel.findOne({ email });

   if (existingUser) {
       return res.status(400).json({
           error: 'User already exists'
       });
   }

   const user = await userModel.create({
       name,
       email,
       password
   });

   const token = jwt.sign(
       {
           id: user._id,
           email: user.email
       },
       process.env.JWT_SECRET
   );

   res.cookie('token', token, {
       httpOnly: true
   });

   return res.status(201).json({
       message: 'User registered successfully',
       user
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* LOGIN
  */
  app.post('/api/auth/login', async (req, res) => {
  try {
  const { email, password } = req.body;

  ```
   if (!email || !password) {
       return res.status(400).json({
           error: 'Email and password are required'
       });
   }

   const user = await userModel.findOne({ email });

   if (!user) {
       return res.status(404).json({
           error: 'User not found'
       });
   }

   const isMatch = await user.matchPassword(password);

   if (!isMatch) {
       return res.status(401).json({
           error: 'Invalid credentials'
       });
   }

   const token = jwt.sign(
       {
           id: user._id,
           email: user.email
       },
       process.env.JWT_SECRET
   );

   res.cookie('token', token, {
       httpOnly: true
   });

   return res.status(200).json({
       message: 'Login successful',
       user
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* CURRENT USER
  */
  app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
  const user = await userModel.findById(req.user.id);

  ```
   if (!user) {
       return res.status(404).json({
           error: 'User not found'
       });
   }

   return res.status(200).json({
       user
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* CREATE NOTE
  */
  app.post('/api/notes', authMiddleware, async (req, res) => {
  try {
  const { title, description } = req.body;

  ```
   if (!title || !description) {
       return res.status(400).json({
           error: 'Title and description are required'
       });
   }

   const note = await NoteModel.create({
       title,
       description,
       user: req.user.email
   });

   return res.status(201).json({
       message: 'Note created successfully',
       note
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* GET NOTES
  */
  app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
  const notes = await NoteModel.find({
  user: req.user.email
  });

  ```
   return res.status(200).json({
       notes
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* UPDATE NOTE
  */
  app.patch('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
  const { id } = req.params;
  const { description } = req.body;

  ```
   const note = await NoteModel.findOne({
       _id: id,
       user: req.user.email
   });

   if (!note) {
       return res.status(404).json({
           error: 'Note not found'
       });
   }

   note.description = description;

   await note.save();

   return res.status(200).json({
       message: 'Note updated successfully',
       note
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

/**

* DELETE NOTE
  */
  app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
  const { id } = req.params;

  ```
   const note = await NoteModel.findOne({
       _id: id,
       user: req.user.email
   });

   if (!note) {
       return res.status(404).json({
           error: 'Note not found'
       });
   }

   await NoteModel.findByIdAndDelete(id);

   return res.status(200).json({
       message: 'Note deleted successfully'
   });
  ```

  } catch (error) {
  console.log(error);

  ```
   return res.status(500).json({
       error: 'Internal server error'
   });
  ```

  }
  });

export default app;
