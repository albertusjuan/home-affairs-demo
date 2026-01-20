// Hong Kong Home Affairs AI Assistant - Simplified (API Key Based)

class HomeAffairsAI {
    constructor() {
        this.apiKey = null;
        this.apiBaseUrl = null;
        this.isFirstMessage = true;

        this.init();
    }

    init() {
        // Load configuration from config.local.js
        if (typeof LOCAL_CONFIG !== 'undefined') {
            this.apiKey = LOCAL_CONFIG.API_KEY;
            this.apiBaseUrl = LOCAL_CONFIG.API_BASE_URL || 'https://hub.wyniai.com';
        } else {
            console.error('❌ config.local.js not found! Please create it from config.local.example.js');
            this.showConfigError();
            return;
        }

        // Validate API key
        if (!this.apiKey || this.apiKey === 'dak-your-api-key-here') {
            console.error('❌ API Key not configured! Please update config.local.js');
            this.showConfigError();
            return;
        }

        console.log('✅ Configuration loaded successfully');
        this.attachEventListeners();
    }

    showConfigError() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="config-error" style="text-align: center; padding: 3rem 2rem;">
                <div style="font-size: 48px; margin-bottom: 1rem;">⚙️</div>
                <h3 style="color: #E60012; margin-bottom: 1rem;">Configuration Required</h3>
                <p style="color: #666; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Please create <code style="background: #f5f5f5; padding: 2px 8px; border-radius: 4px;">config.local.js</code> from the template file.
                </p>
                <div style="text-align: left; background: #f5f5f5; padding: 1.5rem; border-radius: 8px; max-width: 600px; margin: 0 auto; font-family: monospace; font-size: 14px;">
                    <strong>Steps:</strong><br><br>
                    1. Copy <code>config.local.example.js</code> to <code>config.local.js</code><br>
                    2. Get your API key from WYNI Developer API<br>
                    3. Update the API_KEY in config.local.js<br>
                    4. Refresh this page
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.autoResizeTextarea(messageInput);
                sendButton.disabled = messageInput.value.trim() === '';
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (messageInput.value.trim() !== '') {
                        this.handleSendMessage();
                    }
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => this.handleSendMessage());
        }

        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const query = e.target.getAttribute('data-query');
                if (query) {
                    messageInput.value = query;
                    sendButton.disabled = false;
                    this.handleSendMessage();
                }
            }
        });

        // Citation drawer close
        const closeDrawerBtn = document.getElementById('closeDrawer');
        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener('click', () => {
                document.getElementById('citationDrawer').classList.remove('open');
            });
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    async handleSendMessage() {
        const messageInput = document.getElementById('messageInput');
        const userMessage = messageInput.value.trim();

        if (!userMessage) return;

        // Disable input
        messageInput.disabled = true;
        document.getElementById('sendButton').disabled = true;

        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Remove welcome message if present
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Display user message
        this.addMessage(userMessage, 'user');

        // Prepare query with system prompt on first message
        let finalQuery = userMessage;
        if (this.isFirstMessage) {
            const systemPrompt = (typeof LOCAL_CONFIG !== 'undefined' && LOCAL_CONFIG.CUSTOM_SYSTEM_PROMPT) 
                ? LOCAL_CONFIG.CUSTOM_SYSTEM_PROMPT 
                : CONFIG.SYSTEM_PROMPT;
            finalQuery = `${systemPrompt}\n\nUser Question: ${userMessage}`;
            this.isFirstMessage = false;
        }

        // Show loading indicator
        this.showLoading(true);

        try {
            await this.sendQuery(finalQuery);
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, an error occurred. Please check your API key configuration.', 'assistant');
            this.showLoading(false);
        }

        // Re-enable input
        messageInput.disabled = false;
        messageInput.focus();
    }

    async sendQuery(query) {
        try {
            // Use Developer API endpoint
            const response = await fetch(`${this.apiBaseUrl}/api/v1/developer/agent/query/stream`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: query,
                    tool_groups: ['web'],
                    top_k: 5
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Handle streaming response
            await this.handleStreamingResponse(response);
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    async handleStreamingResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let assistantMessageElement = null;
        let assistantMessageContent = '';
        let buffer = '';

        this.showLoading(false);

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;
                    
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const event = JSON.parse(data);
                        
                        // Handle different event types
                        if (event.type === 'answer_chunk' || event.chunk) {
                            const chunk = event.chunk || event.content || '';
                            
                            if (!assistantMessageElement) {
                                assistantMessageElement = this.createMessageElement('', 'assistant');
                                assistantMessageContent = '';
                            }
                            
                            assistantMessageContent += chunk;
                            this.updateMessageContent(assistantMessageElement, assistantMessageContent);
                        }
                        
                        if (event.type === 'sources' || event.sources) {
                            const sources = event.sources || [];
                            this.updateCitations(sources);
                        }
                        
                        if (event.type === 'done' || event.type === 'answer_done') {
                            console.log('Stream complete');
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                        console.debug('Skipping line:', line);
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            if (!assistantMessageElement) {
                this.addMessage('Error processing response. Please try again.', 'assistant');
            }
        }
    }

    addMessage(content, role) {
        const messageElement = this.createMessageElement(content, role);
        return messageElement;
    }

    createMessageElement(content, role) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        this.scrollToBottom();

        return contentDiv;
    }

    updateMessageContent(element, content) {
        element.innerHTML = this.formatMessage(content);
        this.scrollToBottom();
    }

    formatMessage(content) {
        let formatted = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        if (!formatted.startsWith('<p>')) {
            formatted = '<p>' + formatted + '</p>';
        }

        formatted = formatted.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    updateCitations(sources) {
        const citationList = document.getElementById('citationList');
        const citationDrawer = document.getElementById('citationDrawer');

        citationList.innerHTML = '';

        if (!sources || sources.length === 0) {
            citationList.innerHTML = '<div class="no-citations"><p>No citations available for this response.</p></div>';
            return;
        }

        const allowedSources = sources.filter(source => {
            const url = source.url || source.source_url || '';
            return CONFIG.ALLOWED_DOMAINS.some(domain => url.startsWith(domain));
        });

        if (allowedSources.length === 0) {
            citationList.innerHTML = '<div class="no-citations"><p>No official government sources found.</p></div>';
            return;
        }

        allowedSources.forEach((source, index) => {
            const citationItem = document.createElement('div');
            citationItem.className = 'citation-item';

            const url = source.url || source.source_url || '#';
            const title = source.title || source.document_title || 'Official Document';

            citationItem.innerHTML = `
                <div class="citation-number">${index + 1}</div>
                <div class="citation-content">
                    <div class="citation-title">${this.escapeHtml(title)}</div>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="citation-url">${url}</a>
                </div>
            `;

            citationList.appendChild(citationItem);
        });

        citationDrawer.classList.add('open');
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HomeAffairsAI();
});

