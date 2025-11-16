#!/usr/bin/env tsx
/**
 * OpenAI Code Review Script
 * 
 * Reviews code changes using OpenAI API and provides feedback.
 * Can be used locally or in CI/CD pipelines.
 * 
 * Usage:
 *   pnpm code-review                    # Review staged changes
 *   pnpm code-review --file path/to/file.ts
 *   pnpm code-review --diff <diff-string>
 *   pnpm code-review --unpushed         # Review unpushed commits
 *   pnpm code-review --markdown         # Output as markdown for AI pane
 *   pnpm code-review --unpushed --markdown  # Review unpushed commits as markdown
 *   pnpm code-review --markdown --output review.md  # Save to file
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Load environment variables from .env files
 * Tries .env.local, .env, and .env.development in that order
 */
function loadEnvFile() {
  const envFiles = ['.env.local', '.env', '.env.development'];
  const cwd = process.cwd();
  
  for (const envFile of envFiles) {
    const envPath = join(cwd, envFile);
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          // Skip comments and empty lines
          if (!trimmedLine || trimmedLine.startsWith('#')) continue;
          
          // Parse KEY=VALUE format
          const equalIndex = trimmedLine.indexOf('=');
          if (equalIndex === -1) continue;
          
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Only set if not already in process.env (env vars take precedence)
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
        // If we found and loaded a file, break (don't override with other files)
        break;
      } catch (error) {
        // Silently continue to next file if there's an error reading this one
        continue;
      }
    }
  }
}

// Load environment variables from .env.local
loadEnvFile();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  console.error('   Make sure OPENAI_API_KEY is set in .env.local or as an environment variable');
  process.exit(1);
}

interface CodeReviewResult {
  file: string;
  suggestions: string[];
  score: number;
  summary: string;
}

/**
 * Get git diff for staged files or specific file
 */
function getDiff(filePath?: string): string {
  try {
    if (filePath) {
      return execSync(`git diff HEAD ${filePath}`, { encoding: 'utf-8' });
    }
    return execSync('git diff --cached', { encoding: 'utf-8' });
  } catch (error) {
    console.error('Error getting diff:', error);
    return '';
  }
}

/**
 * Get git diff for unpushed commits
 * Compares current branch with remote tracking branch
 */
function getUnpushedDiff(): string {
  try {
    // Try to get remote tracking branch
    let remoteBranch: string | null = null;
    
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      remoteBranch = execSync(`git rev-parse --abbrev-ref ${currentBranch}@{upstream} 2>/dev/null`, { encoding: 'utf-8' }).trim();
    } catch {
      // Upstream not set, try fallback
    }
    
    if (!remoteBranch) {
      // Fallback: try common remote branch names
      const remotes = ['origin/HEAD', 'origin/main', 'origin/master'];
      for (const remote of remotes) {
        try {
          execSync(`git rev-parse --verify ${remote}`, { encoding: 'utf-8', stdio: 'ignore' });
          remoteBranch = remote;
          break;
        } catch {
          continue;
        }
      }
    }
    
    if (!remoteBranch) {
      throw new Error('No remote branch found. Make sure you have a remote configured.');
    }
    
    return execSync(`git diff ${remoteBranch}...HEAD`, { encoding: 'utf-8' });
  } catch (error) {
    console.error('Error getting unpushed diff:', error);
    return '';
  }
}

/**
 * Get file content
 */
function getFileContent(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return '';
  }
}

/**
 * Call OpenAI API for code review
 */
