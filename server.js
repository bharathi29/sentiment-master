const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Setup file storage for MP3 uploads using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// MongoDB Atlas connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch((err) => console.error('MongoDB Atlas connection error:', err));

// Define the sentiment schema and model
const sentimentSchema = new mongoose.Schema({
  review: String,
  score: Number,
  label: String,
});

const Sentiment = mongoose.model('Sentiment', sentimentSchema);

// Endpoint to accept text or MP3 file for sentiment analysis
app.post('/api/sentiment', upload.single('audio'), (req, res) => {
  const { review } = req.body;  // For text input

  if (req.file) {
    // If an audio file is uploaded, execute audio transcription and sentiment analysis
    const audioPath = req.file.path;
    exec(`python3 audioToText.py "${audioPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        return res.status(500).send('Error transcribing audio');
      }

      try {
        // Parse the JSON output from the Python script
        const transcriptResult = JSON.parse(stdout);
        const { text, score, label } = transcriptResult;

        // Save the transcribed text and sentiment data in MongoDB
        const newSentiment = new Sentiment({
          review: text,  // Use the transcribed text as the review
          score,
          label,
        });

        newSentiment.save()
          .then(() => res.status(200).json({ review: text, score, label }))
          .catch((err) => {
            console.error('Error saving sentiment data:', err);
            res.status(500).send('Error saving sentiment data');
          });
      } catch (err) {
        console.error('Error parsing Python output:', err);
        res.status(500).send('Error parsing transcription result');
      }
    });
  } else if (review) {
    // If a text review is provided, analyze it directly
    exec(`python3 sentiment_analysis.py "${review}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing Python script:', error);
        return res.status(500).send('Error executing sentiment analysis');
      }

      try {
        // Parse the JSON output from the Python script
        const sentimentResult = JSON.parse(stdout);

        // Save the text review and sentiment data in MongoDB
        const newSentiment = new Sentiment({
          review,  // Store the original review text
          score: sentimentResult.score,
          label: sentimentResult.label,
        });

        newSentiment.save()
          .then(() => res.status(200).json(sentimentResult))
          .catch((err) => {
            console.error('Error saving sentiment data:', err);
            res.status(500).send('Error saving sentiment data');
          });
      } catch (err) {
        console.error('Error parsing sentiment analysis result:', err);
        res.status(500).send('Error parsing sentiment analysis result');
      }
    });
  } else {
    res.status(400).send('No text or audio provided');
  }
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
