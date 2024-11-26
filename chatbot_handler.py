from flask import Blueprint, jsonify, request
import os
import requests
import markdown
import bleach

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chatbot')

GEMINI_API_KEY = 'AIzaSyBkQIdA1jCtK_C-l9GWS0yzh73UG61jeGU'
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

# Configure allowed HTML tags and attributes for safe rendering
ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre']
ALLOWED_ATTRIBUTES = {'*': ['class']}

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Call Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                'contents': [{
                    'parts': [{
                        'text': f"""You are a fitness assistant. Respond to the following message in a helpful and encouraging way.
                        Format your response with markdown for better readability.
                        Use bullet points for lists, bold for important terms, and code blocks for exercises or routines.
                        Message: {message}"""
                    }]
                }]
            }
        )
        
        if response.status_code != 200:
            print(f"Gemini API error: {response.status_code}")
            print(f"Response content: {response.text}")
            return jsonify({'error': 'Failed to get response from AI'}), 500

        data = response.json()
        ai_response = data['candidates'][0]['content']['parts'][0]['text']
        
        # Convert markdown to HTML and sanitize
        html_response = markdown.markdown(ai_response)
        sanitized_html = bleach.clean(
            html_response,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            strip=True
        )
        
        print(f"Original response: {ai_response}")  # Debug log
        print(f"HTML response: {sanitized_html}")   # Debug log
        
        return jsonify({
            'response': ai_response,
            'html_response': sanitized_html
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500
