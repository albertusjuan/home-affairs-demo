// Hong Kong Home Affairs AI Assistant - Main Application Logic

class HomeAffairsAI {
    constructor() {
        this.token = null;
        this.apiUrl = null;
        this.conversationId = null;
        this.isNewSession = true;
        this.currentEventSource = null;
        this.currentQueryId = null;

        this.init();
    }

    init() {
        // Check for existing session
        this.token = localStorage.getItem(CONFIG.TOKEN_STORAGE_KEY);
        this.apiUrl = localStorage.getItem(CONFIG.API_URL_STORAGE_KEY);
        this.conversationId = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);

        if (this.token && this.apiUrl) {
            this.showChatInterface();
        } else {
            this.showLoginScreen();
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

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

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
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

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'none';
    }

    showChatInterface() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';
        document.getElementById('logoutButton').style.display = 'flex';

        // Initialize session if needed
        if (!this.conversationId) {
            this.createSession();
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const apiUrl = document.getElementById('apiUrl').value.trim();

        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';

        try {
            const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            
            // Debug: Log the response to see what we're getting
            console.log('Login response:', data);

            // Try multiple possible token field names
            const token = data.token || data.access_token || data.accessToken || data.jwt;
            
            if (token) {
                this.token = token;
                this.apiUrl = apiUrl;

                // Store credentials
                localStorage.setItem(CONFIG.TOKEN_STORAGE_KEY, this.token);
                localStorage.setItem(CONFIG.API_URL_STORAGE_KEY, this.apiUrl);

                this.showChatInterface();
            } else {
                console.error('Token not found in response. Response data:', data);
                throw new Error('No token received. Check console for details.');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message || 'An error occurred during login';
            errorDiv.style.display = 'block';
        }
    }

    async createSession() {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/chat/sessions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify({
                    title: 'Home Affairs Inquiry',
                    mode: CONFIG.MODE
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create session');
            }

            const data = await response.json();
            this.conversationId = data.id;
            sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, this.conversationId);
            console.log('Session created:', this.conversationId);
        } catch (error) {
            console.error('Session creation error:', error);
            this.showError('Failed to initialize chat session');
        }
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

        // Prepare query (add system prompt if first message)
        let finalQuery = userMessage;
        if (this.isNewSession) {
            finalQuery = `${CONFIG.SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;
            this.isNewSession = false;
        }

        // Show loading indicator
        this.showLoading(true);

        try {
            await this.sendQuery(finalQuery);
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, an error occurred. Please try again.', 'assistant');
            this.showLoading(false);
        }

        // Re-enable input
        messageInput.disabled = false;
        messageInput.focus();
    }

    async sendQuery(query) {
        try {
            const response = await fetch(`${this.apiUrl}/api/v1/ai-agent/query/stream`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'x-tenant-subdomain': CONFIG.TENANT_SUBDOMAIN
                },
                body: JSON.stringify({
                    query: query,
                    conversation_id: this.conversationId,
                    mode: CONFIG.MODE,
                    enabled_tools: CONFIG.ENABLED_TOOLS
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Query failed');
            }

            const data = await response.json();
            this.currentQueryId = data.query_id;

            // Connect to SSE stream
            this.connectToStream(data.stream_url || `/api/v1/ai-agent/query/${data.query_id}/stream`);
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    connectToStream(streamPath) {
        // Close existing connection if any
        if (this.currentEventSource) {
            this.currentEventSource.close();
        }

        const streamUrl = `${this.apiUrl}${streamPath}`;
        const eventSource = new EventSource(streamUrl);
        this.currentEventSource = eventSource;

        let assistantMessageElement = null;
        let assistantMessageContent = '';

        eventSource.addEventListener('start', (event) => {
            console.log('Stream started:', event.data);
        });

        eventSource.addEventListener('thinking', (event) => {
            console.log('AI is thinking:', event.data);
            // Loading indicator is already shown
        });

        eventSource.addEventListener('answer_chunk', (event) => {
            this.showLoading(false);

            const data = JSON.parse(event.data);
            const chunk = data.chunk || '';

            // Create assistant message element if it doesn't exist
            if (!assistantMessageElement) {
                assistantMessageElement = this.createMessageElement('', 'assistant');
                assistantMessageContent = '';
            }

            // Append chunk
            assistantMessageContent += chunk;
            this.updateMessageContent(assistantMessageElement, assistantMessageContent);
        });

        eventSource.addEventListener('sources', (event) => {
            console.log('Sources received:', event.data);
            const data = JSON.parse(event.data);
            if (data.sources && Array.isArray(data.sources)) {
                this.updateCitations(data.sources);
            }
        });

        eventSource.addEventListener('answer_done', (event) => {
            console.log('Answer complete:', event.data);
        });

        eventSource.addEventListener('done', (event) => {
            console.log('Stream complete');
            this.showLoading(false);
            eventSource.close();
            this.currentEventSource = null;
        });

        eventSource.addEventListener('error', (event) => {
            console.error('Stream error:', event);
            this.showLoading(false);

            if (!assistantMessageElement) {
                this.addMessage('Sorry, an error occurred while processing your request.', 'assistant');
            }

            eventSource.close();
            this.currentEventSource = null;
        });
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

        // Scroll to bottom
        this.scrollToBottom();

        return contentDiv;
    }

    updateMessageContent(element, content) {
        element.innerHTML = this.formatMessage(content);
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convert markdown-style formatting to HTML
        let formatted = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraph if not already
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

        // Clear existing citations
        citationList.innerHTML = '';

        if (!sources || sources.length === 0) {
            citationList.innerHTML = '<div class="no-citations"><p>No citations available for this response.</p></div>';
            return;
        }

        // Filter and display only allowed domain sources
        const allowedSources = sources.filter(source => {
            const url = source.url || source.source_url || '';
            return CONFIG.ALLOWED_DOMAINS.some(domain => url.startsWith(domain));
        });

        if (allowedSources.length === 0) {
            citationList.innerHTML = '<div class="no-citations"><p>No official government sources found.</p></div>';
            return;
        }

        // Create citation items
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

        // Open the drawer
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

    showError(message) {
        this.addMessage(message, 'assistant');
    }

    handleLogout() {
        // Clear stored data
        localStorage.removeItem(CONFIG.TOKEN_STORAGE_KEY);
        localStorage.removeItem(CONFIG.API_URL_STORAGE_KEY);
        sessionStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);

        // Reset state
        this.token = null;
        this.apiUrl = null;
        this.conversationId = null;
        this.isNewSession = true;

        // Close any open streams
        if (this.currentEventSource) {
            this.currentEventSource.close();
            this.currentEventSource = null;
        }

        // Clear chat
        document.getElementById('chatMessages').innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="#F5F7FA"/>
                        <path d="M32 16L40 32L32 48L24 32L32 16Z" fill="#003366"/>
                    </svg>
                </div>
                <h3>How can I help you today?</h3>
                <p>Ask me anything about Hong Kong Home Affairs services, youth programs, community facilities, and more.</p>
                <div class="suggested-queries">
                    <button class="suggestion-chip" data-query="What are the latest youth grants available?">Youth grants</button>
                    <button class="suggestion-chip" data-query="How do I register for community services?">Community services</button>
                    <button class="suggestion-chip" data-query="What facilities are available in my district?">District facilities</button>
                </div>
            </div>
        `;

        // Show login screen
        this.showLoginScreen();
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HomeAffairsAI();
});

