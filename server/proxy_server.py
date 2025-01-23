from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Webhook URL
WEBHOOK_URL = 'https://mirawang.app.n8n.cloud/webhook/9c10a798-1df0-442b-ab5a-0d90e4166814'

@app.route('/proxy-webhook', methods=['POST'])
def proxy_webhook():
    try:
        # Forward the request to n8n webhook
        response = requests.post(
            WEBHOOK_URL,
            json=request.json,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        )
        
        # Return the response from n8n
        return response.text, response.status_code, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    print("Starting proxy server on http://localhost:5000")
    app.run(port=5000)
