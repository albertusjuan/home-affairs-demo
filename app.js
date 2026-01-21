// Hong Kong Home Affairs AI Assistant

class HomeAffairsAI {
    constructor() {
        this.apiUrl = null;
        this.apiKey = null;
        this.conversationId = null;
        this.isFirstMessage = true;
        this.init();
    }

    async init() {
        // Load from config.local.js or localStorage
        if (window.LOCAL_CONFIG) {
            this.apiUrl = window.LOCAL_CONFIG.API_BASE_URL;
            this.apiKey = window.LOCAL_CONFIG.API_KEY;
        } else {
            this.apiUrl = localStorage.getItem('api_url');
            this.apiKey = localStorage.getItem('api_key');
        }

        if (this.apiUrl && this.apiKey) {
            await this.showChat();
        } else {
            this.showSettings();
        }

        this.attachEvents();
    }

    async showChat() {
        // Create session for multi-turn conversation
        this.conversationId = sessionStorage.getItem('conversation_id');
        if (!this.conversationId) {
            try {
                await this.createSession();
            } catch (error) {
                console.error('Failed to create session:', error);
                // Continue without conversation_id for now
            }
        }

        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('chatInterface').style.display = 'flex';
        document.getElementById('settingsButton').style.display = 'flex';
    }

    async createSession() {
        const response = await fetch(`${this.apiUrl}/api/v1/chat/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'x-tenant-subdomain': 'home-affairs-hk'
            },
            body: JSON.stringify({
                title: 'Home Affairs Inquiry',
                mode: 'fast'
            })
        });

        if (response.ok) {
            const data = await response.json();
            this.conversationId = data.id;
            sessionStorage.setItem('conversation_id', this.conversationId);
            console.log('✓ Session created:', this.conversationId);
        } else {
            console.warn('Could not create session, continuing without conversation_id');
        }
    }

    attachEvents() {
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('sendButton')?.addEventListener('click', () => this.send());
        document.getElementById('closeDrawer')?.addEventListener('click', () => {
            document.getElementById('citationDrawer').classList.remove('open');
        });

        const input = document.getElementById('messageInput');
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 150) + 'px';
                document.getElementById('sendButton').disabled = !input.value.trim();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.value.trim()) {
                    e.preventDefault();
                    this.send();
                }
            });
        }

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.query;
                document.getElementById('sendButton').disabled = false;
                this.send();
            });
        });

        // Settings button
        document.getElementById('settingsButton')?.addEventListener('click', () => {
            this.showSettings();
        });
    }

    saveSettings() {
        const url = document.getElementById('apiUrl').value.trim();
        const key = document.getElementById('apiKey').value.trim();

        if (!url || !key) {
            alert('Please enter both API URL and API Key');
            return;
        }

        this.apiUrl = url;
        this.apiKey = key;
        localStorage.setItem('api_url', url);
        localStorage.setItem('api_key', key);
        
        // Reset conversation
        this.conversationId = null;
        sessionStorage.removeItem('conversation_id');
        this.isFirstMessage = true;
        
        this.showChat();
    }

    showSettings() {
        document.getElementById('settingsPanel').style.display = 'flex';
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('settingsButton').style.display = 'none';
        
        // Pre-fill current values
        if (this.apiUrl) document.getElementById('apiUrl').value = this.apiUrl;
        if (this.apiKey) document.getElementById('apiKey').value = this.apiKey;
    }

    async send() {
        const input = document.getElementById('messageInput');
        const msg = input.value.trim();
        if (!msg) return;

        input.disabled = true;
        document.getElementById('sendButton').disabled = true;
        input.value = '';
        input.style.height = 'auto';

        document.querySelector('.welcome-message')?.remove();

        this.addMsg(msg, 'user');

        // Add system prompt on first message
        let finalMsg = msg;
        if (this.isFirstMessage) {
            finalMsg = `You are the Hong Kong Home Affairs AI Assistant. Your knowledge is strictly limited to the official websites of the Home Affairs Department (had.gov.hk) and the Home and Youth Affairs Bureau (hyab.gov.hk). When answering, search only these domains using the context of 'home affair Hong Kong'. Provide concise answers and always include the direct links to the relevant pages as citations.\n\nUser Question: ${msg}`;
            this.isFirstMessage = false;
        }

        this.showStatus('preparing', 'Preparing query...');

        try {
            await this.query(finalMsg);
        } catch (e) {
            console.error('Error:', e);
            this.addMsg('❌ Error: ' + e.message, 'assistant');
            this.hideStatus();
        }

        input.disabled = false;
        input.focus();
    }

    async query(message) {
        const url = `${this.apiUrl}/api/v1/developer/agent/query/stream`;
        
        const requestBody = {
            message: message,
            enabled_tools: ['web_search']
        };

        // Add conversation_id if available for multi-turn context
        if (this.conversationId) {
            requestBody.conversation_id = this.conversationId;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'x-tenant-subdomain': 'home-affairs-hk'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API error ${response.status}: ${text}`);
        }

