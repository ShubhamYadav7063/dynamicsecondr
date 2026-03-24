require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// IMPORTANT: This line is required to read JSON data sent from a frontend
app.use(express.json()); 

// Serve your frontend files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGODB_URI;

// 1. Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully."))
    .catch((err) => console.error("MongoDB connection error:", err));

// 2. Define what a "Note" looks like in your database
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);

// --- 3. API ROUTES ---

// GET: Fetch all notes from the database
app.get('/api/notes', async (req, res) => {
    try {
        // .sort({ createdAt: -1 }) brings the newest notes to the top
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// POST: Create a new note
app.post('/api/notes', async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const newNote = new Note({
            title: req.body.title,
            content: req.body.content
        });
        
        await newNote.save(); // Saves to MongoDB
        res.status(201).json(newNote); // Sends the saved note back to the frontend
    } catch (error) {
        res.status(500).json({ error: 'Failed to save note' });
    }
});

// DELETE: Remove a note by its ID
app.delete('/api/notes/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// 4. Start Server
app.listen(PORT, () => {
    console.log(`Server bound to port ${PORT}`);
});
