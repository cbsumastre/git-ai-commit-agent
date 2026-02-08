# 🤖 Git AI Commit Agent

CLI tool that automatically generates professional Git commit messages using Language Models (LLM) like OpenAI GPT or AWS Bedrock.

## ✨ What it does

This tool analyzes staged changes in your Git repository (`git diff --staged`) and generates **3 different** professional commit message options following industry standards (imperative mood in English).

**Workflow:**
1. Stage your changes with `git add`
2. Run `git-ai-commit-agent`
3. Get **3 AI-generated commit message options**
4. Choose your preferred message
5. Use the selected message to make your commit

## 📦 Installation

### 🌍 Global installation (recommended)

```bash
npm install -g git-ai-commit-agent
```

### 📁 Local installation

```bash
npm install git-ai-commit-agent
```

### 🛠️ Development setup

```bash
# Clone this repository
git clone <repository-url>
cd git-ai-commit-agent
npm install

# Run directly (development mode)
npm run dev

# Build the project
npm run build

# Run compiled version
node ./dist/index.js
```

## ⚙️ Configuration

The tool is configured entirely through environment variables. No configuration file is needed.

### 🔧 Environment Variables

| Variable | Required | Description |
|----------|-----------|-------------|
| `GIT_AI_COMMIT_PROVIDER` | No | Provider: `direct` or `bedrock` (default: `direct`) |
| `GIT_AI_COMMIT_MODEL` | No | Model to use (default: `gpt-4o-mini`) |
| `LLM_API_KEY` | Yes (if provider=direct) | API key for the LLM service |
| `LLM_ENDPOINT` | Yes (if provider=direct) | API endpoint URL |
| `AWS_ACCESS_KEY_ID` | No (if provider=bedrock) | AWS Access Key ID. Can also be read from `~/.aws/credentials` |
| `AWS_SECRET_ACCESS_KEY` | No (if provider=bedrock) | AWS Secret Access Key. Can also be read from `~/.aws/credentials` |
| `AWS_SESSION_TOKEN` | No (if provider=bedrock) | AWS session token (for temporary credentials). Can also be read from `~/.aws/credentials` |
| `AWS_REGION` | No (if provider=bedrock) | AWS region (e.g., eu-west-1). Can also be read from `~/.aws/config` |

**For provider=direct:**
```bash
export GIT_AI_COMMIT_PROVIDER=direct
export GIT_AI_COMMIT_MODEL=gpt-4o-mini
export LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
export LLM_API_KEY=sk-your-api-key-here
```

**For provider=bedrock:**
```bash
export GIT_AI_COMMIT_PROVIDER=bedrock
export GIT_AI_COMMIT_MODEL=anthropic.claude-3-haiku-20240307-v1:0
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_SESSION_TOKEN=your-session-token
export AWS_REGION=eu-west-1
```

> **Note:** Ensure your AWS user has permissions to invoke models in Bedrock (`bedrock:InvokeModel`).

## 🚀 Usage

### 📋 Basic workflow

```bash
# 1. Stage your changes
git add file.txt

# 2. Generate commit message options
git-ai-commit-agent

# 3. The program will print 3 commit message options:
# 
# 🤖 Suggested commit messages:
# 
# 1. Add user authentication to login endpoint
# 2. Implement JWT-based auth for user login
# 3. Secure login endpoint with user credentials validation
# 
# Use: git commit -m "<message>"

# 4. Use your preferred message to commit
git commit -m "Add user authentication to login endpoint"
```

## 💡 Examples

### 🤖 With OpenAI

```bash
# Configuration (environment variables)
export GIT_AI_COMMIT_PROVIDER=direct
export GIT_AI_COMMIT_MODEL=gpt-4o-mini
export LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
export LLM_API_KEY=sk-...

# Usage
git add .
git-ai-commit-agent
```

### ☁️ With AWS Bedrock (Claude)

**Option 1: Using environment variables**
```bash
# Configuration (environment variables)
export GIT_AI_COMMIT_PROVIDER=bedrock
export GIT_AI_COMMIT_MODEL=anthropic.claude-3-haiku-20240307-v1:0
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=eu-west-1

# Usage
git add .
git-ai-commit-agent
```

**Option 2: Using AWS credentials file (simpler if you already use AWS CLI)**
```bash
# Make sure you have ~/.aws/credentials configured:
# [default]
# aws_access_key_id = your-access-key
# aws_secret_access_key = your-secret-key
# aws_session_token = your-session-token  # optional

# And ~/.aws/config:
# [default]
# region = eu-west-1

# Then just set the provider and model:
export GIT_AI_COMMIT_PROVIDER=bedrock
export GIT_AI_COMMIT_MODEL=anthropic.claude-3-haiku-20240307-v1:0

# Usage
git add .
git-ai-commit-agent
```

### ⚡ With Groq (fast and affordable)

```bash
# Configuration (environment variables)
export GIT_AI_COMMIT_PROVIDER=direct
export GIT_AI_COMMIT_MODEL=llama-3.1-8b-instant
export LLM_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
export LLM_API_KEY=gsk_...

# Usage
git add .
git-ai-commit-agent
```

## 🔍 Troubleshooting

### Error: "Failed to read git diff. Are you in a git repo?"

Make sure you're in a directory that is a Git repository.

### Error: "No staged changes found."

There are no staged changes. Run `git add <files>` first.

### AWS authentication error

Check that:
1. Your AWS credentials are correct
2. You have permissions to invoke models in Bedrock
3. The specified model is available in your region

### Error 413 (Payload Too Large)

Error 413 occurs when the git diff is too large (more than 8000 characters). The program automatically truncates the diff and shows a warning. If you need to analyze larger changes, consider:
- Making smaller and more frequent commits
- Splitting changes into several logical commits using `git add -p`

## 📂 Project Structure

```
git-ai-commit-agent/
├── src/
│   └── index.ts          # TypeScript source code
├── dist/                 # Compiled JavaScript (generated)
│   ├── index.js          # Main compiled code
│   ├── index.d.ts        # TypeScript declarations
│   └── *.js.map          # Source maps
├── package.json          # Dependencies and npm configuration
├── tsconfig.json         # TypeScript configuration
├── .npmignore           # Files to exclude from npm package
└── README.md           # This file
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome. Please open an issue or pull request.

## 📝 Changelog

### 2026-02-08
- Translated all internal messages and comments from Spanish to English in the source code for consistency