        await this.readStream(response.body);
    }

    async readStream(stream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantEl = null;
        let content = '';
        let currentEvent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('event:')) {
                        currentEvent = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        const data = line.substring(5).trim();
                        if (!data || data === '{}') continue;

                        try {
                            const json = JSON.parse(data);

                            if (currentEvent === 'start') {
                                console.log('✓ Stream started');
                                this.showStatus('processing', 'Processing...');
                            }
                            else if (currentEvent === 'thinking') {
                                console.log('✓ AI thinking...');
                                this.showStatus('thinking', '🔍 Searching official HK Gov domains...');
                            }
                            else if (currentEvent === 'tool_start') {
                                console.log('✓ Tool executing:', json.tool_name);
                                this.showStatus('searching', '🌐 Searching official websites...');
                            }
                            else if (currentEvent === 'answer_chunk') {
                                this.hideStatus();
                                if (!assistantEl) {
                                    assistantEl = this.createMsg('', 'assistant');
                                    content = '';
                                }
                                content += json.chunk || '';
                                assistantEl.innerHTML = this.format(content);
                                this.scroll();
                            }
                            else if (currentEvent === 'sources') {
                                console.log('✓ Sources received:', json.sources?.length || 0);
                                this.showSources(json.sources || []);
                            }
                            else if (currentEvent === 'answer_done') {
                                console.log('✓ Answer complete');
                            }
                            else if (currentEvent === 'done') {
                                this.hideStatus();
                                console.log('✓ Stream complete');
                            }
                            else if (currentEvent === 'error') {
                                console.error('Stream error:', json);
                                this.hideStatus();
                                if (!assistantEl) {
                                    this.addMsg('❌ An error occurred while processing your request.', 'assistant');
                                }
                            }
                        } catch (e) {
                            console.warn('Parse error:', e);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Stream error:', e);
            this.hideStatus();
            if (!assistantEl) {
                this.addMsg('❌ Connection error occurred.', 'assistant');
            }
        }
    }

    showStatus(type, message) {
        const indicator = document.getElementById('statusIndicator');
        const icon = indicator.querySelector('.status-icon');
        const text = indicator.querySelector('.status-text');
        
        // Update icon based on type
        if (type === 'thinking' || type === 'searching') {
            icon.innerHTML = '🔍';
            icon.className = 'status-icon searching';
        } else {
            icon.innerHTML = '⚙️';
            icon.className = 'status-icon processing';
        }
        
        text.textContent = message;
        indicator.style.display = 'flex';
    }

    hideStatus() {
        document.getElementById('statusIndicator').style.display = 'none';
    }

    addMsg(text, role) {
        const el = this.createMsg(text, role);
        return el;
    }

    createMsg(text, role) {
        const container = document.getElementById('chatMessages');
        const msg = document.createElement('div');
        msg.className = `message message-${role}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = this.format(text);
        
        msg.appendChild(content);
        container.appendChild(msg);
        this.scroll();
        
        return content;
    }

    format(text) {
        // Use marked.js for proper markdown rendering
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false
            });
            return marked.parse(text);
        }
        
        // Fallback simple formatting
        let html = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        if (!html.startsWith('<p>')) html = '<p>' + html + '</p>';
        html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        return html;
    }

    scroll() {
        const el = document.getElementById('chatMessages');
        el.scrollTop = el.scrollHeight;
    }

    showSources(sources) {
        const list = document.getElementById('citationList');
        const drawer = document.getElementById('citationDrawer');
        
        list.innerHTML = '';

        if (!sources || sources.length === 0) {
            list.innerHTML = '<div class="no-citations"><p>No citations available.</p></div>';
            return;
        }

        // Filter for allowed domains
        const allowed = ['https://www.had.gov.hk/', 'https://www.hyab.gov.hk/'];
        const filtered = sources.filter(s => {
            const url = s.url || s.source_url || '';
            return allowed.some(d => url.startsWith(d));
        });

        if (filtered.length === 0) {
            list.innerHTML = '<div class="no-citations"><p>No official government sources found.</p></div>';
            return;
        }

        filtered.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'citation-item';
            const url = src.url || src.source_url || '#';
            const title = src.title || src.document_title || 'Official Document';
            
            item.innerHTML = `
                <div class="citation-number">${i + 1}</div>
                <div class="citation-content">
                    <div class="citation-title">${this.escape(title)}</div>
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="citation-url">${url}</a>
                </div>
            `;
            list.appendChild(item);
        });

        drawer.classList.add('open');
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new HomeAffairsAI();
});
