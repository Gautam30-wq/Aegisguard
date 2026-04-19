# Bytelet
A modular LLM firewall layer that sits between user input and model backend, detecting and classifying adversarial prompts (prompt injection, data leakage, indirect attacks) in real time while allowing safe edge-case queries, ensuring security without blocking legitimate user intent.

# AegisGuard - Quantum Security AI

A sophisticated LLM firewall system that protects AI interactions from malicious prompt injections, jailbreaks, and adversarial attacks using layered security scanning and real-time monitoring.

## 🚀 Features

- **Multi-Layer Security**: Regex pattern matching + AI-powered analysis
- **Real-Time Scanning**: Live risk assessment as you type
- **Automatic Sanitization**: Intelligent content filtering for suspicious inputs
- **Cyberpunk UI**: Futuristic interface with animated risk gauges
- **RESTful API**: Easy integration with existing applications
- **Graceful Fallbacks**: Continues operating even during API rate limits

## 🏗️ Architecture

### System Overview

AegisGuard implements a defense-in-depth approach with multiple security layers:

1. **Client-Side Detection**: Basic pattern matching in the browser
2. **Server-Side Scanning**: Comprehensive analysis with multiple scanners
3. **Content Sanitization**: Automatic filtering of malicious content
4. **AI Integration**: Secure communication with Google Gemini

### Core Components

#### Backend (`llm_firewall/backend/`)
- **Express Server**: Handles API requests and serves the firewall middleware
- **Firewall Engine**: Orchestrates multiple security scanners
- **Scanners**:
  - **RegexScanner**: Fast, rule-based detection of common attack patterns
  - **LLMScanner**: AI-powered analysis using Google Gemini for sophisticated threats
- **Sanitizer**: Content filtering and redaction system
- **Middleware**: Seamless integration with Express routes

#### Frontend (`llm_firewall/frontend/`)
- **Chat Interface**: Secure messaging with real-time monitoring
- **Risk Gauge**: Animated visual indicator of threat levels
- **Threat Logs**: Historical security event tracking
- **System Health**: Performance and security metrics dashboard

#### Test Interface (Root)
- **Simple Demo**: Basic HTML/JS interface for quick testing
- **Pattern Detection**: Client-side firewall demonstration

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bytelet
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file inside the `backend` directory:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   The backend should run on `http://localhost:3000`.

5. **Open the frontend**
   - If the frontend is static, open `frontend/index.html` directly in your browser.
   - If you prefer a local server, run from the `frontend` directory:
     ```bash
     npx serve .
     ```

6. **Use the app**
   - Type a message in the chat input
   - Press the execute/send button
   - Watch the firewall risk gauge, logs, and response behavior


## 🎯 Usage

### Web Interface

1. **Enable/Disable Firewall**: Use the toggle in the top bar
2. **Send Messages**: Type in the chat input and press EXECUTE
3. **Monitor Security**: Watch the risk gauge update in real-time
4. **View Logs**: Check threat logs and system health metrics

# Pipeline

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/02e56d5f-f366-4573-832b-558d76640da1" />


### API Integration

**Endpoint**: `POST /api/chat`

**Request**:
```json
{
  "message": "Tell me about quantum computing",
  "enableFirewall": true
}
```

**Response**:
```json
{
  "reply": "Quantum computing uses quantum mechanics...",
  "risk": 5,
  "blocked": false,
  "sanitized": false,
  "sanitizedPrompt": null
}
```

**Error Response** (blocked):
```json
{
  "reply": "🚫 Blocked by firewall",
  "risk": 85,
  "blocked": true,
  "details": [
    {
      "scanner": "RegexScanner",
      "score": 40,
      "reason": "Matched restricted pattern"
    }
  ]
}
```

### Security Thresholds

- **SAFE** (0-39): Input processed normally
- **WARNING** (40-74): Input sanitized before processing
- **DANGER** (75+): Request blocked entirely

## 🧪 Testing

### Run Firewall Tests
```bash
cd llm_firewall/backend
node test_firewall.js
```

### Test API Connectivity
```bash
cd llm_firewall/backend
node ../test.js
```

### Simple Interface Test
Open `index.html` in browser for basic functionality testing

## 📁 Project Structure

```
aegisguard/
  ├── backend/
  │   ├── server.js       # Main Express server
  │   ├── test_firewall.js # Firewall test suite
  │   ├── package.json    # Backend dependencies
  │   └── firewall/
  │       ├── Firewall.js # Scanner orchestrator
  │       ├── middleware.js # Express middleware
  │       ├── Sanitizer.js # Content sanitizer
  │       └── scanners/
  │           ├── RegexScanner.js # Pattern-based scanner
  │           └── LLMScanner.js   # AI-powered scanner
  └── frontend/
      ├── index.html      # Main web interface
      ├── style.css       # Cyberpunk styling
      └── script.js       # Frontend interactions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

### Customization

- **Scanner Weights**: Modify scores in `RegexScanner.js`
- **Patterns**: Add new detection patterns in `Sanitizer.js`
- **UI Theme**: Customize colors in `style.css`
- **Thresholds**: Adjust risk levels in `Firewall.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Development Guidelines

- Use ES modules consistently
- Follow existing code style
- Add JSDoc comments for new functions
- Test both scanners independently
- Ensure graceful error handling

## 📄 License

ISC License - see package.json for details

## ⚠️ Security Notice

This system provides layered protection but is not infallible. Always:
- Keep API keys secure
- Monitor logs for unusual activity
- Update patterns regularly
- Combine with other security measures

## 🆘 Troubleshooting

**Server won't start**: Check Node.js version and API key
**API errors**: Verify Gemini API key and quota
**Frontend not loading**: Ensure server is running on port 3000
**High false positives**: Adjust scanner weights in configuration

---

Built with ❤️ for secure AI interactions
** git must be installed on system to run git commands on terminal **
