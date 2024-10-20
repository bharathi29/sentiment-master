import speech_recognition as sr
import ffmpeg
import imageio_ffmpeg as iio_ffmpeg
import os
import sys
import re
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize sentiment analyzer and speech recognizer
analyzer = SentimentIntensityAnalyzer()
recognizer = sr.Recognizer()

# Get the FFmpeg executable path from imageio-ffmpeg
ffmpeg_path = iio_ffmpeg.get_ffmpeg_exe()

# Function to convert MP3 to WAV using ffmpeg-python with imageio-ffmpeg's FFmpeg binary
def convert_mp3_to_wav(mp3_file):
    try:
        wav_file = mp3_file.replace(".mp3", ".wav")
        (
            ffmpeg
            .input(mp3_file)
            .output(wav_file)
            .run(cmd=ffmpeg_path, quiet=True, overwrite_output=True)  # Specify path to FFmpeg binary
        )
        return wav_file
    except Exception as e:
        print(f"Error converting MP3 to WAV: {e}")
        return None

# Function to convert audio to text using speech recognition
def convert_audio_to_text(audio_file):
    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return "Speech recognition could not understand the audio."
    except sr.RequestError as e:
        return f"Error with the API: {e}"

# Clean text before sentiment analysis
def clean_text(text):
    text = re.sub(r'[^a-zA-Z\s]', '', text, re.I | re.A)
    text = text.lower()
    text = text.strip()
    return text

# Calculate sentiment score using VADER
def calculate_sentiment_score(review):
    sentiment = analyzer.polarity_scores(review)
    return sentiment['compound']

# Convert score to sentiment label
def score_to_label(score):
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"

# Main logic for processing audio file
if __name__ == '__main__':
    audio_file = sys.argv[1]
    wav_file = convert_mp3_to_wav(audio_file)
    
    if wav_file:
        text = convert_audio_to_text(wav_file)
        cleaned_review = clean_text(text)
        score = calculate_sentiment_score(cleaned_review)
        label = score_to_label(score)

        result = {
            'text': text,
            'score': score,
            'label': label
        }

        print(json.dumps(result))
        os.remove(wav_file)  # Clean up
    else:
        print(json.dumps({'error': 'Failed to process audio file'}))
