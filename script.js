/**
 * Advanced Multi-Model chimera with Collaboration
 * Features intelligent task distribution and model coordination
 */
class AdvancedMultiModelAI {
    constructor() {
        // Core state
        this.apiKey = '';
        this.znapaiKey = '';
        this.apiProvider = 'openrouter';
        this.strategy = 'single';
        this.selectedModel = '';
        this.collaborativeModels = [];
        this.taskType = 'analysis';
        this.temperature = 0.7;
        this.maxTokens = 1000;
        this.chatHistory = [];
        this.isLoading = false;
        this.settingsSaved = false;

        // Advanced features
        this.taskWorkflows = this.initializeTaskWorkflows();
        this.messageQueue = [];
        this.isProcessing = false;
        this.modelPerformance = {}; // Track model performance for optimization

        // ZnapAI Models
        this.znapaiModels = this.initializeZnapAIModels();

        // NEW: Performance & Caching System
        this.responseCache = new Map();
        this.requestQueue = [];
        this.rateLimiter = {
            lastRequest: 0,
            minInterval: 1000, // 1 second between requests
            maxQueueSize: 10
        };
        this.cacheSettings = {
            enabled: true,
            maxSize: 100,
            ttl: 30 * 60 * 1000, // 30 minutes
            keyPrefix: 'cache_'
        };

        // NEW: Enhanced Error Tracking
        this.errorLog = [];
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            backoffMultiplier: 2
        };

        // NEW: Chat History Management
        this.chatStorage = {
            maxSessions: 5,
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
            currentSessionId: null
        };

        // NEW: Message Streaming Support
        this.streamingConfig = {
            enabled: true,
            chunkSize: 50,
            streamDelay: 50
        };
        this.currentStreamController = null;



        // NEW: Lazy Loading for Models
        this.modelLoadingState = new Map();
        this.lazyLoadThreshold = 20; // Load models when user scrolls near bottom

        // NEW: Web Worker for Heavy Processing
        this.workerManager = null;
        this.workerSupported = typeof Worker !== 'undefined';

