import express from 'express';
import NoteModel from '../models/notes.model.js';
import mongoose from 'mongoose';
import userModel from './config/users.models.js';
import cookies from 'cookie-parser';


let app = express()
app.use(express.json())
app.use(cookies())

/**
 * @Routes POST/api/auth/register
 * @description Register a new user need name n email in request body
 * @access Public
 */

app.post("/api/auth/register",async(req,res)=>{
    const {name,email}=req.body;

    if(!name)
    {
        return res.status(400).json({
            Error:"Name is required"
        })
    }

        if(!email)
    {
        return res.status(400).json({
            Error:"Email is required"
        })
    }

     if(name.trim().length<3)
    {
        return res.status(400).json({
            error:"name must be atleast 4 characters long"
        })
    }

   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
   if(!emailRegex.test(email))
   {
    return res.status(400).json({
        error:"Invalid email form"
    })
   }

   //--if all validation success create user

   const newUser= await userModel.create({name,email})

  const token = JSON.stringify({id:newUser._id,email:newUser.email})

   res.cookie("token",token)

   return res.status(200).json({
    message:"User registered successfully",
    user:newUser
   })

}) 



/**
 * @route POST/api/notes
 * @description Create a new note need title and description in request body
 * @access Public
 */

app.post("/api/notes", async (req,res)=>{
    const{title,description} = req.body;


    if(!title)
    {
        return res.status(400).json({error:"Title is required"})

    }

    if(!description)
    {
        return res.status(400).json({
         error:"Description is required"
        })
    }

    if(title.trim().length<3)
    {
        return res.status(400).json({
            error:"Title must be atleast 4 characters long"
        })
    }

      if(description.trim().length<4)
    {
        return res.status(400).json({
            error:"description must be atleast 4 characters long"
        })
    }

// ----- If validation passes,createthe note----

const newNote = await NoteModel.create({title,description})


return res.status(201).json({
    Message:"Note created successfully", 
    newNote});

})


/**
 * @Routes POST/api/notes
 * @description to read or fetch from api
 * @access Public
 */

app.get('/api/notes', async (req,res)=>{

    const notes = await NoteModel.find();
    
    return res.status(200).json({
        Message:"Notes",
        notes});
})

/**
 * @Route PATCH/api/notes/:id
 * @description Update a note by id
 * @access Public
 */

app.patch('/api/notes/:id', async (req, res) => {
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
});

/**

* @Route DELETE /api/notes/:id
* @description Delete a note by id
* @access Public
  */

app.delete('/api/notes/:id', async (req, res) => {
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


});



export default app;