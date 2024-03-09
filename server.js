// server.js

const express = require('express');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const sequelize = new Sequelize('b0pvymupamiymawgjzah', 'uufj3sf2gariapaz', 'UoWF5t3A1OZi1q5wjVVH', {
    // host: 'localhost',
    host: 'b0pvymupamiymawgjzah-mysql.services.clever-cloud.com',
    dialect: 'mysql'
});

const Audio = sequelize.define('Audio', {
    filename: {
        type: DataTypes.STRING
    },
    data: {
        type: DataTypes.BLOB('long')
    }
});

sequelize.sync();

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        await Audio.create({
            filename: req.file.originalname,
            data: req.file.buffer
        });

        res.json({ message: 'Audio uploaded successfully' });
    } catch (error) {
        console.error('Error saving audio to database:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/audio', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Audio.findAndCountAll({
            offset,
            limit
        });

        res.json({
            totalCount: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            audioFiles: rows
        });
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
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(audio.data);
    } catch (error) {
        console.error('Error fetching audio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
