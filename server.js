const express = require('express');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = 5000;

// Use CORS middleware
app.use(cors());

// Sequelize configurationkdn
const sequelize = new Sequelize('b0pvymupamiymawgjzah', 'uufj3sf2gariapaz', 'UoWF5t3A1OZi1q5wjVVH', {
    // host: 'localhost',
    host: 'b0pvymupamiymawgjzah-mysql.services.clever-cloud.com',
    dialect: 'mysql'
});

// Define Audio model
const Audio = sequelize.define('Audio', {
    filename: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.BLOB('long')
    }
});

// Synchronize the model with the database
sequelize.sync();

// Multer configuration for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route for handling audio uploads
app.post('/api/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Save audio file to the database
        const savedAudio = await Audio.create({
            filename: req.file.originalname,
            data: req.file.buffer
        });

        res.json({ message: 'Audio uploaded successfully' });
    } catch (error) {
        console.error('Error saving audio to database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route for fetching all audio files from the database
app.get('/api/audio', async (req, res) => {
    try {
        // Fetch all audio files from the database
        const allAudio = await Audio.findAll();
        res.json(allAudio);
    } catch (error) {
        console.error('Error fetching audio from database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/audio/:id', async (req, res) => {
    try {
        const audio = await Audio.findByPk(req.params.id);
        if (!audio) {
            return res.status(404).json({ message: 'Audio not found' });
        }

        // Set the appropriate content type header for audio
        res.setHeader('Content-Type', 'audio/mpeg');

        // Send the audio data back to the client
        res.send(audio.data);
    } catch (error) {
        console.error('Error fetching audio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
