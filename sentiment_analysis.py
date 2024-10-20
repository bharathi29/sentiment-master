import pandas as pd
import re
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import sys

# Initialize the sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

def clean_text(text):
    text = re.sub(r'[^a-zA-Z\s]', '', text, re.I|re.A)
    text = text.lower()
    text = text.strip()
    return text

def analyze_sentiment(review):
    cleaned_review = clean_text(review)
    sentiment = analyzer.polarity_scores(cleaned_review)
    
    # Determine the sentiment label
    if sentiment['compound'] >= 0.05:
        label = "Positive"
    elif sentiment['compound'] <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
    
    return {
        'score': sentiment['compound'],
        'label': label
    }

if __name__ == '__main__':
    # Read the review from command line argument
    review = sys.argv[1]
    result = analyze_sentiment(review)
    print(json.dumps(result))
