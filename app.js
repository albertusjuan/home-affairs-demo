/**
 * Hong Kong Home Affairs AI Assistant
 * Regular API with Login Authentication (Per Task Specification)
 */

class HomeAffairsAI {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
        this.email = CONFIG.API_EMAIL;
        this.password = CONFIG.API_PASSWORD;
        this.token = null;
        this.conversationId = null;
        this.isFirstMessage = true;
        this.currentEventSource = null;

        this.init();
    }

    async init() {
        console.log('🚀 Initializing Home Affairs AI Assistant...');
        console.log('📍 API URL:', this.apiUrl);
        console.log('👤 Email:', this.email);
        
        // Check for existing token
        this.token = localStorage.getItem(CONFIG.STORAGE.TOKEN);
        this.conversationId = sessionStorage.getItem(CONFIG.STORAGE.SESSION_ID);

        if (!this.token) {
            console.log('🔐 No token found, logging in...');
            await this.login();
        } else {
            console.log('✅ Token found in storage');
        }

        if (!this.conversationId) {
            console.log('📝 Creating new session...');
            await this.createSession();
        } else {
            console.log('✅ Session ID found:', this.conversationId);
        }

        this.attachEventListeners();
        this.updateUIWithConfig();
    }

    updateUIWithConfig() {
        document.getElementById('secureBadgeText').textContent = CONFIG.SECURE_BADGE_TEXT;
        document.getElementById('loadingText').textContent = CONFIG.LOADING_MESSAGE;
    }

    async login() {
        try {
            const response = await fetch(`${this.apiUrl}${CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Login failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            this.token = data.token || data.access_token;

            if (!this.token) {
                throw new Error('No token received from login');
            }

            localStorage.setItem(CONFIG.STORAGE.TOKEN, this.token);
            console.log('✅ Login successful!');

        } catch (error) {
            console.error('❌ Login error:', error);
            alert(`Login failed: ${error.message}\n\nPlease check your credentials in config.js`);
            throw error;
        }
    }

    async createSession() {
        try {
            const response = await fetch(`${this.apiUrl}${CONFIG.ENDPOINTS.CREATE_SESSION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify({
                    title: 'Home Affairs Inquiry',
                    mode: CONFIG.API_MODE
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Session creation failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            this.conversationId = data.id;

            if (!this.conversationId) {
                throw new Error('No session ID received');
            }

            sessionStorage.setItem(CONFIG.STORAGE.SESSION_ID, this.conversationId);
            console.log('✅ Session created:', this.conversationId);

        } catch (error) {
            console.error('❌ Session creation error:', error);
            // Try to login again if token might be invalid
            if (error.message.includes('401')) {
                console.log('Token might be expired, logging in again...');
                await this.login();
                await this.createSession();
            } else {
                throw error;
            }
        }
    }

    attachEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

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

        sendButton.addEventListener('click', () => this.handleSendMessage());

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

        document.getElementById('closeDrawer').addEventListener('click', () => {
            document.getElementById('citationDrawer').classList.remove('open');
        });
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    async handleSendMessage() {
        const messageInput = document.getElementById('messageInput');
        const userMessage = messageInput.value.trim();

        if (!userMessage) return;

        messageInput.disabled = true;
        document.getElementById('sendButton').disabled = true;

        messageInput.value = '';
        messageInput.style.height = 'auto';

        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.addMessage(userMessage, 'user');
        this.showLoading(true);

        try {
            await this.sendQuery(userMessage);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.addMessage(`Sorry, an error occurred: ${error.message}`, 'assistant');
            this.showLoading(false);
        }

        messageInput.disabled = false;
        messageInput.focus();
    }

    async sendQuery(userMessage) {
        // Prepend system prompt on first message
        let finalQuery = userMessage;
        if (this.isFirstMessage) {
            finalQuery = `${CONFIG.SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;
            this.isFirstMessage = false;
        }

        const requestBody = {
            query: finalQuery,
            conversation_id: this.conversationId,
            mode: CONFIG.API_MODE,
            enabled_tools: CONFIG.ENABLED_TOOLS
        };

        if (CONFIG.DEBUG_MODE) {
            console.log('📤 Sending query:', requestBody);
        }

        try {
            const response = await fetch(`${this.apiUrl}${CONFIG.ENDPOINTS.QUERY_STREAM}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Query failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const streamUrl = data.stream_url || `${CONFIG.ENDPOINTS.QUERY_STREAM.replace('/stream', '')}/${data.query_id}/stream`;

            console.log('🔌 Connecting to stream:', streamUrl);
            this.connectToEventSource(streamUrl);

        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    connectToEventSource(streamPath) {
        if (this.currentEventSource) {
            this.currentEventSource.close();
        }

        const fullUrl = streamPath.startsWith('http') ? streamPath : `${this.apiUrl}${streamPath}`;
        
        // Add authorization as query parameter for EventSource
        const url = new URL(fullUrl);
        url.searchParams.set('token', this.token);

        const eventSource = new EventSource(url.toString());
        this.currentEventSource = eventSource;

        let assistantMessageElement = null;
        let assistantMessageContent = '';

        eventSource.addEventListener('start', (event) => {
            console.log('📨 Stream started');
            if (CONFIG.DEBUG_MODE) console.log('Start data:', event.data);
        });

        eventSource.addEventListener('thinking', (event) => {
            console.log('🤔 AI thinking...');
            // Loading indicator already shown
        });

        eventSource.addEventListener('answer_chunk', (event) => {
            this.showLoading(false);

            const data = JSON.parse(event.data);
            const chunk = data.chunk || '';

            if (!assistantMessageElement) {
                assistantMessageElement = this.createMessageElement('', 'assistant');
                assistantMessageContent = '';
            }

            assistantMessageContent += chunk;
            this.updateMessageContent(assistantMessageElement, assistantMessageContent);
        });

        eventSource.addEventListener('sources', (event) => {
            const data = JSON.parse(event.data);
            console.log('📚 Sources received:', data.sources);
            if (data.sources) {
                this.updateCitations(data.sources);
            }
        });

        eventSource.addEventListener('done', (event) => {
            console.log('✅ Stream complete');
            this.showLoading(false);
            eventSource.close();
            this.currentEventSource = null;
        });

        eventSource.onerror = (error) => {
            console.error('❌ Stream error:', error);
            this.showLoading(false);

            if (!assistantMessageElement) {
                this.addMessage('Sorry, an error occurred while processing your request.', 'assistant');
            }

            eventSource.close();
            this.currentEventSource = null;
        };
    }

    addMessage(content, role) {
        return this.createMessageElement(content, role);
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
        if (!content) return '';
        
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
        document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 DOM Ready - Starting application...');
    window.app = new HomeAffairsAI();
});
