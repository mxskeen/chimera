# Multi-Model chimera

An ultra-modern, LLM interface featuring advanced multi-model collaboration, intelligent task workflows, and AI model coordination. Experience the future of conversational AI with multiple models working together.

## 🚀 Advanced Multi-Model Features

### 🧠 **Three AI Collaboration Strategies**

#### **1. Single Model Mode**
- Traditional chat with one AI model
- Perfect for straightforward conversations
- Fast and efficient responses

#### **2. Collaborative AI Mode**
- **Multiple Models Working Together**: Select 2+ models that collaborate sequentially
- **Expertise Sharing**: Each model builds on previous responses
- **Enhanced Quality**: Combined intelligence from different AI models
- **Smart Coordination**: Automatic context building between models

#### **3. Task Workflow Mode**
- **Intelligent Task Distribution**: AI models specialized for different aspects
- **Sequential Processing**: Complex tasks broken down and processed by experts
- **Workflow Categories**:
  -  **Data Analysis**: Claude (Analysis) → GPT-4o (Insights) → Gemini (Storytelling)
  -  **Creative Projects**: Gemini (Concepts) → Claude (Structure) → GPT-4o (Content)
  -  **Technical Development**: Claude (Architecture) → Llama (Implementation) → GPT-4o (Review)
  -  **Research Projects**: Claude (Methodology) → Qwen (Data Processing) → GPT-4o (Synthesis)
  -  **Code Review**: Claude (Security) → Llama (Performance) → GPT-4o (Quality)
  -  **Problem Solving**: Claude (Analysis) → GPT-4o (Solutions) → Gemini (Implementation)

### **Advanced AI Management**
- **50+ Models**: Dynamic loading from OpenRouter API
- **Smart Categorization**: Models grouped by provider and expertise
- **Model Performance Tracking**: Optimization based on response quality
- **Context Management**: Intelligent conversation history handling
- **Error Recovery**: Sophisticated error handling and fallback systems

### **Performance & UX**
- **Lightning Fast**: Optimized for performance with minimal resource usage
- **Smart Animations**: Hardware-accelerated CSS animations
- **Responsive Design**: Perfect on all devices from mobile to ultrawide
- **Accessibility**: Full ARIA support and keyboard navigation
- **Error Recovery**: Intelligent error handling with user-friendly messages

### **Advanced Settings**
- **Creative Controls**: Temperature and token adjustment with visual feedback
- **Model Selection**: Smart dropdown with provider groupings
- **API Key Management**: Secure local storage with validation
- **Real-time Preview**: Live slider value updates

## Getting Started

### Prerequisites

1. **OpenRouter API Key**: Get your API key from [OpenRouter](https://openrouter.ai/keys)
2. **Web Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)

### Setup Instructions

1. **Download the Files**:
   - `index.html` - Main HTML file
   - `style.css` - Stylesheet
   - `script.js` - JavaScript functionality
   - `README.md` - This documentation

2. **Open the Application**:
   - Simply open `index.html` in your web browser
   - Or serve it using a local server for better performance

3. **Configure Settings**:
   - Click the "Settings" button in the top-left corner
   - Enter your OpenRouter API key
   - Select your preferred AI model
   - Adjust temperature and max tokens if desired
   - Click "Save Settings"

4. **Start Chatting**:
   - Type your message in the input field
   - Press Enter or click the send button
   - Enjoy chatting with your chosen AI model!

## Available Models

The application provides access to popular models including:

### OpenAI
- GPT-4o (Latest GPT-4 model)
- GPT-4o Mini (Cost-effective option)

### Anthropic
- Claude 3.5 Sonnet (Advanced reasoning)
- Claude 3 Haiku (Fast responses)

### Meta
- Llama 3.1 8B Instruct (Efficient)
- Llama 3.1 70B Instruct (High performance)

### Other Providers
- Google Gemini Pro 1.5
- Mistral Mixtral 8x7B
- Qwen 2.5 72B
- And many more available through OpenRouter

## Configuration Options

### Temperature
- **Range**: 0.0 - 2.0
- **Default**: 0.7
- **Description**: Controls creativity and randomness in responses
  - Lower values (0.0-0.3): More focused and deterministic
  - Higher values (1.5-2.0): More creative and varied

### Max Tokens
- **Range**: 100 - 4000
- **Default**: 1000
- **Description**: Maximum length of the AI's response

## Usage Tips

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Settings Button**: Toggle settings panel

### Best Practices
1. **API Key Security**: Your API key is stored locally in your browser and never sent anywhere except OpenRouter
2. **Model Selection**: Choose models based on your needs:
   - GPT-4o: Best overall performance
   - Claude 3.5 Sonnet: Excellent for reasoning
   - Llama models: Good balance of performance and cost
   - Smaller models: Faster responses, lower cost
3. **Cost Management**: Monitor your OpenRouter usage and costs
4. **Chat History**: The app maintains chat history during your session

## Troubleshooting

### Common Issues

1. **"Failed to load models" Error**:
   - Check your API key is correct
   - Ensure you have internet connection
   - Try the default model list fallback

2. **API Errors**:
   - Verify your OpenRouter API key has sufficient credits
   - Check if the selected model is available
   - Ensure you're not exceeding rate limits

3. **Messages Not Sending**:
   - Make sure settings are configured
   - Check browser console for error messages
   - Try refreshing the page

4. **Slow Responses**:
   - Some models are naturally slower
   - Large max token settings increase response time
   - Check your internet connection

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
chimera/
├── index.html          # Main HTML file
├── style.css           # Stylesheet
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## API Integration

The application uses the OpenRouter API endpoints:

- **Models**: `https://openrouter.ai/api/v1/models`
- **Chat Completions**: `https://openrouter.ai/api/v1/chat/completions`

### Request Format
```json
{
  "model": "selected-model",
  "messages": [...],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## Security Notes

- API keys are stored in localStorage and never transmitted anywhere except OpenRouter
- All communication is encrypted via HTTPS
- No data is sent to external servers except OpenRouter
- Chat history is only stored in browser memory

## Future Enhancements

Potential improvements for future versions:
- Export chat history
- Multiple chat sessions
- Custom system prompts
- Streaming responses
- Dark/light theme toggle
- Keyboard shortcuts configuration
- Model comparison feature

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

---

**Note**: This is a client-side application. Make sure to keep your OpenRouter API key secure and monitor your usage to avoid unexpected charges.
