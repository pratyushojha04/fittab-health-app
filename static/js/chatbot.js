// Chatbot implementation using Gemini API
class FitTabChatbot {
    constructor() {
        this.API_KEY = 'AIzaSyBkQIdA1jCtK_C-l9GWS0yzh73UG61jeGU';
        this.isOpen = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const container = document.getElementById('chatbot-container');
        const minimizeButton = document.getElementById('chatbot-minimize');
        const sendButton = document.getElementById('chatbot-send');
        const inputField = document.getElementById('chatbot-input');

        minimizeButton.addEventListener('click', () => this.toggleChat());
        sendButton.addEventListener('click', () => this.sendMessage());
        
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Open chat by default
        this.isOpen = true;
        container.classList.remove('chatbot-minimized');
    }

    toggleChat() {
        const container = document.getElementById('chatbot-container');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.remove('chatbot-minimized');
        } else {
            container.classList.add('chatbot-minimized');
        }
    }

    async sendMessage() {
        const inputField = document.getElementById('chatbot-input');
        const messagesContainer = document.getElementById('chatbot-messages');
        const message = inputField.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        inputField.value = '';

        try {
            // Show typing indicator
            this.showTypingIndicator();

            // Make API call to Gemini
            const response = await this.callGeminiAPI(message);
            console.log('API Response:', response); // Debug log

            // Remove typing indicator and add response
            this.hideTypingIndicator();
            
            if (response && (response.response || response.html_response)) {
                this.addMessageToChat('bot', response.response || 'No response text', response.html_response);
            } else {
                this.addMessageToChat('bot', 'Sorry, I received an invalid response format.');
                console.error('Invalid response format:', response);
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessageToChat('bot', 'Sorry, I encountered an error. Please try again.');
            console.error('Error:', error);
        }
    }

    addMessageToChat(sender, text, html = null) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        console.log('Adding message:', { sender, text, html }); // Debug log
        
        // If HTML response is provided and it's a bot message, use it
        if (sender === 'bot' && html) {
            contentDiv.innerHTML = html;
        } else {
            // For user messages or when no HTML is provided
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    async callGeminiAPI(message) {
        try {
            const response = await fetch('/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Raw API response:', data); // Debug log
            return data;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new FitTabChatbot();
});
