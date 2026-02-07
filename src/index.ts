// index.ts
// Simple Git AI Commit Message Agent (TypeScript)
// Reads git diff, sends to LLM (AWS Bedrock or direct API), outputs ONLY commit message

import { execSync } from 'child_process';

// ---------------- TYPES ----------------
interface Config {
  provider?: 'direct' | 'bedrock' | undefined;
  model?: string | undefined;
}

interface DirectAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface BedrockResponse {
  content: Array<{
    text: string;
  }>;
}

// ---------------- CONFIG ----------------
function getConfig(): Config {
  return {
    provider: (process.env.GIT_AI_COMMIT_PROVIDER as 'direct' | 'bedrock' | undefined),
    model: process.env.GIT_AI_COMMIT_MODEL ?? undefined
  };
}

function validateConfig(config: Config): void {
  const missing: string[] = [];

  if (!config.model) {
    missing.push('GIT_AI_COMMIT_MODEL');
  }

  if (config.provider === 'bedrock') {
    // AWS credentials and region can be provided via:
    // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
    // 2. AWS credentials file (~/.aws/credentials) and config file (~/.aws/config)
    // The AWS SDK automatically reads from these files if env vars are not set
  } else {
    if (!process.env.LLM_ENDPOINT) {
      missing.push('LLM_ENDPOINT');
    }
    if (!process.env.LLM_API_KEY) {
      missing.push('LLM_API_KEY');
    }
  }

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ---------------- GIT ----------------
function getGitDiff(): string {
  try {
    return execSync('git diff --staged', { encoding: 'utf8' });
  } catch {
    throw new Error('Failed to read git diff. Are you in a git repo?');
  }
}

// ---------------- PROMPT ----------------
const MAX_DIFF_CHARS = 8000; // Límite para evitar error 413

function buildPrompt(diff: string): string {
  let truncatedDiff = diff;
  if (diff.length > MAX_DIFF_CHARS) {
    truncatedDiff = diff.substring(0, MAX_DIFF_CHARS) + '\n... [diff truncado por exceder tamaño máximo]';
    console.warn(`⚠️  El diff de git excede el límite de ${MAX_DIFF_CHARS} caracteres. Se ha truncado para evitar el error 413.`);
  }

  return `You are a senior software engineer.
Generate 3 different concise, professional Git commit messages in English following industry standards (imperative mood).
Each message should describe the changes from a different perspective or level of detail.

Use conventional commit prefixes when appropriate:
- feat: for new features or functionality
- chore: for maintenance tasks, dependencies, or tooling changes
- doc: for documentation changes
- refactor: for code refactoring without behavior changes

Git diff:
${truncatedDiff}

Return exactly 3 commit messages, one per line, numbered 1-3.
Format:
1. First commit message option
2. Second commit message option  
3. Third commit message option`;
}

// ---------------- LLM PROVIDERS ----------------
async function callDirectAPI(config: Config, prompt: string): Promise<string> {
  const res = await fetch(process.env.LLM_ENDPOINT!, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LLM_API_KEY!}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json() as DirectAPIResponse;
  return data.choices[0]?.message.content.trim() || '';
}

async function callBedrock(config: Config, prompt: string): Promise<string> {
  const { BedrockRuntimeClient, InvokeModelCommand } = await import('@aws-sdk/client-bedrock-runtime');

  const clientConfig = process.env.AWS_REGION ? { region: process.env.AWS_REGION } : {};
  const client = new BedrockRuntimeClient(clientConfig);
  const command = new InvokeModelCommand({
    modelId: config.model!,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const response = await client.send(command);
  const body = JSON.parse(Buffer.from(response.body).toString()) as BedrockResponse;
  return body.content[0]?.text.trim() || '';
}

// ---------------- MAIN ----------------
async function run(): Promise<void> {
  const config = getConfig();
  validateConfig(config);
  const diff = getGitDiff();

  if (!diff.trim()) {
    console.error('No staged changes found.');
    process.exit(1);
  }

  const prompt = buildPrompt(diff);

  let response: string;
  if (config.provider === 'bedrock') {
    response = await callBedrock(config, prompt);
  } else {
    response = await callDirectAPI(config, prompt);
  }

  // Parse and display the 3 commit message options
  const lines = response.split('\n').filter(line => line.trim());
  const options: string[] = [];
  
  for (const line of lines) {
    // Match lines starting with number and dot (e.g., "1. " or "2. ")
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match && match[1] && options.length < 3) {
      options.push(match[1].trim());
    }
  }

  if (options.length === 0) {
    // Fallback: if parsing fails, show raw response
    console.log(response);
  } else {
    console.log('\n🤖 Suggested commit messages:\n');
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    console.log('\nUse: git commit -m "<message>"');
  }
}

// ---------------- EXECUTION ----------------
run().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});