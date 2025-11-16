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
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
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
  strengths?: string[];
  criticalIssues?: string[];
  recommendations?: string[];
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
      remoteBranch = execSync(
        `git rev-parse --abbrev-ref ${currentBranch}@{upstream} 2>/dev/null`,
        { encoding: 'utf-8' }
      ).trim();
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
    3000
  );

  const prompt = `You are a distinguished Senior Software Architect and Code Review Expert with a PhD-level understanding of software engineering principles, design patterns, and enterprise architecture. You have 20+ years of experience reviewing production codebases at scale.

Your expertise includes:
- Domain-Driven Design (DDD) and Clean Architecture
- SOLID principles and design patterns
- TypeScript/JavaScript best practices and type safety
- Next.js, React, and modern web architecture
- Performance optimization and scalability
- Security best practices and vulnerability assessment
- Code maintainability, readability, and technical debt
- Testing strategies and quality assurance

PROJECT CONTEXT:
This is a Next.js 15 application using TypeScript 5, implementing Domain-Driven Design architecture with:
- React 19, Prisma 6, NextAuth v5
- TanStack Query for server state management
- Zustand for client UI state
- Tailwind CSS + Shadcn UI

PROJECT RULES AND STANDARDS:
${projectRules}

CODE CHANGES TO REVIEW:
\`\`\`diff
${diff}
\`\`\`

${filePath ? `FILE BEING REVIEWED: ${filePath}` : ''}

REVIEW REQUIREMENTS:

Conduct a comprehensive, rigorous code review as if this code will be deployed to a production system serving millions of users. Your review must be thorough, actionable, and based on industry best practices and academic research.

EVALUATION CRITERIA (Weighted):

1. **Architectural Compliance (25%)**
   - Adherence to DDD principles and layer boundaries
   - Proper separation of concerns (Domain/Application/Infrastructure)
   - Correct use of ServiceContainer and dependency injection
   - Respect for Clean Architecture boundaries
   - Appropriate use of TanStack Query vs Zustand

2. **Type Safety & TypeScript Excellence (20%)**
   - Proper type definitions and inference
   - No use of 'any' or unsafe type assertions
   - Generic types used appropriately
   - Type narrowing and guards
   - Interface vs type alias decisions

3. **Code Quality & Maintainability (20%)**
   - SOLID principles adherence (especially Single Responsibility, Dependency Inversion)
   - Code readability and self-documentation
   - Appropriate abstraction levels
   - DRY (Don't Repeat Yourself) compliance
   - Cyclomatic complexity assessment
   - Function/method length and cohesion

4. **Security & Best Practices (15%)**
   - Input validation and sanitization
   - Authentication/authorization checks
   - Sensitive data handling
   - SQL injection / XSS / CSRF considerations
   - Environment variable usage
   - Error handling and information disclosure

5. **Performance & Scalability (10%)**
   - Efficient algorithms and data structures
   - Unnecessary re-renders or computations
   - Database query optimization
   - Memory leaks or resource management
   - Caching strategies
   - Bundle size considerations

6. **Testing & Reliability (5%)**
   - Testability of the code
   - Error handling completeness
   - Edge cases consideration
   - Defensive programming

7. **Project Conventions (5%)**
   - Naming conventions
   - File organization
   - Import/export patterns
   - Component structure

SCORING GUIDELINES:
- 90-100: Production-ready, exemplary code following all best practices
- 80-89: Good code with minor improvements needed
- 70-79: Acceptable but requires refactoring
- 60-69: Significant issues that should be addressed
- Below 60: Critical problems requiring immediate attention

OUTPUT FORMAT:
Provide a comprehensive review in JSON format with the following structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 paragraph comprehensive summary analyzing the code changes from an architectural and engineering perspective>",
  "suggestions": [
    "<Each suggestion should be specific, actionable, and include rationale. Format: '[Category] Description of issue. Why it matters. How to fix it.'>",
    ...
  ],
  "strengths": [
    "<What the code does well - be specific>",
    ...
  ],
  "criticalIssues": [
    "<Only include issues that MUST be fixed before merging - security, architectural violations, breaking changes>",
    ...
  ],
  "recommendations": [
    "<Optional improvements that would elevate code quality further>",
    ...
  ]
}

REVIEW STYLE:
- Be thorough and specific. Reference exact lines, patterns, or architectural concepts.
- Explain the "why" behind each suggestion, not just the "what"
- Prioritize suggestions by severity and impact
- Consider long-term maintainability and scalability
- Apply academic rigor while remaining practical
- If code is excellent, acknowledge it, but still look for opportunities to improve

Begin your comprehensive review now.`;

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
              'You are a distinguished Senior Software Architect and Code Review Expert with PhD-level expertise in software engineering. You conduct rigorous, comprehensive code reviews following industry best practices and academic standards. Always respond with valid JSON in the exact format requested, providing detailed, actionable feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
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
      file: filePath === 'unpushed commits' ? 'unpushed commits' : filePath || 'staged changes',
      suggestions: review.suggestions || [],
      score: review.score || 0,
      summary: review.summary || '',
      strengths: review.strengths || [],
      criticalIssues: review.criticalIssues || [],
      recommendations: review.recommendations || [],
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
  const scoreColor =
    result.score >= 90 ? '🟢' : result.score >= 80 ? '🟡' : result.score >= 70 ? '🟠' : '🔴';
  const scoreEmoji =
    result.score >= 90 ? '✅' : result.score >= 80 ? '⚠️' : result.score >= 70 ? '⚠️' : '❌';
  const scoreLabel =
    result.score >= 90
      ? 'Excellent'
      : result.score >= 80
        ? 'Good'
        : result.score >= 70
          ? 'Acceptable'
          : 'Needs Improvement';

  let markdown = `# 🔍 Expert Code Review - ${result.file}\n\n`;
  markdown += `---\n\n`;
  markdown += `## ${scoreEmoji} Overall Score: ${scoreColor} **${result.score}/100** (${scoreLabel})\n\n`;
  markdown += `---\n\n`;

  markdown += `## 📋 Executive Summary\n\n`;
  markdown += `${result.summary}\n\n`;
  markdown += `---\n\n`;

  // Critical Issues (if any)
  if (result.criticalIssues && result.criticalIssues.length > 0) {
    markdown += `## 🚨 Critical Issues (Must Fix Before Merge)\n\n`;
    result.criticalIssues.forEach((issue, index) => {
      markdown += `### ${index + 1}. ${issue}\n\n`;
    });
    markdown += `---\n\n`;
  }

  // Strengths
  if (result.strengths && result.strengths.length > 0) {
    markdown += `## ✨ Code Strengths\n\n`;
    result.strengths.forEach((strength, index) => {
      markdown += `### ${index + 1}. ${strength}\n\n`;
    });
    markdown += `---\n\n`;
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    markdown += `## 💡 Improvement Suggestions (${result.suggestions.length})\n\n`;
    result.suggestions.forEach((suggestion, index) => {
      markdown += `### ${index + 1}. ${suggestion}\n\n`;
    });
    markdown += `---\n\n`;
  } else if (!result.criticalIssues || result.criticalIssues.length === 0) {
    markdown += `## ✅ No Issues Found\n\n`;
    markdown += `The code review found no issues. Excellent work! 🎉\n\n`;
    markdown += `---\n\n`;
  }

  // Recommendations (optional improvements)
  if (result.recommendations && result.recommendations.length > 0) {
    markdown += `## 🎯 Optional Recommendations\n\n`;
    markdown += `*These are optional improvements that would further elevate code quality:*\n\n`;
    result.recommendations.forEach((rec, index) => {
      markdown += `### ${index + 1}. ${rec}\n\n`;
    });
    markdown += `---\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*🔬 Review conducted by Senior Software Architect & Code Review Expert*\n`;
  markdown += `*📅 Review Date: ${new Date().toLocaleString()}*\n`;
  markdown += `*🤖 Powered by OpenAI Code Review System*\n`;

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
    let output = `## 🔍 Expert Code Review\n\n`;
    output += `**Score:** ${result.score}/100 ${result.score >= 90 ? '🟢' : result.score >= 80 ? '🟡' : result.score >= 70 ? '🟠' : '🔴'}\n\n`;
    output += `**Summary:**\n${result.summary}\n\n`;

    if (result.criticalIssues && result.criticalIssues.length > 0) {
      output += '### 🚨 Critical Issues (Must Fix)\n';
      result.criticalIssues.forEach((issue, index) => {
        output += `${index + 1}. ${issue}\n`;
      });
      output += '\n';
    }

    if (result.strengths && result.strengths.length > 0) {
      output += '### ✨ Code Strengths\n';
      result.strengths.forEach((strength, index) => {
        output += `${index + 1}. ${strength}\n`;
      });
      output += '\n';
    }

    if (result.suggestions.length > 0) {
      output += '### 💡 Improvement Suggestions\n';
      result.suggestions.forEach((suggestion, index) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
      output += '\n';
    }

    if (result.recommendations && result.recommendations.length > 0) {
      output += '### 🎯 Optional Recommendations\n';
      result.recommendations.forEach((rec, index) => {
        output += `${index + 1}. ${rec}\n`;
      });
    }

    console.log(output);
  } else {
    // Format for local terminal
    console.log(`\n🔍 Expert Code Review Results for: ${result.file}`);
    console.log(
      `\n⭐ Score: ${result.score}/100 ${result.score >= 90 ? '🟢 Excellent' : result.score >= 80 ? '🟡 Good' : result.score >= 70 ? '🟠 Acceptable' : '🔴 Needs Improvement'}`
    );
    console.log(`\n📋 Executive Summary:\n${result.summary}\n`);

    if (result.criticalIssues && result.criticalIssues.length > 0) {
      console.log('🚨 Critical Issues (Must Fix):');
      result.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log('');
    }

    if (result.strengths && result.strengths.length > 0) {
      console.log('✨ Code Strengths:');
      result.strengths.forEach((strength, index) => {
        console.log(`   ${index + 1}. ${strength}`);
      });
      console.log('');
    }

    if (result.suggestions.length > 0) {
      console.log('💡 Improvement Suggestions:');
      result.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      console.log('');
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('🎯 Optional Recommendations:');
      result.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
    }

    if (
      !result.suggestions.length &&
      (!result.criticalIssues || result.criticalIssues.length === 0)
    ) {
      console.log('✅ No issues found - Excellent work!');
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
