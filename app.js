/**
 * Hong Kong Home Affairs AI Assistant
 * Developer API Integration with SSE Streaming
 */

class HomeAffairsAI {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
        this.apiKey = CONFIG.API_KEY;
        this.conversationHistory = [];
        this.isFirstMessage = true;
        this.currentEventSource = null;

        this.init();
    }

    init() {
        console.log('🚀 Initializing Home Affairs AI Assistant...');
        console.log('📍 API URL:', this.apiUrl);
        console.log('🔑 API Key:', this.apiKey ? '✅ Configured' : '❌ Missing');
        
        this.attachEventListeners();
        this.updateUIWithConfig();
    }

    updateUIWithConfig() {
        // Update UI elements from config
        document.getElementById('secureBadgeText').textContent = CONFIG.SECURE_BADGE_TEXT;
        document.getElementById('loadingText').textContent = CONFIG.LOADING_MESSAGE;
    }

    attachEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            this.autoResizeTextarea(messageInput);
            sendButton.disabled = messageInput.value.trim() === '';
        });

        // Send on Enter (Shift+Enter for new line)
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.value.trim() !== '') {
                    this.handleSendMessage();
                }
            }
        });

        // Send button click
        sendButton.addEventListener('click', () => this.handleSendMessage());

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

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Show loading
        this.showLoading(true);

        try {
            await this.sendQuery(userMessage);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.addMessage('Sorry, an error occurred. Please try again.', 'assistant');
            this.showLoading(false);
        }

        // Re-enable input
        messageInput.disabled = false;
        messageInput.focus();
    }

    async sendQuery(userMessage) {
        // Prepare query (prepend system prompt on first message)
        let finalMessage = userMessage;
        if (this.isFirstMessage) {
            finalMessage = `${CONFIG.SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;
            this.isFirstMessage = false;
        }

        // Prepare request body per Developer API spec
        const requestBody = {
            message: finalMessage,
            system_prompt: this.isFirstMessage ? undefined : CONFIG.SYSTEM_PROMPT,
            context_history: this.conversationHistory.slice(0, -1), // Exclude current message
            tool_groups: CONFIG.TOOL_GROUPS,
            tool_names: CONFIG.TOOL_NAMES,
            top_k: CONFIG.TOP_K || 5
        };

        if (CONFIG.DEBUG_MODE) {
            console.log('📤 Sending query:', requestBody);
        }

        try {
            // Use streaming endpoint
            await this.connectToStream(requestBody);
        } catch (error) {
            console.error('❌ Query error:', error);
            throw error;
        }
    }

    async connectToStream(requestBody) {
        const streamUrl = `${this.apiUrl}${CONFIG.ENDPOINTS.QUERY_STREAM}`;
        
        if (CONFIG.DEBUG_MODE) {
            console.log('🔌 Connecting to stream:', streamUrl);
        }

        // Close existing connection if any
        if (this.currentEventSource) {
            this.currentEventSource.close();
        }

        // For POST with SSE, we need to use fetch then EventSource
        // Developer API expects POST with body, so we'll use fetch API with stream
        const response = await fetch(streamUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let buffer = '';
        let assistantMessageElement = null;
        let assistantMessageContent = '';

        const processChunk = async () => {
            try {
                const { value, done } = await reader.read();
                
                if (done) {
                    this.showLoading(false);
                    console.log('✅ Stream complete');
                    return;
                }

                // Decode chunk
                buffer += decoder.decode(value, { stream: true });
                
                // Process complete SSE messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        const eventType = line.substring(6).trim();
                        if (CONFIG.DEBUG_MODE) console.log('📨 Event:', eventType);
                    } else if (line.startsWith('data:')) {
                        const data = line.substring(5).trim();
                        if (!data) continue;

                        try {
                            const parsed = JSON.parse(data);
                            this.handleStreamEvent(parsed, {
                                assistantMessageElement: () => assistantMessageElement,
                                setAssistantMessageElement: (el) => { assistantMessageElement = el; },
                                assistantMessageContent: () => assistantMessageContent,
                                setAssistantMessageContent: (content) => { assistantMessageContent = content; }
                            });
                        } catch (e) {
                            // Not JSON, might be plain text chunk
                            if (CONFIG.DEBUG_MODE) console.log('📝 Text chunk:', data);
                        }
                    }
                }

                // Continue reading
                await processChunk();
            } catch (error) {
                console.error('❌ Stream error:', error);
                this.showLoading(false);
                if (!assistantMessageElement) {
                    this.addMessage('Sorry, an error occurred while processing your request.', 'assistant');
                }
            }
        };

        await processChunk();
    }

    handleStreamEvent(data, state) {
        // Handle different event types based on the data structure
        if (data.chunk) {
            // Answer chunk
            this.showLoading(false);
            
            if (!state.assistantMessageElement()) {
                const el = this.createMessageElement('', 'assistant');
                state.setAssistantMessageElement(el);
                state.setAssistantMessageContent('');
            }
            
            const newContent = state.assistantMessageContent() + data.chunk;
            state.setAssistantMessageContent(newContent);
            this.updateMessageContent(state.assistantMessageElement(), newContent);
            
        } else if (data.sources) {
            // Sources received
            console.log('📚 Sources received:', data.sources);
            this.updateCitations(data.sources);
            
        } else if (data.answer) {
            // Complete answer
            if (state.assistantMessageElement()) {
                this.updateMessageContent(state.assistantMessageElement(), data.answer);
                state.setAssistantMessageContent(data.answer);
            } else {
                this.addMessage(data.answer, 'assistant');
            }
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: data.answer
            });
            
        } else if (data.intent) {
            // Query started
            if (CONFIG.DEBUG_MODE) console.log('🎯 Intent:', data.intent);
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
        if (!content) return '';
        
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

        // Filter only allowed domain sources
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
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 DOM Ready - Starting application...');
    window.app = new HomeAffairsAI();
});

