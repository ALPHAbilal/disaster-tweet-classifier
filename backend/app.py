from flask import Flask, request, jsonify, send_from_directory
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

app = Flask(__name__, static_folder='../static')

# Load model and tokenizer
model_name = "BilallaliB/distilbert-disaster-tweet-classification"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    text = data['text']
    
    # Tokenize and predict
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    outputs = model(**inputs)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    prediction = torch.argmax(probabilities, dim=-1).item()
    
    # Assuming 1 is disaster, 0 is not disaster
    result = "Disaster" if prediction == 1 else "Not Disaster"
    confidence = probabilities[0][prediction].item()
    
    return jsonify({'prediction': result, 'confidence': confidence})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