async function reviewCode(diff: string, filePath?: string): Promise<CodeReviewResult | null> {
  if (!diff || diff.trim().length === 0) {
    console.log('⚠️  No changes to review');
    return null;
  }

  const projectRules = readFileSync(join(process.cwd(), '.cursor/project-rules.md'), 'utf-8').slice(
    0,
    2000
  );

  const prompt = `You are an expert code reviewer for a Next.js 15 + TypeScript + DDD architecture project.

Project Rules Summary:
${projectRules}

Review the following code changes and provide:
1. A score from 0-100 (where 100 is perfect)
2. Specific suggestions for improvement
3. A brief summary

Focus on:
- TypeScript best practices
- DDD architecture compliance
- Code quality and maintainability
- Performance considerations
- Security issues
- Following project conventions

Code changes:
\`\`\`diff
${diff}
\`\`\`

Provide your review in JSON format:
{
  "score": number,
  "summary": "brief summary",
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert code reviewer for Next.js + TypeScript projects. Always respond with valid JSON in the exact format requested.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenAI API error:', error);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content in response');
      return null;
    }

    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      // Try to extract JSON object directly
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonContent = jsonObjectMatch[0];
      }
    }

    const review = JSON.parse(jsonContent);

    return {
      file: filePath === 'unpushed commits' ? 'unpushed commits' : (filePath || 'staged changes'),
      suggestions: review.suggestions || [],
      score: review.score || 0,
      summary: review.summary || '',
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    return null;
  }
}

/**
 * Generate markdown formatted review for AI pane
 */
function generateMarkdownReview(result: CodeReviewResult): string {
  const scoreColor = result.score >= 80 ? '🟢' : result.score >= 70 ? '🟡' : '🔴';
  const scoreEmoji = result.score >= 80 ? '✅' : result.score >= 70 ? '⚠️' : '❌';

  let markdown = `# 🤖 Code Review - ${result.file}\n\n`;
  markdown += `---\n\n`;
  markdown += `## ${scoreEmoji} Score: ${scoreColor} **${result.score}/100**\n\n`;
  markdown += `---\n\n`;

  markdown += `## 📝 Summary\n\n`;
  markdown += `${result.summary}\n\n`;
  markdown += `---\n\n`;

  if (result.suggestions.length > 0) {
    markdown += `## 💡 Suggestions (${result.suggestions.length})\n\n`;
    result.suggestions.forEach((suggestion, index) => {
      markdown += `### ${index + 1}. ${suggestion}\n\n`;
    });
  } else {
    markdown += `## ✅ No Suggestions\n\n`;
    markdown += `The code review found no issues. Great work! 🎉\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*Generated by OpenAI Code Review*\n`;
  markdown += `*Review Date: ${new Date().toLocaleString()}*\n`;

  return markdown;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  const diffIndex = args.indexOf('--diff');
  const unpushedIndex = args.indexOf('--unpushed');

  let diff: string;
  let filePath: string | undefined;

  if (unpushedIndex !== -1) {
    // Review unpushed commits
    diff = getUnpushedDiff();
    if (!diff || diff.trim().length === 0) {
      console.log('✅ No unpushed commits to review');
      return;
    }
    filePath = 'unpushed commits'; // Set special identifier for unpushed commits
  } else if (diffIndex !== -1 && args[diffIndex + 1]) {
    diff = args[diffIndex + 1];
  } else if (fileIndex !== -1 && args[fileIndex + 1]) {
    filePath = args[fileIndex + 1];
    diff = getDiff(filePath);
  } else {
    diff = getDiff();
  }

  if (!diff || diff.trim().length === 0) {
    console.log('✅ No changes to review');
    return;
  }

  console.log('🔍 Reviewing code with OpenAI...\n');

  const result = await reviewCode(diff, filePath);

  if (!result) {
    console.error('❌ Failed to get code review');
    process.exit(1);
  }

  // Check if running in CI (GitHub Actions)
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const markdownMode = args.includes('--markdown');
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : null;

  if (markdownMode) {
    // Format as markdown for AI pane
    const markdown = generateMarkdownReview(result);
    
    if (outputFile) {
      writeFileSync(outputFile, markdown, 'utf-8');
      console.log(`\n✅ Code review saved to ${outputFile}`);
    } else {
      console.log(markdown);
    }
  } else if (isCI) {
    // Format for GitHub Actions / PR comments
    let output = `**Score:** ${result.score}/100\n\n`;
    output += `**Summary:** ${result.summary}\n\n`;

    if (result.suggestions.length > 0) {
      output += '**Suggestions:**\n';
      result.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
    } else {
      output += '✅ No suggestions - code looks good!\n';
    }

    console.log(output);
  } else {
    // Format for local terminal
    console.log(`\n📊 Code Review Results for: ${result.file}`);
    console.log(`\n⭐ Score: ${result.score}/100`);
    console.log(`\n📝 Summary:\n${result.summary}\n`);

    if (result.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      result.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('✅ No suggestions - code looks good!');
    }

    // Exit with error if score is too low (only in local, not in CI)
    if (result.score < 70) {
      console.log('\n⚠️  Code review score is below 70. Please address the suggestions.');
      process.exit(1);
    }

    console.log('\n✅ Code review passed!');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
