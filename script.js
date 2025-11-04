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

        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
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

        // Clear input
        this.messageInput.value = '';
        this.updateCharCount();
        this.autoResizeInput();
        this.toggleSendButton();

        // Show loading
        this.setLoading(true);

        try {
            let response = '';

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

            // Add assistant response to chat
            this.addMessage('assistant', response);

        } catch (error) {
            console.error('Error sending message:', error);

            let errorMessage = 'Sorry, I encountered an error.';

            if (error.name === 'AbortError') {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Invalid API key. Please check your settings.';
            } else if (error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded. Please wait and try again.';
            } else if (error.message.includes('insufficient_quota')) {
                errorMessage = 'Insufficient credits. Please check your OpenRouter account.';
            } else {
                errorMessage = `Error: ${error.message}`;
            }

            this.showToast(errorMessage, 'error');
            this.addMessage('assistant', `I apologize, but I encountered an error: ${errorMessage}`);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Process message with single model
     */
    async processSingleModel(message) {
        const messages = this.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await this.callAPI(this.selectedModel, messages);
        return response.choices[0].message.content;
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

            const response = await this.callAPI(modelId, messages);
            const content = response.choices[0].message.content;
            responses.push(`**${this.getModelDisplayName(modelId)}:** ${content}`);

            // Build context for next model
            accumulatedContext = `${message}\n\nTeam Discussion So Far:\n${responses.join('\n\n')}`;
        }

        // Final synthesis by the first model
        const finalMessages = [
            { role: 'system', content: 'You are the final synthesizer. Consolidate the team discussion into a cohesive, comprehensive response that incorporates all insights.' },
            { role: 'user', content: `Finalize this collaborative response:\n\n${responses.join('\n\n---\n\n')}` }
        ];

        const finalResponse = await this.callAPI(this.collaborativeModels[0], finalMessages);
        return finalResponse.choices[0].message.content;
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

            const response = await this.callAPI(step.model, messages);
            const content = response.choices[0].message.content;

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

        const finalResponse = await this.callAPI(workflow.steps[0].model, finalMessages);
        return finalResponse.choices[0].message.content;
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
     * Enhanced message formatting
     */
    formatMessage(content) {
        if (!content) return '';

        // Escape HTML first
        let formatted = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');

        // Format markdown-like syntax
        formatted = formatted
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
                        <div class="model-item" data-model-id="${model.id}">
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
                    <div class="model-item" data-model-id="${model.id}">
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
                    <div class="model-item" data-model-id="${model.id}">
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
