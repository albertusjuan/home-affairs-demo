// Hong Kong Home Affairs AI Assistant - Main Application

class HomeAffairsAI {
    constructor() {
        this.apiUrl = null;
        this.apiKey = null;
        this.isFirstMessage = true;
        this.currentEventSource = null;

        this.init();
    }

    init() {
        // Check for saved settings
        this.apiUrl = localStorage.getItem(CONFIG.API_URL_KEY);
        this.apiKey = localStorage.getItem(CONFIG.API_KEY_STORAGE);

        if (this.apiUrl && this.apiKey) {
            this.showChatInterface();
        } else {
            this.showSettingsPanel();
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Settings
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        if (messageInput) {
            messageInput.addEventListener('input', () => {
                this.autoResize(messageInput);
                sendButton.disabled = messageInput.value.trim() === '';
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (messageInput.value.trim()) {
                        this.sendMessage();
                    }
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsButton');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsPanel());
        }

        // Citation drawer
        const closeDrawer = document.getElementById('closeDrawer');
        if (closeDrawer) {
            closeDrawer.addEventListener('click', () => {
                document.getElementById('citationDrawer').classList.remove('open');
            });
        }

        // Suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip')) {
                const query = e.target.getAttribute('data-query');
                if (query && messageInput) {
                    messageInput.value = query;
                    sendButton.disabled = false;
                    this.sendMessage();
                }
            }
        });
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    saveSettings() {
        const apiUrl = document.getElementById('apiUrl').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!apiUrl || !apiKey) {
            alert('Please enter both API URL and API Key');
            return;
        }

        this.apiUrl = apiUrl;
        this.apiKey = apiKey;

        localStorage.setItem(CONFIG.API_URL_KEY, apiUrl);
        localStorage.setItem(CONFIG.API_KEY_STORAGE, apiKey);

        this.showChatInterface();
    }

    showSettingsPanel() {
        document.getElementById('settingsPanel').style.display = 'flex';
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('settingsButton').style.display = 'none';

        // Populate fields
        if (this.apiUrl) document.getElementById('apiUrl').value = this.apiUrl;
        if (this.apiKey) document.getElementById('apiKey').value = this.apiKey;
    }

    showChatInterface() {
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';
        document.getElementById('settingsButton').style.display = 'flex';
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const userMessage = input.value.trim();

        if (!userMessage) return;

        // Disable input
        input.disabled = true;
        document.getElementById('sendButton').disabled = true;

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Remove welcome if present
        const welcome = document.querySelector('.welcome-message');
        if (welcome) welcome.remove();

        // Add user message
        this.addMessage(userMessage, 'user');

        // Prepare query with system prompt if first message
        let finalMessage = userMessage;
        if (this.isFirstMessage) {
            finalMessage = `${CONFIG.SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;
            this.isFirstMessage = false;
        }

        // Show loading
        this.showLoading(true);

        try {
            await this.queryAgent(finalMessage);
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, an error occurred. Please check your API key and try again.', 'assistant');
            this.showLoading(false);
        }

        // Re-enable input
        input.disabled = false;
        input.focus();
    }

    async queryAgent(message) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/developer/agent/query/stream`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    system_prompt: CONFIG.SYSTEM_PROMPT,
                    tool_groups: ['web']
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Handle SSE stream
            this.handleStream(response.body);

        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    async handleStream(stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantElement = null;
        let assistantContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') {
                            this.showLoading(false);
                            continue;
                        }

                        try {
                            const event = JSON.parse(data);
                            
                            if (event.event === 'start') {
                                console.log('Stream started');
                            }
                            else if (event.event === 'thinking') {
                                // Loading indicator already shown
                            }
                            else if (event.event === 'answer_chunk') {
                                this.showLoading(false);
                                const chunk = event.data?.chunk || '';
                                
                                if (!assistantElement) {
                                    assistantElement = this.createMessageElement('', 'assistant');
                                    assistantContent = '';
                                }
                                
                                assistantContent += chunk;
                                this.updateMessage(assistantElement, assistantContent);
                            }
                            else if (event.event === 'sources') {
                                const sources = event.data?.sources || [];
                                this.updateCitations(sources);
                            }
                            else if (event.event === 'done') {
                                this.showLoading(false);
                            }
                            else if (event.event === 'error') {
                                console.error('Stream error:', event.data);
                                this.showLoading(false);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Stream reading error:', error);
            this.showLoading(false);
        }
    }

    addMessage(content, role) {
        const element = this.createMessageElement(content, role);
        return element;
    }

    createMessageElement(content, role) {
        const container = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatContent(content);

        messageDiv.appendChild(contentDiv);
        container.appendChild(messageDiv);
        this.scrollToBottom();

        return contentDiv;
    }

    updateMessage(element, content) {
        element.innerHTML = this.formatContent(content);
        this.scrollToBottom();
    }

    formatContent(text) {
        // Simple markdown-like formatting
        let formatted = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        if (!formatted.startsWith('<p>')) {
            formatted = '<p>' + formatted + '</p>';
        }

        // Convert URLs to links
        formatted = formatted.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }

    showLoading(show) {
        document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
    }

    updateCitations(sources) {
        const list = document.getElementById('citationList');
        const drawer = document.getElementById('citationDrawer');

        list.innerHTML = '';

        if (!sources || sources.length === 0) {
            list.innerHTML = '<div class="no-citations"><p>No citations available.</p></div>';
            return;
        }

        // Filter for allowed domains
        const filtered = sources.filter(s => {
            const url = s.url || s.source_url || '';
            return CONFIG.ALLOWED_DOMAINS.some(domain => url.startsWith(domain));
        });

        if (filtered.length === 0) {
            list.innerHTML = '<div class="no-citations"><p>No official sources found.</p></div>';
            return;
        }

        filtered.forEach((source, index) => {
            const item = document.createElement('div');
            item.className = 'citation-item';

            const url = source.url || source.source_url || '#';
            const title = source.title || source.document_title || 'Official Document';

            item.innerHTML = `
                <div class="citation-number">${index + 1}</div>
                <div class="citation-content">
                    <div class="citation-title">${this.escapeHtml(title)}</div>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="citation-url">${url}</a>
                </div>
            `;

            list.appendChild(item);
        });

        drawer.classList.add('open');
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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HomeAffairsAI();
});