        // NEW: Touch Gestures for Mobile
        this.touchGestures = {
            enabled: true,
            swipeThreshold: 50,
            longPressThreshold: 500
        };
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };

        // NEW: Offline Support
        this.offlineConfig = {
            enabled: true,
            cacheKey: 'offline_cache_v2',
            maxOfflineItems: 50
        };
        this.isOffline = !navigator.onLine;

        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    /**
     * NEW: Message Streaming Implementation
     */
    async streamResponse(model, messages, onChunk, onComplete, onError) {
        try {
            this.currentStreamController = new AbortController();

            // Simulate streaming for now - in real implementation, this would use actual streaming APIs
            const response = await this.callAPI(model, messages);
            const fullContent = response.choices[0].message.content;

            // Stream the content in chunks
            let currentIndex = 0;
            const chunkSize = this.streamingConfig.chunkSize;

            const streamInterval = setInterval(() => {
                if (currentIndex >= fullContent.length) {
                    clearInterval(streamInterval);
                    onComplete(fullContent);
                    return;
                }

                const chunk = fullContent.substring(currentIndex, currentIndex + chunkSize);
                currentIndex += chunkSize;

                onChunk(chunk);
            }, this.streamingConfig.streamDelay);

            return {
                stop: () => {
                    clearInterval(streamInterval);
                    this.currentStreamController?.abort();
                }
            };

        } catch (error) {
            onError(error);
        }
    }

    /**
     * NEW: Enhanced Stream Display
     */
    displayStreamingResponse(initialContent = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant streaming';
        messageDiv.setAttribute('role', 'article');
        messageDiv.setAttribute('aria-label', 'AI streaming response');

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot" aria-hidden="true"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content streaming-content';
        contentDiv.innerHTML = this.formatMessage(initialContent);

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(typingIndicator);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        return {
            updateContent: (chunk) => {
                contentDiv.innerHTML = this.formatMessage(initialContent + chunk);
                this.scrollToBottom();
            },
            complete: (finalContent) => {
                contentDiv.innerHTML = this.formatMessage(finalContent);
                typingIndicator.remove();
                messageDiv.classList.remove('streaming');

                // Add to chat history
                this.chatHistory.push({ role: 'assistant', content: finalContent });
                this.saveMessageToSession('assistant', finalContent);

                if (this.chatHistory.length > 50) {
                    this.chatHistory = this.chatHistory.slice(-50);
                }
            },
            element: messageDiv
        };
    }

    /**
     * NEW: File Upload & Drag & Drop
     */
    initializeFileUpload() {
        // Create upload area
        const uploadArea = document.createElement('div');
        uploadArea.className = 'upload-area';
        uploadArea.innerHTML = `
            <div class="upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag & drop files here or <span class="upload-link">browse</span></p>
                <small>Supports: ${this.fileUploadConfig.allowedTypes.join(', ')} (Max: ${this.fileUploadConfig.maxFileSize / (1024 * 1024)}MB)</small>
            </div>
            <input type="file" multiple accept="${this.fileUploadConfig.allowedTypes.join(',')}" style="display: none;">
        `;

        // Insert before message input
        this.messageInput.parentNode.insertBefore(uploadArea, this.messageInput);

        const fileInput = uploadArea.querySelector('input[type="file"]');
        const uploadLink = uploadArea.querySelector('.upload-link');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Click to browse
        uploadLink.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('click', (e) => {
            if (e.target === uploadArea) fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }

    async handleFileUpload(files) {
        const validFiles = [];

        for (const file of files) {
            if (this.validateFile(file)) {
                validFiles.push(file);
            }
        }

        if (validFiles.length === 0) {
            this.showToast('No valid files selected', 'error');
            return;
        }

        if (validFiles.length > this.fileUploadConfig.maxFiles) {
            this.showToast(`Maximum ${this.fileUploadConfig.maxFiles} files allowed`, 'error');
            return;
        }

        this.showToast(`Processing ${validFiles.length} file(s)...`, 'info');

        for (const file of validFiles) {
            try {
                const content = await this.readFileContent(file);
                this.uploadedFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    content: content
                });

                // Add file info to message input
                const fileInfo = `[File: ${file.name}]`;
                this.messageInput.value += (this.messageInput.value ? '\n' : '') + fileInfo;
                this.updateCharCount();
                this.toggleSendButton();

            } catch (error) {
                this.logError(error, { fileName: file.name });
                this.showToast(`Error reading ${file.name}`, 'error');
            }
        }

        this.showToast('Files ready for processing', 'success');
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.fileUploadConfig.maxFileSize) {
            this.showToast(`${file.name} is too large (max ${this.fileUploadConfig.maxFileSize / (1024 * 1024)}MB)`, 'error');
            return false;
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.fileUploadConfig.allowedTypes.includes(extension)) {
            this.showToast(`${file.name} format not supported`, 'error');
            return false;
        }

        return true;
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;

                // If it's a text file, try to parse as such
                if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                    resolve(content);
                } else {
                    // For other files, provide metadata and suggest processing
                    resolve(`File: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}\n\n[Content extraction would require additional processing]`);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * NEW: Lazy Loading for Models
     */
    initializeLazyLoading() {
        // Monitor scroll position for model loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadModelIfNeeded(entry.target);
                }
            });
        }, {
            rootMargin: '100px'
        });

        // Observe model elements (will be set up when models are loaded)
        this.modelObserver = observer;
    }

    loadModelIfNeeded(modelElement) {
        const modelId = modelElement.dataset.modelId;
        if (!modelId || this.modelLoadingState.has(modelId)) return;

        // Mark as loading
        this.modelLoadingState.set(modelId, 'loading');

        // Simulate lazy loading (in real app, this would fetch model metadata)
        setTimeout(() => {
            this.modelLoadingState.set(modelId, 'loaded');
            modelElement.classList.add('loaded');
        }, 100);
    }

    /**
     * NEW: Web Worker Integration
     */
    initializeWorker() {
        if (!this.workerSupported) {
            console.log('Web Workers not supported, falling back to main thread');
            return;
        }

        try {
            // Import worker dynamically
            import('./collaborative-worker.js')
                .then(module => {
                    this.workerManager = new module.CollaborativeWorkerManager();
                    this.setupWorkerListeners();
                    console.log('✅ Collaborative Worker initialized');
                })
                .catch(error => {
                    console.warn('Failed to load worker:', error);
                });
        } catch (error) {
            console.warn('Worker initialization failed:', error);
        }
    }

    setupWorkerListeners() {
        if (!this.workerManager) return;

        this.workerManager.on('progress', (data) => {
            this.showToast(`Processing: ${data.message}`, 'info', 1000);
        });

        this.workerManager.on('workflow_progress', (data) => {
            this.showToast(`Workflow: ${data.message}`, 'info', 1000);
        });
    }

    /**
     * NEW: Touch Gestures for Mobile
     */
    initializeTouchGestures() {
        if (!this.touchGestures.enabled) return;

        // Add gesture area to main container
        const gestureArea = document.querySelector('.chat-container') || document.body;

        // Touch start
        gestureArea.addEventListener('touchstart', (e) => {
            this.touchStartTime = Date.now();
            this.touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }, { passive: true });

        // Touch end
        gestureArea.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchEndPos = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const duration = touchEndTime - this.touchStartTime;
            const deltaX = touchEndPos.x - this.touchStartPos.x;
            const deltaY = touchEndPos.y - this.touchStartPos.y;

            // Determine gesture type
            if (duration < this.touchGestures.longPressThreshold) {
                // Quick tap or swipe
                if (Math.abs(deltaX) > this.touchGestures.swipeThreshold) {
                    this.handleSwipeGesture(deltaX > 0 ? 'right' : 'left');
                } else {
                    this.handleTapGesture(touchEndPos);
                }
            } else {
                // Long press
                this.handleLongPressGesture(touchEndPos);
            }
        }, { passive: true });
    }

    handleSwipeGesture(direction) {
        switch (direction) {
            case 'right':
                // Swipe right - open settings
                this.toggleSettings();
                break;
            case 'left':
                // Swipe left - clear chat (with confirmation)
                if (confirm('Clear all messages?')) {
                    this.clearChat();
                }
                break;
        }
    }

    handleTapGesture(position) {
        // Could implement tap-based shortcuts
        console.log('Tap gesture at:', position);
    }

    handleLongPressGesture(position) {
        // Could implement context menu or special actions
        console.log('Long press at:', position);
    }

    /**
     * NEW: Offline Support
     */
    initializeOfflineSupport() {
        if (!this.offlineConfig.enabled) return;

        // Register service worker if supported
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('✅ Service Worker registered');
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }

        // Monitor online status
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.showToast('Back online', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOffline = true;
            this.showToast('Working offline', 'warning');
        });

        // Load offline cache
        this.loadOfflineCache();
    }

    async syncOfflineData() {
        try {
            // Sync any pending data when back online
            const offlineData = this.getOfflineData();
            for (const item of offlineData) {
                // Process offline items
                console.log('Syncing offline item:', item);
            }
            this.clearOfflineData();
        } catch (error) {
            this.logError(error, { context: 'offline_sync' });
        }
    }

    saveOfflineData(data) {
        try {
            const offlineCache = this.getOfflineData();
            offlineCache.push({
                ...data,
                timestamp: Date.now(),
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            });

            // Limit offline items
            if (offlineCache.length > this.offlineConfig.maxOfflineItems) {
                offlineCache.splice(0, offlineCache.length - this.offlineConfig.maxOfflineItems);
            }

            localStorage.setItem(this.offlineConfig.cacheKey, JSON.stringify(offlineCache));
        } catch (error) {
            this.logError(error, { context: 'save_offline_data' });
        }
    }

    getOfflineData() {
        try {
            return JSON.parse(localStorage.getItem(this.offlineConfig.cacheKey) || '[]');
        } catch {
            return [];
        }
    }

    clearOfflineData() {
        localStorage.removeItem(this.offlineConfig.cacheKey);
    }

    loadOfflineCache() {
        // Preload any cached responses or data
        const offlineData = this.getOfflineData();
        console.log(`📱 Loaded ${offlineData.length} offline items`);
    }

    /**
     * NEW: Response Caching System
     */
    getCacheKey(model, messages, temperature, maxTokens) {
        const content = JSON.stringify({
            model,
            messages: messages.slice(-10), // Only cache last 10 messages for context
            temperature,
            maxTokens
        });
        // Use Unicode-safe encoding instead of btoa
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const base64 = btoa(String.fromCharCode(...data));
        return this.cacheSettings.keyPrefix + base64.replace(/[^a-zA-Z0-9]/g, '');
    }

    getCachedResponse(key) {
        if (!this.cacheSettings.enabled) return null;

        const cached = this.responseCache.get(key);
        if (!cached) return null;

        // Check if cache entry has expired
        if (Date.now() - cached.timestamp > this.cacheSettings.ttl) {
            this.responseCache.delete(key);
            return null;
        }

        return cached.response;
    }

    setCachedResponse(key, response) {
        if (!this.cacheSettings.enabled) return;

        // Implement LRU eviction if cache is full
        if (this.responseCache.size >= this.cacheSettings.maxSize) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }

        this.responseCache.set(key, {
            response,
            timestamp: Date.now()
        });
    }

    /**
     * NEW: Request Queue & Rate Limiting
     */
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                requestFn,
                resolve,
                reject,
                timestamp: Date.now()
            });

            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;

        const now = Date.now();
        const timeSinceLastRequest = now - this.rateLimiter.lastRequest;

        if (timeSinceLastRequest < this.rateLimiter.minInterval) {
            setTimeout(() => this.processQueue(), this.rateLimiter.minInterval - timeSinceLastRequest);
            return;
        }

        if (this.requestQueue.length > this.rateLimiter.maxQueueSize) {
            const oldestRequest = this.requestQueue.shift();
            oldestRequest.reject(new Error('Request queue overflow'));
        }

        const request = this.requestQueue.shift();
        this.isProcessing = true;
        this.rateLimiter.lastRequest = now;

        try {
            const result = await request.requestFn();
            request.resolve(result);
        } catch (error) {
            request.reject(error);
        } finally {
            this.isProcessing = false;
            // Process next request after a small delay
            setTimeout(() => this.processQueue(), 100);
        }
    }

    /**
     * NEW: Enhanced Error Handling
     */
    logError(error, context = {}) {
        const errorEntry = {
            timestamp: Date.now(),
            message: error.message,
            stack: error.stack,
            context,
            type: this.categorizeError(error)
        };

        this.errorLog.push(errorEntry);

        // Keep only last 50 errors
        if (this.errorLog.length > 50) {
            this.errorLog = this.errorLog.slice(-50);
        }

        console.error('AdvancedMultiModelAI Error:', errorEntry);
    }

    categorizeError(error) {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return 'network';
        } else if (message.includes('401') || message.includes('403')) {
            return 'authentication';
        } else if (message.includes('429')) {
            return 'rate_limit';
        } else if (message.includes('timeout')) {
            return 'timeout';
        } else if (message.includes('quota') || message.includes('credits')) {
            return 'billing';
        } else if (message.includes('model') || message.includes('invalid')) {
            return 'model_error';
        }

        return 'unknown';
    }

    async retryWithBackoff(fn, retries = 0) {
        try {
            return await fn();
        } catch (error) {
            if (retries >= this.retryConfig.maxRetries) {
                throw error;
            }

            const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retries);
            this.logError(error, { retryAttempt: retries + 1, willRetryIn: delay });

            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retryWithBackoff(fn, retries + 1);
        }
    }

    /**
     * NEW: Chat History Management
     */
    createNewSession() {
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.chatStorage.currentSessionId = sessionId;

        const sessions = this.getStoredSessions();
        sessions[sessionId] = {
            id: sessionId,
            created: Date.now(),
            lastActivity: Date.now(),
            messages: []
        };

        // Clean up old sessions
        this.cleanupOldSessions(sessions);
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));

        return sessionId;
    }

    getStoredSessions() {
        try {
            return JSON.parse(localStorage.getItem('chat_sessions') || '{}');
        } catch {
            return {};
        }
    }

    saveMessageToSession(role, content) {
        if (!this.chatStorage.currentSessionId) {
            this.createNewSession();
        }

        const sessions = this.getStoredSessions();
        const session = sessions[this.chatStorage.currentSessionId];

        if (session) {
            session.lastActivity = Date.now();
            session.messages.push({ role, content, timestamp: Date.now() });

            // Limit messages per session
            if (session.messages.length > 100) {
                session.messages = session.messages.slice(-100);
            }

            localStorage.setItem('chat_sessions', JSON.stringify(sessions));
        }
    }

    loadSession(sessionId) {
        const sessions = this.getStoredSessions();
        const session = sessions[sessionId];

        if (session) {
            this.chatStorage.currentSessionId = sessionId;
            this.chatHistory = session.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Update last activity
            session.lastActivity = Date.now();
            localStorage.setItem('chat_sessions', JSON.stringify(sessions));

            return true;
        }
        return false;
    }

    cleanupOldSessions(sessions) {
        const now = Date.now();
        const cutoffTime = now - this.chatStorage.sessionTimeout;

        Object.keys(sessions).forEach(sessionId => {
            if (sessions[sessionId].lastActivity < cutoffTime) {
                delete sessions[sessionId];
            }
        });

        // Keep only the most recent sessions if still over limit
        const sessionArray = Object.values(sessions)
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .slice(0, this.chatStorage.maxSessions);

        const cleaned = {};
        sessionArray.forEach(session => {
            cleaned[session.id] = session;
        });

        return cleaned;
    }

    /**
     * NEW: Settings Backup & Sync
     */
    backupSettings() {
        const settings = {
            apiProvider: this.apiProvider,
            apiKey: this.apiKey,
            znapaiKey: this.znapaiKey,
            strategy: this.strategy,
            model: this.selectedModel,
            collaborativeModels: this.collaborativeModels,
            taskType: this.taskType,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            timestamp: Date.now(),
            version: '2.0'
        };

        // Create backup with timestamp
        const backups = this.getSettingsBackups();
        const backupKey = 'backup_' + Date.now();
        backups[backupKey] = settings;

        // Keep only last 10 backups
        const backupKeys = Object.keys(backups).sort().reverse();
        if (backupKeys.length > 10) {
            backupKeys.slice(10).forEach(key => delete backups[key]);
        }

        localStorage.setItem('settings_backups', JSON.stringify(backups));
        return backupKey;
    }

    getSettingsBackups() {
        try {
            return JSON.parse(localStorage.getItem('settings_backups') || '{}');
        } catch {
            return {};
        }
    }

    restoreSettings(backupKey) {
        const backups = this.getSettingsBackups();
        const backup = backups[backupKey];

        if (backup) {
            // Apply settings
            this.apiProvider = backup.apiProvider;
            this.apiKey = backup.apiKey;
            this.znapaiKey = backup.znapaiKey;
            this.strategy = backup.strategy;
            this.selectedModel = backup.model;
            this.collaborativeModels = backup.collaborativeModels || [];
            this.taskType = backup.taskType;
            this.temperature = backup.temperature;
            this.maxTokens = backup.maxTokens;

            // Update UI
            this.updateSettingsUI();
            this.showToast('Settings restored successfully!', 'success');
            return true;
        }
        return false;
    }

    /**
     * Initialize task workflows for different types of work
     */
    initializeTaskWorkflows() {
        return {
            'data-analysis': {
                name: 'Data Analysis',
                steps: [
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'Data Analysis Specialist',
                        task: 'Initial data exploration and pattern identification',
                        prompt: 'Analyze the provided data, identify patterns, trends, and key insights. Focus on statistical analysis and data quality assessment.',
                        weight: 0.4
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Insight Generator',
                        task: 'Generate actionable insights and recommendations',
                        prompt: 'Based on the data analysis, generate actionable business insights, recommendations, and strategic implications.',
                        weight: 0.35
                    },
                    {
                        model: 'google/gemini-pro-1.5',
                        role: 'Data Storyteller',
                        task: 'Create comprehensive data narrative',
                        prompt: 'Transform the analysis and insights into a compelling data story with clear visualizations and executive summary.',
                        weight: 0.25
                    }
                ]
            },
            'creative-project': {
                name: 'Creative Project',
                steps: [
                    {
                        model: 'google/gemini-pro-1.5',
                        role: 'Creative Director',
                        task: 'Concept development and ideation',
                        prompt: 'Develop creative concepts, themes, and innovative approaches for the project. Focus on originality and artistic vision.',
                        weight: 0.4
                    },
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'Content Architect',
                        task: 'Structure and organize creative content',
                        prompt: 'Take the creative concepts and structure them into a coherent, engaging format with clear narrative flow.',
                        weight: 0.35
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Content Creator',
                        task: 'Generate polished creative content',
                        prompt: 'Create the final creative content, ensuring high quality, style consistency, and engaging presentation.',
                        weight: 0.25
                    }
                ]
            },
            'technical-development': {
                name: 'Technical Development',
                steps: [
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'System Architect',
                        task: 'Technical architecture and design',
                        prompt: 'Analyze requirements and design optimal technical architecture, considering scalability, security, and best practices.',
                        weight: 0.35
                    },
                    {
                        model: 'meta-llama/llama-3.1-8b-instruct',
                        role: 'Code Generator',
                        task: 'Implementation and coding',
                        prompt: 'Generate clean, efficient code based on the technical specifications and architecture.',
                        weight: 0.4
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Code Reviewer',
                        task: 'Code review and optimization',
                        prompt: 'Review the generated code for quality, security, performance, and provide optimization recommendations.',
                        weight: 0.25
                    }
                ]
            },
            'research-project': {
                name: 'Research Project',
                steps: [
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'Research Lead',
                        task: 'Research methodology and literature review',
                        prompt: 'Define research methodology, conduct comprehensive literature review, and establish research framework.',
                        weight: 0.35
                    },
                    {
                        model: 'qwen/qwen-2.5-72b-instruct',
                        role: 'Data Processor',
                        task: 'Data collection and analysis',
                        prompt: 'Collect relevant data, perform analysis, and extract meaningful patterns and findings.',
                        weight: 0.35
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Research Writer',
                        task: 'Comprehensive research synthesis',
                        prompt: 'Synthesize all research findings into a comprehensive report with clear conclusions and future directions.',
                        weight: 0.3
                    }
                ]
            },
            'code-review': {
                name: 'Code Review',
                steps: [
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'Security Analyst',
                        task: 'Security and vulnerability assessment',
                        prompt: 'Review the code for security vulnerabilities, potential exploits, and compliance with security best practices.',
                        weight: 0.3
                    },
                    {
                        model: 'meta-llama/llama-3.1-70b-instruct',
                        role: 'Performance Engineer',
                        task: 'Performance and efficiency analysis',
                        prompt: 'Analyze code performance, identify bottlenecks, optimization opportunities, and scalability issues.',
                        weight: 0.35
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Code Quality Reviewer',
                        task: 'Code quality and best practices review',
                        prompt: 'Review code quality, adherence to coding standards, maintainability, and provide improvement suggestions.',
                        weight: 0.35
                    }
                ]
            },
            'problem-solving': {
                name: 'Complex Problem Solving',
                steps: [
                    {
                        model: 'anthropic/claude-3.5-sonnet',
                        role: 'Problem Analyzer',
                        task: 'Problem decomposition and analysis',
                        prompt: 'Break down the complex problem into manageable components, identify root causes, and analyze constraints.',
                        weight: 0.4
                    },
                    {
                        model: 'openai/gpt-4o',
                        role: 'Solution Designer',
                        task: 'Generate solution approaches',
                        prompt: 'Design multiple solution approaches, evaluate trade-offs, and recommend the optimal strategy.',
                        weight: 0.35
                    },
                    {
                        model: 'google/gemini-pro-1.5',
                        role: 'Implementation Planner',
                        task: 'Implementation roadmap and risk assessment',
                        prompt: 'Create detailed implementation plan, identify potential risks, and provide mitigation strategies.',
                        weight: 0.25
                    }
                ]
            }
        };
    }

    /**
     * Initialize ZnapAI models
     */
    initializeZnapAIModels() {
        return {
            'reasoning': {
                name: 'Reasoning Models',
                models: [
                    { id: 'o1', name: 'o1', provider: 'znapai', category: 'reasoning' },
                    { id: 'o3', name: 'o3', provider: 'znapai', category: 'reasoning' },
                    { id: 'o1-mini', name: 'o1-mini', provider: 'znapai', category: 'reasoning' },
                    { id: 'o3-mini', name: 'o3-mini', provider: 'znapai', category: 'reasoning' },
                    { id: 'o4-mini', name: 'o4-mini', provider: 'znapai', category: 'reasoning' }
                ]
            },
            'flagship': {
                name: 'Flagship Chat Models',
                models: [
                    { id: 'gpt-4o', name: 'gpt-4o', provider: 'znapai', category: 'flagship' },
                    { id: 'gpt-4.1', name: 'gpt-4.1', provider: 'znapai', category: 'flagship' }
                ]
            },
            'cost-optimized': {
                name: 'Cost-Optimized Models',
                models: [
                    { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'znapai', category: 'cost-optimized' },
                    { id: 'gpt-4.1-mini', name: 'gpt-4.1-mini', provider: 'znapai', category: 'cost-optimized' }
                ]
            }
        };
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsForm = document.getElementById('settingsForm');
        this.apiProviderSelect = document.getElementById('apiProvider');
        this.openrouterGroup = document.getElementById('openrouterGroup');
        this.znapaiGroup = document.getElementById('znapaiGroup');
        this.apiKeyInput = document.getElementById('apiKey');
        this.znapaiKeyInput = document.getElementById('znapaiKey');
        this.modelStrategySelect = document.getElementById('modelStrategy');
        this.modelSelect = document.getElementById('modelSelect');
        this.collaborativeGroup = document.getElementById('collaborativeGroup');
        this.workflowGroup = document.getElementById('workflowGroup');
        this.singleModelGroup = document.getElementById('singleModelGroup');
        this.taskTypeSelect = document.getElementById('taskType');
        this.workflowPreview = document.getElementById('workflowPreview');
        this.temperatureSlider = document.getElementById('temperature');
        this.maxTokensSlider = document.getElementById('maxTokens');
        this.tempValue = document.getElementById('tempValue');
        this.tokensValue = document.getElementById('tokensValue');
        this.saveSettingsBtn = document.getElementById('saveSettings');

        // Collaborative AI elements
        this.modelSearch = document.getElementById('modelSearch');
        this.refreshModelsBtn = document.getElementById('refreshModelsBtn');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.selectedCount = document.getElementById('selectedCount');
        this.modelList = document.getElementById('modelList');

        // Chat elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.currentModelSpan = document.getElementById('currentModel');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.charCount = document.getElementById('charCount');
        this.status = document.getElementById('status');
        this.welcomeMessage = document.getElementById('welcomeMessage');

        // Other elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');

        // NEW: Initialize advanced features
        this.initializeLazyLoading();
        this.initializeWorker();
        this.initializeTouchGestures();
        this.initializeOfflineSupport();
    }

    /**
     * Clear chat messages
     */
    clearChat() {
        this.chatMessages.innerHTML = '';
        this.chatHistory = [];

        if (this.chatStorage.currentSessionId) {
            this.createNewSession();
        }

        this.showToast('Chat cleared', 'success');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Settings panel toggle
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());

        // API provider change handler
        this.apiProviderSelect.addEventListener('change', (e) => {
            this.handleProviderChange(e.target.value);
        });

        // Strategy change handler
        this.modelStrategySelect.addEventListener('change', (e) => {
            this.handleStrategyChange(e.target.value);
        });

        // Task type change handler
        this.taskTypeSelect.addEventListener('change', (e) => {
            this.handleTaskTypeChange(e.target.value);
        });

        // Collaborative AI handlers
        if (this.modelSearch) {
            this.modelSearch.addEventListener('input', (e) => {
                this.filterModels(e.target.value);
            });
        }

        if (this.selectAllBtn) {
            this.selectAllBtn.addEventListener('click', () => {
                this.selectAllModels();
            });
        }

        if (this.clearAllBtn) {
            this.clearAllBtn.addEventListener('click', () => {
                this.clearAllModels();
            });
        }

        // Add refresh button handler
        if (this.refreshModelsBtn) {
            this.refreshModelsBtn.addEventListener('click', () => {
                this.loadCollaborativeModels(true); // Force refresh
            });
        }

        // Settings sliders with real-time feedback
        this.temperatureSlider.addEventListener('input', (e) => {
            this.tempValue.textContent = e.target.value;
            this.updateSliderAppearance(e.target);
        });

        this.maxTokensSlider.addEventListener('input', (e) => {
            this.tokensValue.textContent = e.target.value;
            this.updateSliderAppearance(e.target);
        });

        // Form submission
        this.settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Chat input with enhanced UX
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoResizeInput();
            this.toggleSendButton();
        });

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Enhanced send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Focus management for accessibility
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.classList.add('focused');
        });

        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.classList.remove('focused');
        });

        // Auto-resize on window resize
        window.addEventListener('resize', () => {
            this.autoResizeInput();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.settingsPanel.classList.remove('show');
            }
        });

        // Visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseNonEssentialOperations();
            } else {
                this.resumeNonEssentialOperations();
            }
        });
    }

    /**
     * Handle strategy selection change
     */
    handleStrategyChange(strategy) {
        this.strategy = strategy;

        // Hide all strategy-specific groups
        this.singleModelGroup.style.display = 'none';
        this.collaborativeGroup.style.display = 'none';
        this.workflowGroup.style.display = 'none';

        // Show appropriate group based on strategy
        switch (strategy) {
            case 'single':
                this.singleModelGroup.style.display = 'block';
                // Load models for single model selection if not already loaded
                if (this.apiProvider === 'openrouter' && this.apiKey) {
                    this.loadModels();
                } else if (this.apiProvider === 'znapai' && this.znapaiKey) {
                    this.loadZnapAIModels();
                }
                break;
            case 'collaborative':
                this.collaborativeGroup.style.display = 'block';
                this.loadCollaborativeModels();
                break;
            case 'workflow':
                this.workflowGroup.style.display = 'block';
                this.updateWorkflowPreview();
                break;
        }
    }

    /**
     * Handle task type change
     */
    handleTaskTypeChange(taskType) {
        this.taskType = taskType;
        this.updateWorkflowPreview();
    }

    /**
     * Update workflow preview based on task type
     */
    updateWorkflowPreview() {
        const workflow = this.taskWorkflows[this.taskType];
        if (!workflow) return;

        let previewHTML = '<h5>Workflow Preview:</h5>';
        workflow.steps.forEach((step, index) => {
            previewHTML += `
                <div class="workflow-step">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-model">${this.getModelDisplayName(step.model)}</span>
                    <span class="step-task">${step.task}</span>
                </div>
            `;
        });

        this.workflowPreview.innerHTML = previewHTML;
    }

    /**
     * Get model display name from model ID
     */
    getModelDisplayName(modelId) {
        const displayNames = {
            // OpenRouter models
            'openai/gpt-4o': 'GPT-4o',
            'openai/gpt-4o-mini': 'GPT-4o Mini',
            'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
            'anthropic/claude-3-haiku': 'Claude 3 Haiku',
            'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
            'meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B',
            'google/gemini-pro-1.5': 'Gemini Pro 1.5',
            'mistralai/mixtral-8x7b-instruct': 'Mixtral 8x7B',
            'qwen/qwen-2.5-72b-instruct': 'Qwen 2.5 72B',
            // ZnapAI models
            'o1': 'o1 (Reasoning)',
            'o3': 'o3 (Reasoning)',
            'o1-mini': 'o1-mini (Reasoning)',
            'o3-mini': 'o3-mini (Reasoning)',
            'o4-mini': 'o4-mini (Reasoning)',
            'gpt-4o': 'GPT-4o (Flagship)',
            'gpt-4.1': 'GPT-4.1 (Flagship)',
            'gpt-4o-mini': 'GPT-4o-mini (Cost-Optimized)',
            'gpt-4.1-mini': 'GPT-4.1-mini (Cost-Optimized)'
        };

        return displayNames[modelId] || modelId.split('/').pop();
    }

    /**
     * Initialize the application
     */
    async initializeApp() {
        this.showToast('Initializing Advanced Multi-Model AI...', 'info');

        // Load saved settings
        this.loadSettings();

        // Initialize UI state
        this.updateSliderAppearance(this.temperatureSlider);
        this.updateSliderAppearance(this.maxTokensSlider);

        // Try to load models if API key exists
        if (this.apiProvider === 'openrouter' && this.apiKey) {
            await this.loadModels();
        } else if (this.apiProvider === 'znapai' && this.znapaiKey) {
            this.loadZnapAIModels();
        }

        // Hide loading toast
        setTimeout(() => {
            this.hideToast();
        }, 1000);

        this.showToast('Ready for advanced AI collaboration!', 'success');
    }

    /**
     * Handle API provider change
     */
    handleProviderChange(provider) {
        this.apiProvider = provider;

        // Show/hide appropriate API key fields
        if (provider === 'openrouter') {
            this.openrouterGroup.style.display = 'block';
            this.znapaiGroup.style.display = 'none';
        } else if (provider === 'znapai') {
            this.openrouterGroup.style.display = 'none';
            this.znapaiGroup.style.display = 'block';
        }

        // Clear existing models and load new ones
        this.modelSelect.innerHTML = '<option value="">Select a model...</option>';
        if (this.strategy === 'collaborative') {
            this.loadCollaborativeModels(true);
        }

        // Clear existing model selections to prevent confusion
        this.selectedModel = '';
        this.collaborativeModels = [];

        // Load models for the selected provider if API key exists
        if (provider === 'openrouter' && this.apiKey) {
            this.loadModels();
        } else if (provider === 'znapai' && this.znapaiKey) {
            this.loadZnapAIModels();
        }

        // Reset settings saved state when switching providers
        this.settingsSaved = false;
        this.toggleSendButton();
    }

    /**
     * Enhanced slider appearance
     */
    updateSliderAppearance(slider) {
        const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, #007aff 0%, #007aff ${value}%, rgba(255, 255, 255, 0.1) ${value}%, rgba(255, 255, 255, 0.1) 100%)`;
    }

    /**
     * Load available models from OpenRouter
     */
    async loadModels() {
        try {
            this.showToast('Loading OpenRouter models...', 'info');

            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Advanced Multi-Model AI'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.populateModelSelect(data.data);
            this.hideToast();
            this.showToast('OpenRouter models loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading models:', error);
            this.showToast('Failed to load models. Using default models.', 'warning');
            this.populateModelSelectWithDefaults();
        }
    }

    /**
     * Load ZnapAI models
     */
    loadZnapAIModels() {
        try {
            this.showToast('Loading ZnapAI models...', 'info');

            // ZnapAI models are predefined, so we can load them directly
            const allModels = [];
            Object.values(this.znapaiModels).forEach(category => {
                allModels.push(...category.models);
            });

            this.populateModelSelect(allModels);
            this.hideToast();
            this.showToast('ZnapAI models loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading ZnapAI models:', error);
            this.showToast('Failed to load ZnapAI models.', 'warning');
        }
    }

    /**
     * Populate model selection dropdown
     */
    populateModelSelect(models) {
        this.modelSelect.innerHTML = '<option value="">Select a model...</option>';

        // Group models by provider
        const modelGroups = {};
        models.forEach(model => {
            const provider = model.id.split('/')[0] || 'other';
            if (!modelGroups[provider]) {
                modelGroups[provider] = [];
            }
            modelGroups[provider].push(model);
        });

        // Define preferred order for providers
        const providerOrder = ['openai', 'anthropic', 'meta-llama', 'google', 'mistralai', 'qwen', '01-ai'];

        // Add models in preferred order
        providerOrder.forEach(provider => {
            if (modelGroups[provider]) {
                this.addModelGroup(provider, modelGroups[provider]);
                delete modelGroups[provider];
            }
        });

        // Add remaining models
        Object.keys(modelGroups).forEach(provider => {
            this.addModelGroup(provider, modelGroups[provider]);
        });
    }

    /**
     * Add a group of models to the dropdown
     */
    addModelGroup(provider, models) {
        const groupName = provider
            .replace('-', ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const group = document.createElement('optgroup');
        group.label = groupName;

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = `${model.name || model.id} ${this.getModelPricing(model)}`;
            option.setAttribute('data-provider', provider);
            group.appendChild(option);
        });

        this.modelSelect.appendChild(group);
    }

    /**
     * Get model pricing information
     */
    getModelPricing(model) {
        if (model.pricing && model.pricing.prompt) {
            const price = parseFloat(model.pricing.prompt);
            if (price < 0.001) {
                return '(Free)';
            } else if (price < 0.01) {
                return '(Low cost)';
            } else {
                return '(Paid)';
            }
        }
        return '';
    }

    /**
     * Populate with default models as fallback
     */
    populateModelSelectWithDefaults() {
        const defaultModels = [
            { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai', category: 'flagship' },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', category: 'efficient' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', category: 'reasoning' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic', category: 'fast' },
            { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'meta-llama', category: 'open-source' },
            { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'meta-llama', category: 'lightweight' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'google', category: 'advanced' },
            { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'mistralai', category: 'balanced' },
            { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'qwen', category: 'multilingual' }
        ];

        this.modelSelect.innerHTML = '<option value="">Select a model...</option>';

        const grouped = {};
        defaultModels.forEach(model => {
            if (!grouped[model.provider]) {
                grouped[model.provider] = [];
            }
            grouped[model.provider].push(model);
        });

        Object.keys(grouped).forEach(provider => {
            this.addModelGroup(provider, grouped[provider]);
        });
    }

    /**
     * Get selected collaborative models
     */
    getSelectedCollaborativeModels() {
        const checkboxes = this.collaborativeGroup.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Toggle settings panel
     */
    toggleSettings() {
        this.settingsPanel.classList.toggle('show');

        if (this.settingsPanel.classList.contains('show')) {
            setTimeout(() => {
                this.apiKeyInput.focus();
            }, 300);
        }
    }

    /**
     * Update character count with smooth animation
     */
    updateCharCount() {
        const count = this.messageInput.value.length;
        const maxLength = 4000; // Reasonable limit
        const percentage = (count / maxLength) * 100;

        this.charCount.textContent = `${count} characters`;
        this.charCount.style.color = percentage > 90 ? '#ff3b30' : percentage > 70 ? '#ff9500' : 'rgba(255, 255, 255, 0.6)';
    }

    /**
     * Auto-resize textarea with smooth animation
     */
    autoResizeInput() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 160);
        textarea.style.height = `${Math.max(56, newHeight)}px`;
    }

    /**
     * Toggle send button state
     */
    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        const hasSettings = this.settingsSaved;
        this.sendBtn.disabled = !hasText || !hasSettings || this.isLoading;
    }

    /**
     * Save settings with validation for all strategies
     */
    saveSettings() {
        this.apiProvider = this.apiProviderSelect.value;
        this.apiKey = this.apiKeyInput.value.trim();
        this.znapaiKey = this.znapaiKeyInput.value.trim();
        this.selectedModel = this.modelSelect.value;
        this.temperature = parseFloat(this.temperatureSlider.value);
        this.maxTokens = parseInt(this.maxTokensSlider.value);

        // Enhanced validation
        if (this.apiProvider === 'openrouter') {
            if (!this.apiKey) {
                this.showToast('Please enter your OpenRouter API key', 'error');
                this.apiKeyInput.focus();
                return;
            }

            if (!this.apiKey.startsWith('sk-')) {
                this.showToast('Please enter a valid OpenRouter API key format (sk-...)', 'error');
                this.apiKeyInput.focus();
                return;
            }
        } else if (this.apiProvider === 'znapai') {
            if (!this.znapaiKey) {
                this.showToast('Please enter your ZnapAI API key', 'error');
                this.znapaiKeyInput.focus();
                return;
            }

            // ZnapAI keys typically don't have a strict prefix format, so we'll be more flexible
            if (this.znapaiKey.length < 10) {
                this.showToast('Please enter a valid ZnapAI API key', 'error');
                this.znapaiKeyInput.focus();
                return;
            }
        } else {
            this.showToast('Please select an API provider', 'error');
            this.apiProviderSelect.focus();
            return;
        }

        // Strategy-specific validation
        switch (this.strategy) {
            case 'single':
                if (!this.selectedModel) {
                    this.showToast('Please select an AI model', 'error');
                    this.modelSelect.focus();
                    return;
                }
                break;
            case 'collaborative':
                this.collaborativeModels = this.getSelectedCollaborativeModels();
                if (this.collaborativeModels.length < 2) {
                    this.showToast('Please select at least 2 models for collaboration', 'error');
                    return;
                }
                break;
            case 'workflow':
                if (!this.taskType) {
                    this.showToast('Please select a task type', 'error');
                    this.taskTypeSelect.focus();
                    return;
                }
                break;
        }

        // Save to localStorage
        const settings = {
            apiProvider: this.apiProvider,
            apiKey: this.apiKey,
            znapaiKey: this.znapaiKey,
            strategy: this.strategy,
            model: this.selectedModel,
            collaborativeModels: this.collaborativeModels,
            taskType: this.taskType,
            temperature: this.temperature,
            maxTokens: this.maxTokens,
            timestamp: Date.now()
        };

        localStorage.setItem('advancedMultiModelAI_settings', JSON.stringify(settings));

        // NEW: Create backup of settings
        this.backupSettings();

        // Update UI
        this.updateModelDisplay();
        this.settingsSaved = true;
        this.toggleSendButton();
        this.showToast('Settings saved successfully!', 'success');
        this.settingsPanel.classList.remove('show');

        // Clear welcome message and enable chat
        this.clearWelcomeMessage();
    }

    /**
     * NEW: Update settings UI from stored values
     */
    updateSettingsUI() {
        this.apiProviderSelect.value = this.apiProvider;
        this.apiKeyInput.value = this.apiKey;
        this.znapaiKeyInput.value = this.znapaiKey;
        this.modelStrategySelect.value = this.strategy;
        this.modelSelect.value = this.selectedModel;
        this.taskTypeSelect.value = this.taskType;
        this.temperatureSlider.value = this.temperature;
        this.maxTokensSlider.value = this.maxTokens;
        this.tempValue.textContent = this.temperature;
        this.tokensValue.textContent = this.maxTokens;

        // Handle provider-specific UI
        this.handleProviderChange(this.apiProvider);
        this.handleStrategyChange(this.strategy);

        if (this.strategy === 'collaborative') {
            this.collaborativeModels.forEach(modelId => {
                const checkbox = this.collaborativeGroup.querySelector(`input[value="${modelId}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        this.updateSliderAppearance(this.temperatureSlider);
        this.updateSliderAppearance(this.maxTokensSlider);
    }

    /**
     * Update model display based on strategy
     */
    updateModelDisplay() {
        let displayText = '';

        switch (this.strategy) {
            case 'single':
                displayText = this.selectedModel || 'No model selected';
                break;
            case 'collaborative':
                displayText = `${this.collaborativeModels.length} Models Working Together`;
                break;
            case 'workflow':
                const workflow = this.taskWorkflows[this.taskType];
                displayText = workflow ? `${workflow.name} Workflow` : 'No workflow selected';
                break;
        }

        this.currentModelSpan.textContent = displayText;
    }

    /**
     * Load saved settings
     */
    loadSettings() {
        const saved = localStorage.getItem('advancedMultiModelAI_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.apiProviderSelect.value = settings.apiProvider || 'openrouter';
                this.apiKeyInput.value = settings.apiKey || '';
                this.znapaiKeyInput.value = settings.znapaiKey || '';
                this.modelStrategySelect.value = settings.strategy || 'single';
                this.temperatureSlider.value = settings.temperature || 0.7;
                this.maxTokensSlider.value = settings.maxTokens || 1000;
                this.tempValue.textContent = this.temperatureSlider.value;
                this.tokensValue.textContent = this.maxTokensSlider.value;
                this.updateSliderAppearance(this.temperatureSlider);
                this.updateSliderAppearance(this.maxTokensSlider);

                // Handle provider-specific UI
                this.handleProviderChange(this.apiProviderSelect.value);

                // Check if settings are recent (within 30 days)
                const isRecent = Date.now() - (settings.timestamp || 0) < 30 * 24 * 60 * 60 * 1000;

                // Load API key based on provider
                if (settings.apiProvider === 'openrouter' && settings.apiKey && isRecent) {
                    this.apiKey = settings.apiKey;
                    this.loadModels();
                } else if (settings.apiProvider === 'znapai' && settings.znapaiKey && isRecent) {
                    this.znapaiKey = settings.znapaiKey;
                    this.loadZnapAIModels();
                }

                if ((settings.apiProvider === 'openrouter' && settings.apiKey) ||
                    (settings.apiProvider === 'znapai' && settings.znapaiKey)) {
                    this.apiProvider = settings.apiProvider;
                    this.strategy = settings.strategy;
                    this.selectedModel = settings.model || '';
                    this.collaborativeModels = settings.collaborativeModels || [];
                    this.taskType = settings.taskType || 'analysis';
                    this.temperature = settings.temperature;
                    this.maxTokens = settings.maxTokens;
                    this.settingsSaved = true;

                    // Handle strategy-specific UI
                    this.handleStrategyChange(this.strategy);

                    if (this.strategy === 'collaborative') {
                        // Restore collaborative model selections
                        this.collaborativeModels.forEach(modelId => {
                            const checkbox = this.collaborativeGroup.querySelector(`input[value="${modelId}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }

                    if (this.strategy === 'workflow') {
                        this.taskTypeSelect.value = this.taskType;
                        this.updateWorkflowPreview();
                    }

                    this.updateModelDisplay();
                    this.toggleSendButton();
                    this.clearWelcomeMessage();
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                localStorage.removeItem('advancedMultiModelAI_settings');
            }
        }
    }

    /**
     * Clear welcome message with animation
     */
    clearWelcomeMessage() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.opacity = '0';
            this.welcomeMessage.style.transform = 'translateY(20px)';
            setTimeout(() => {
                this.welcomeMessage.remove();
            }, 300);
        }
    }

    /**
     * Send message with multi-model coordination
     */
    async sendMessage() {
        if (this.isLoading || !this.settingsSaved) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);

        // NEW: Save message to session
        this.saveMessageToSession('user', message);

        // Clear input
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeInput();
        this.toggleSendButton();

        // Show loading
        this.setLoading(true);

        try {
            let response = '';

            // NEW: Use streaming if enabled and supported
            if (this.streamingConfig.enabled && !this.isOffline) {
                // Disable loading overlay for streaming - user sees real-time output
                this.setLoading(false);
                response = await this.sendStreamingMessage(message);
            } else {
                // Route to appropriate processing method based on strategy
                switch (this.strategy) {
                    case 'single':
                        response = await this.processSingleModel(message);
                        break;
                    case 'collaborative':
                        response = await this.processCollaborative(message);
                        break;
                    case 'workflow':
                        response = await this.processWorkflow(message);
                        break;
                }

                // Add assistant response to chat (for non-streaming)
                this.addMessage('assistant', response);
                this.saveMessageToSession('assistant', response);
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // NEW: Enhanced error logging
            this.logError(error, {
                strategy: this.strategy,
                message: message.substring(0, 100),
                model: this.selectedModel || this.collaborativeModels.join(',')
            });

            let errorMessage = 'Sorry, I encountered an error.';

            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Invalid API key. Please check your settings.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded. Please wait and try again.';
            } else if (error.message.includes('insufficient_quota')) {
                errorMessage = 'Insufficient credits. Please check your OpenRouter account.';
            } else if (this.isOffline) {
                errorMessage = 'You are offline. Please check your connection.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }

            this.showToast(errorMessage, 'error');
            this.addMessage('assistant', `I apologize, but I encountered an error: ${errorMessage}`);
        } finally {
            // Only hide loading overlay if not using streaming
            if (!(this.streamingConfig.enabled && !this.isOffline)) {
                this.setLoading(false);
            }
        }
    }

    /**
     * NEW: Send streaming message
     */
    async sendStreamingMessage(message) {
        let fullContent = '';
        const streamDisplay = this.displayStreamingResponse();

        const messages = this.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Check cache first
        const cacheKey = this.getCacheKey(this.selectedModel, messages, this.temperature, this.maxTokens);
        const cachedResponse = this.getCachedResponse(cacheKey);

        if (cachedResponse) {
            // Stream cached response
            const words = cachedResponse.split(' ');
            for (let i = 0; i < words.length; i++) {
                fullContent += (i > 0 ? ' ' : '') + words[i];
                streamDisplay.updateContent(fullContent);
                await new Promise(resolve => setTimeout(resolve, 30));
            }
            streamDisplay.complete(fullContent);
            return fullContent;
        }

        // Route to appropriate processing method based on strategy
        let content = '';
        switch (this.strategy) {
            case 'single':
                content = await this.streamSingleModel(message, streamDisplay);
                break;
            case 'collaborative':
                content = await this.streamCollaborative(message, streamDisplay);
                break;
            case 'workflow':
                content = await this.streamWorkflow(message, streamDisplay);
                break;
        }

        streamDisplay.complete(content);
        return content;
    }

    /**
     * NEW: Stream single model response
     */
    async streamSingleModel(message, streamDisplay) {
        const messages = this.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(this.selectedModel, messages))
        );

        const content = response.choices[0].message.content;
        const cacheKey = this.getCacheKey(this.selectedModel, messages, this.temperature, this.maxTokens);

        // Cache the response
        this.setCachedResponse(cacheKey, content);

        // Stream the content
        const words = content.split(' ');
        let streamedContent = '';

        for (let i = 0; i < words.length; i++) {
            streamedContent += (i > 0 ? ' ' : '') + words[i];
            streamDisplay.updateContent(streamedContent);
            await new Promise(resolve => setTimeout(resolve, this.streamingConfig.streamDelay));
        }

        return content;
    }

    /**
     * NEW: Stream collaborative response
     */
    async streamCollaborative(message, streamDisplay) {
        // For collaborative mode, we still process sequentially but stream the final synthesis
        const systemPrompt = `You are part of a collaborative AI team using ${this.apiProvider === 'openrouter' ? 'OpenRouter' : 'ZnapAI'}. Each model will contribute their expertise. Build upon each other's responses and provide a comprehensive final answer. Current team members: ${this.collaborativeModels.map(id => this.getModelDisplayName(id)).join(', ')}`;

        let accumulatedContext = message;
        const responses = [];

        // Process each model (not streamed for performance)
        for (const modelId of this.collaborativeModels) {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Previous team member responses:\n${responses.join('\n\n---\n\n')}\n\nYour task: ${accumulatedContext}` }
            ];

            try {
                const response = await this.queueRequest(() =>
                    this.retryWithBackoff(() => this.callAPI(modelId, messages))
                );
                const content = response.choices[0].message.content;
                responses.push(`**${this.getModelDisplayName(modelId)}:** ${content}`);
                accumulatedContext = `${message}\n\nTeam Discussion So Far:\n${responses.join('\n\n')}`;
            } catch (error) {
                this.logError(error, { modelId, step: 'collaborative_processing' });
                responses.push(`**${this.getModelDisplayName(modelId)}:** [Error processing]`);
            }
        }

        // Stream the final synthesis
        const finalMessages = [
            { role: 'system', content: 'You are the final synthesizer. Consolidate the team discussion into a cohesive, comprehensive response that incorporates all insights.' },
            { role: 'user', content: `Finalize this collaborative response:\n\n${responses.join('\n\n---\n\n')}` }
        ];

        const finalResponse = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(this.collaborativeModels[0], finalMessages))
        );

        const finalContent = finalResponse.choices[0].message.content;

        // Stream the final content
        const words = finalContent.split(' ');
        let streamedContent = '';

        for (let i = 0; i < words.length; i++) {
            streamedContent += (i > 0 ? ' ' : '') + words[i];
            streamDisplay.updateContent(streamedContent);
            await new Promise(resolve => setTimeout(resolve, this.streamingConfig.streamDelay));
        }

        return finalContent;
    }

    /**
     * NEW: Stream workflow response
     */
    async streamWorkflow(message, streamDisplay) {
        const workflow = this.taskWorkflows[this.taskType];
        if (!workflow) {
            throw new Error(`Unknown task type: ${this.taskType}`);
        }

        const stepResults = [];

        // Process workflow steps (not streamed for performance)
        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const stepPrompt = `${step.prompt}\n\nContext from previous steps:\n${stepResults.join('\n\n')}\n\nCurrent task: ${message}`;

            const messages = [
                { role: 'system', content: `You are the ${step.role}. Your responsibility: ${step.task}` },
                { role: 'user', content: stepPrompt }
            ];

            try {
                const response = await this.queueRequest(() =>
                    this.retryWithBackoff(() => this.callAPI(step.model, messages))
                );
                const content = response.choices[0].message.content;
                stepResults.push(`**Step ${i + 1} - ${step.role}:**\n${content}`);
            } catch (error) {
                this.logError(error, { step: i + 1, role: step.role, model: step.model });
                stepResults.push(`**Step ${i + 1} - ${step.role}:** [Error]`);
            }
        }

        // Stream final synthesis
        const finalSynthesisPrompt = `Synthesize all step results into a comprehensive final output:\n\n${stepResults.join('\n\n')}\n\nProvide a cohesive summary that integrates all insights and recommendations.`;

        const finalMessages = [
            { role: 'system', content: 'You are the final synthesizer. Create a cohesive, well-structured final output that integrates all workflow steps.' },
            { role: 'user', content: finalSynthesisPrompt }
        ];

        const finalResponse = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(workflow.steps[0].model, finalMessages))
        );

        const finalContent = finalResponse.choices[0].message.content;

        // Stream the final content
        const words = finalContent.split(' ');
        let streamedContent = '';

        for (let i = 0; i < words.length; i++) {
            streamedContent += (i > 0 ? ' ' : '') + words[i];
            streamDisplay.updateContent(streamedContent);
            await new Promise(resolve => setTimeout(resolve, this.streamingConfig.streamDelay));
        }

        return finalContent;
    }

    /**
     * Process message with single model
     */
    async processSingleModel(message) {
        const messages = this.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // NEW: Check cache first
        const cacheKey = this.getCacheKey(this.selectedModel, messages, this.temperature, this.maxTokens);
        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse) {
            this.showToast('Response served from cache', 'info', 2000);
            return cachedResponse;
        }

        // NEW: Use queue and retry for API calls
        const response = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(this.selectedModel, messages))
        );

        const content = response.choices[0].message.content;

        // NEW: Cache the response
        this.setCachedResponse(cacheKey, content);

        return content;
    }

    /**
     * Process message with collaborative models
     */
    async processCollaborative(message) {
        // Add a system message to guide collaboration
        const systemPrompt = `You are part of a collaborative AI team using ${this.apiProvider === 'openrouter' ? 'OpenRouter' : 'ZnapAI'}. Each model will contribute their expertise. Build upon each other's responses and provide a comprehensive final answer. Current team members: ${this.collaborativeModels.map(id => this.getModelDisplayName(id)).join(', ')}`;

        let accumulatedContext = message;
        const responses = [];

        // Sequential processing with context building
        for (const modelId of this.collaborativeModels) {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Previous team member responses:\n${responses.join('\n\n---\n\n')}\n\nYour task: ${accumulatedContext}` }
            ];

            // NEW: Check cache for each model response
            const cacheKey = this.getCacheKey(modelId, messages, this.temperature, this.maxTokens);
            let content;

            try {
                const cachedResponse = this.getCachedResponse(cacheKey);
                if (cachedResponse) {
                    content = cachedResponse;
                    this.showToast(`Response from ${this.getModelDisplayName(modelId)} served from cache`, 'info', 1500);
                } else {
                    const response = await this.queueRequest(() =>
                        this.retryWithBackoff(() => this.callAPI(modelId, messages))
                    );
                    content = response.choices[0].message.content;
                    this.setCachedResponse(cacheKey, content);
                }
            } catch (error) {
                this.logError(error, { modelId, step: 'collaborative_processing' });
                content = `[Error processing with ${this.getModelDisplayName(modelId)}]`;
            }

            responses.push(`**${this.getModelDisplayName(modelId)}:** ${content}`);

            // Build context for next model
            accumulatedContext = `${message}\n\nTeam Discussion So Far:\n${responses.join('\n\n')}`;
        }

        // Final synthesis by the first model
        const finalMessages = [
            { role: 'system', content: 'You are the final synthesizer. Consolidate the team discussion into a cohesive, comprehensive response that incorporates all insights.' },
            { role: 'user', content: `Finalize this collaborative response:\n\n${responses.join('\n\n---\n\n')}` }
        ];

        const finalCacheKey = this.getCacheKey(this.collaborativeModels[0], finalMessages, this.temperature, this.maxTokens);
        const finalCachedResponse = this.getCachedResponse(finalCacheKey);

        if (finalCachedResponse) {
            this.showToast('Final synthesis served from cache', 'info', 2000);
            return finalCachedResponse;
        }

        const finalResponse = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(this.collaborativeModels[0], finalMessages))
        );
        const finalContent = finalResponse.choices[0].message.content;

        this.setCachedResponse(finalCacheKey, finalContent);
        return finalContent;
    }

    /**
     * Process message with task workflow
     */
    async processWorkflow(message) {
        const workflow = this.taskWorkflows[this.taskType];
        if (!workflow) {
            throw new Error(`Unknown task type: ${this.taskType}`);
        }

        let accumulatedContext = message;
        const stepResults = [];

        // Process each step of the workflow
        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const stepPrompt = `${step.prompt}\n\nContext from previous steps:\n${stepResults.join('\n\n')}\n\nCurrent task: ${message}`;

            const messages = [
                { role: 'system', content: `You are the ${step.role}. Your responsibility: ${step.task}` },
                { role: 'user', content: stepPrompt }
            ];

            // NEW: Check cache for workflow step
            const cacheKey = this.getCacheKey(step.model, messages, this.temperature, this.maxTokens);
            let content;

            try {
                const cachedResponse = this.getCachedResponse(cacheKey);
                if (cachedResponse) {
                    content = cachedResponse;
                    this.showToast(`Step ${i + 1} (${step.role}) served from cache`, 'info', 1500);
                } else {
                    const response = await this.queueRequest(() =>
                        this.retryWithBackoff(() => this.callAPI(step.model, messages))
                    );
                    content = response.choices[0].message.content;
                    this.setCachedResponse(cacheKey, content);
                }
            } catch (error) {
                this.logError(error, { step: i + 1, role: step.role, model: step.model });
                content = `[Error in step ${i + 1} - ${step.role}]`;
            }

            stepResults.push(`**Step ${i + 1} - ${step.role}:**\n${content}`);

            // Add step result to context
            accumulatedContext += `\n\nStep ${i + 1} Result:\n${content}`;
        }

        // Final synthesis
        const finalSynthesisPrompt = `Synthesize all step results into a comprehensive final output:\n\n${stepResults.join('\n\n')}\n\nProvide a cohesive summary that integrates all insights and recommendations.`;

        const finalMessages = [
            { role: 'system', content: 'You are the final synthesizer. Create a cohesive, well-structured final output that integrates all workflow steps.' },
            { role: 'user', content: finalSynthesisPrompt }
        ];

        const finalCacheKey = this.getCacheKey(workflow.steps[0].model, finalMessages, this.temperature, this.maxTokens);
        const finalCachedResponse = this.getCachedResponse(finalCacheKey);

        if (finalCachedResponse) {
            this.showToast('Workflow synthesis served from cache', 'info', 2000);
            return finalCachedResponse;
        }

        const finalResponse = await this.queueRequest(() =>
            this.retryWithBackoff(() => this.callAPI(workflow.steps[0].model, finalMessages))
        );
        const finalContent = finalResponse.choices[0].message.content;

        this.setCachedResponse(finalCacheKey, finalContent);
        return finalContent;
    }

    /**
     * Call API for both OpenRouter and ZnapAI
     */
    async callAPI(model, messages) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        let apiUrl, headers, requestBody;

        if (this.apiProvider === 'openrouter') {
            apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            headers = {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Advanced Multi-Model AI'
            };
            requestBody = {
                model: model,
                messages: messages,
                temperature: this.temperature,
                max_tokens: this.maxTokens,
                stream: false
            };
        } else if (this.apiProvider === 'znapai') {
            apiUrl = 'https://api.znapai.com/chat/completions';
            headers = {
                'Authorization': `Bearer ${this.znapaiKey}`,
                'Content-Type': 'application/json'
            };
            requestBody = {
                model: model,
                messages: messages,
                temperature: this.temperature,
                max_tokens: this.maxTokens,
                stream: false
            };
        } else {
            throw new Error('Unsupported API provider');
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Call OpenRouter API (legacy method for backward compatibility)
     */
    async callOpenRouter(model, messages) {
        return this.callAPI(model, messages);
    }

    /**
     * Add message to chat with enhanced formatting
     */
    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.setAttribute('role', 'article');
        messageDiv.setAttribute('aria-label', `${role === 'user' ? 'User' : 'AI'} message`);

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'user' ? '<i class="fas fa-user" aria-hidden="true"></i>' : '<i class="fas fa-robot" aria-hidden="true"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = this.formatMessage(content);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Add to chat history (limit to last 50 messages for performance)
        this.chatHistory.push({ role, content });
        if (this.chatHistory.length > 50) {
            this.chatHistory = this.chatHistory.slice(-50);
        }
    }

    /**
     * Enhanced message formatting with input sanitization
     */
    formatMessage(content) {
        if (!content) return '';

        // NEW: Enhanced input sanitization
        const sanitized = this.sanitizeInput(content);

        // Format markdown-like syntax
        let formatted = sanitized
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Handle code blocks with language detection
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            const escapedCode = code.trim();
            return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
        });

        // Handle links
        formatted = formatted.replace(
            /(https?:\/\/[^\s<]+[^\s<\.)])/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        return formatted;
    }

    /**
     * NEW: Input sanitization for security
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';

        return input
            // Remove null bytes and control characters
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // Normalize Unicode
            .normalize('NFKC')
            // Limit length to prevent abuse
            .substring(0, 10000);
    }

    /**
     * Smooth scroll to bottom
     */
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        this.loadingOverlay.classList.toggle('show', loading);
        this.sendBtn.disabled = loading || !this.messageInput.value.trim() || !this.settingsSaved;
        this.status.textContent = loading ? 'Processing with AI models...' : 'Ready';

        if (loading) {
            this.messageInput.setAttribute('aria-busy', 'true');
        } else {
            this.messageInput.removeAttribute('aria-busy');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 4000) {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;
        this.toast.classList.add('show');

        // Auto-hide after duration
        setTimeout(() => {
            this.hideToast();
        }, duration);
    }

    /**
     * Hide toast notification
     */
    hideToast() {
        this.toast.classList.remove('show');
    }

    /**
     * Pause non-essential operations when tab is hidden
     */
    pauseNonEssentialOperations() {
        console.log('App paused - reducing non-essential operations');
        // Could implement pause for animations, timers, etc.
    }

    /**
     * Resume non-essential operations when tab becomes visible
     */
    resumeNonEssentialOperations() {
        console.log('App resumed - resuming all operations');
        // Could implement resume for animations, timers, etc.
    }

    /**
     * Load collaborative models interface
     * @param {boolean} forceRefresh - Force reload models even if already loaded
     */
    async loadCollaborativeModels(forceRefresh = false) {
        if (!this.modelList) return; // Element doesn't exist

        // Check if already loaded (more than just loading message) unless force refresh
        if (!forceRefresh && this.modelList.children.length > 1 && !this.modelList.querySelector('.loading-models')) {
            return; // Already loaded, don't reload
        }

        // Show loading state
        this.modelList.innerHTML = '<div class="loading-models"><i class="fas fa-spinner fa-spin"></i><span>Loading models...</span></div>';

        // Check for appropriate API key based on provider
        if (this.apiProvider === 'openrouter' && !this.apiKey) {
            this.modelList.innerHTML = '<div class="loading-models"><span>Enter OpenRouter API key to load models</span></div>';
            return;
        } else if (this.apiProvider === 'znapai' && !this.znapaiKey) {
            this.modelList.innerHTML = '<div class="loading-models"><span>Enter ZnapAI API key to load models</span></div>';
            return;
        }

        try {
            if (this.apiProvider === 'openrouter') {
                console.log('Loading collaborative models from OpenRouter...');
                const response = await fetch('https://openrouter.ai/api/v1/models', {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'Advanced Multi-Model AI'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Models loaded:', data.data.length);
                this.populateCollaborativeModelList(data.data);
                this.showToast(`Loaded ${data.data.length} models from OpenRouter`, 'success');
            } else if (this.apiProvider === 'znapai') {
                console.log('Loading collaborative models from ZnapAI...');
                // ZnapAI models are predefined, so we load them directly
                const allModels = [];
                Object.values(this.znapaiModels).forEach(category => {
                    allModels.push(...category.models);
                });
                this.populateCollaborativeModelList(allModels);
                this.showToast(`Loaded ${allModels.length} models from ZnapAI`, 'success');
            }

        } catch (error) {
            console.error('Error loading collaborative models:', error);
            this.logError(error, { context: 'loading_collaborative_models' });
            if (this.apiProvider === 'openrouter') {
                this.modelList.innerHTML = '<div class="loading-models"><span>Failed to load models. Using defaults.</span></div>';
                setTimeout(() => {
                    this.populateCollaborativeModelListWithDefaults();
                }, 1000);
            } else {
                this.modelList.innerHTML = '<div class="loading-models"><span>Failed to load ZnapAI models.</span></div>';
            }
        }
    }

    /**
     * Populate collaborative model list with all available models
     */
    populateCollaborativeModelList(models) {
        if (this.apiProvider === 'znapai') {
            this.populateZnapAICollaborativeList();
            return;
        }

        // Group models by provider for OpenRouter
        const modelGroups = {};
        models.forEach(model => {
            const provider = model.id.split('/')[0] || 'other';
            if (!modelGroups[provider]) {
                modelGroups[provider] = [];
            }
            modelGroups[provider].push(model);
        });

        // Sort providers by preference
        const providerOrder = ['openai', 'anthropic', 'meta-llama', 'google', 'mistralai', 'qwen', '01-ai'];
        const sortedProviders = providerOrder.filter(p => modelGroups[p])
            .concat(Object.keys(modelGroups).filter(p => !providerOrder.includes(p)).sort());

        let html = '';
        sortedProviders.forEach(provider => {
            const groupName = provider
                .replace('-', ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            html += `<div class="model-category">
                <h4>${groupName}</h4>`;

            modelGroups[provider]
                .sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
                .forEach(model => {
                    const modelName = model.name || model.id;
                    const pricing = this.getModelPricing(model);
                    const pricingClass = pricing.includes('Free') ? 'free' : pricing.includes('Paid') ? 'paid' : '';

                    html += `
                        <div class="model-item" data-model-id="${model.id}" data-lazy-load="true">
                            <input type="checkbox" id="model-${model.id.replace(/[^a-zA-Z0-9]/g, '-')}" value="${model.id}">
                            <label for="model-${model.id.replace(/[^a-zA-Z0-9]/g, '-')}" class="model-info">
                                <div class="model-name">${modelName}</div>
                                <div class="model-provider">${provider}</div>
                            </label>
                            ${pricing ? `<div class="model-pricing ${pricingClass}">${pricing}</div>` : ''}
                        </div>`;
                });

            html += '</div>';
        });

        this.modelList.innerHTML = html;

        // NEW: Set up lazy loading for model elements
        if (this.modelObserver) {
            this.modelList.querySelectorAll('[data-lazy-load="true"]').forEach(element => {
                this.modelObserver.observe(element);
            });
        }

        // Add event listeners for checkboxes
        this.modelList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedCount();
                this.updateModelItemAppearance(checkbox);
            });
        });

        this.updateSelectedCount();
    }

    /**
     * Populate collaborative model list specifically for ZnapAI
     */
    populateZnapAICollaborativeList() {
        let html = '';

        Object.entries(this.znapaiModels).forEach(([categoryKey, category]) => {
            html += `<div class="model-category">
                <h4>${category.name}</h4>`;

            category.models.forEach(model => {
                html += `
                    <div class="model-item" data-model-id="${model.id}" data-lazy-load="true">
                        <input type="checkbox" id="model-${model.id}" value="${model.id}">
                        <label for="model-${model.id}" class="model-info">
                            <div class="model-name">${model.name}</div>
                            <div class="model-provider">znapai</div>
                        </label>
                        <div class="model-pricing free">Available</div>
                    </div>`;
            });

            html += '</div>';
        });

        this.modelList.innerHTML = html;

        // NEW: Set up lazy loading for model elements
        if (this.modelObserver) {
            this.modelList.querySelectorAll('[data-lazy-load="true"]').forEach(element => {
                this.modelObserver.observe(element);
            });
        }

        // Add event listeners for checkboxes
        this.modelList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedCount();
                this.updateModelItemAppearance(checkbox);
            });
        });

        this.updateSelectedCount();
    }

    /**
     * Populate collaborative model list with defaults
     */
    populateCollaborativeModelListWithDefaults() {
        const defaultModels = [
            { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
            { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
            { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'meta-llama' },
            { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'meta-llama' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'google' },
            { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'mistralai' },
            { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'qwen' }
        ];

        const grouped = {};
        defaultModels.forEach(model => {
            if (!grouped[model.provider]) {
                grouped[model.provider] = [];
            }
            grouped[model.provider].push(model);
        });

        let html = '';
        Object.keys(grouped).sort().forEach(provider => {
            const groupName = provider
                .replace('-', ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            html += `<div class="model-category">
                <h4>${groupName}</h4>`;

            grouped[provider].forEach(model => {
                html += `
                    <div class="model-item" data-model-id="${model.id}" data-lazy-load="true">
                        <input type="checkbox" id="model-${model.id.replace(/[^a-zA-Z0-9]/g, '-')}" value="${model.id}">
                        <label for="model-${model.id.replace(/[^a-zA-Z0-9]/g, '-')}" class="model-info">
                            <div class="model-name">${model.name}</div>
                            <div class="model-provider">${provider}</div>
                        </label>
                        <div class="model-pricing free">Available</div>
                    </div>`;
            });

            html += '</div>';
        });

        this.modelList.innerHTML = html;

        // NEW: Set up lazy loading for model elements
        if (this.modelObserver) {
            this.modelList.querySelectorAll('[data-lazy-load="true"]').forEach(element => {
                this.modelObserver.observe(element);
            });
        }

        // Add event listeners for checkboxes
        this.modelList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedCount();
                this.updateModelItemAppearance(checkbox);
            });
        });

        this.updateSelectedCount();
    }

    /**
     * Filter models based on search query
     */
    filterModels(searchQuery) {
        if (!searchQuery) {
            // Show all models
            this.modelList.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('hidden');
            });
            return;
        }

        const query = searchQuery.toLowerCase();
        this.modelList.querySelectorAll('.model-item').forEach(item => {
            const modelName = item.querySelector('.model-name').textContent.toLowerCase();
            const modelProvider = item.querySelector('.model-provider').textContent.toLowerCase();

            if (modelName.includes(query) || modelProvider.includes(query)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    /**
     * Select all visible models
     */
    selectAllModels() {
        this.modelList.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(checkbox => {
            if (!checkbox.closest('.model-item').classList.contains('hidden')) {
                checkbox.checked = true;
                this.updateModelItemAppearance(checkbox);
            }
        });
        this.updateSelectedCount();
    }

    /**
     * Clear all model selections
     */
    clearAllModels() {
        this.modelList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            this.updateModelItemAppearance(checkbox);
        });
        this.updateSelectedCount();
    }

    /**
     * Update selected count display
     */
    updateSelectedCount() {
        const selectedCount = this.modelList.querySelectorAll('input[type="checkbox"]:checked').length;
        if (this.selectedCount) {
            this.selectedCount.textContent = `${selectedCount} model${selectedCount !== 1 ? 's' : ''} selected`;
        }
    }

    /**
     * Update model item visual appearance
     */
    updateModelItemAppearance(checkbox) {
        const modelItem = checkbox.closest('.model-item');
        if (checkbox.checked) {
            modelItem.classList.add('selected');
        } else {
            modelItem.classList.remove('selected');
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if all required elements exist
    const requiredElements = [
        'settingsPanel', 'chatMessages', 'messageInput', 'sendBtn', 'loadingOverlay', 'toast'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));

    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }

    // Initialize the application
    try {
        window.chatApp = new AdvancedMultiModelAI();
        console.log('✅ Advanced Multi-Model AI initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #000; color: #fff;"><p>Failed to load application. Please refresh the page.</p></div>';
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMultiModelAI;
}
