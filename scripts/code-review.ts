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
      } catch {
        // Silently continue to next file if there's an error reading this one
        continue;
      }
    }
  }
}

// Load environment variables from .env.local
loadEnvFile();

const { OPENAI_API_KEY, OPENAI_MODEL } = process.env;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = OPENAI_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  console.error('   Make sure OPENAI_API_KEY is set in .env.local or as an environment variable');
  process.exit(1);
}

interface CodeSnippet {
  before?: string; // Problematic code snippet
  after?: string; // Suggested fix/correct code
  language?: string; // Code language (typescript, javascript, etc.)
}

interface Suggestion {
  text: string;
  snippet?: CodeSnippet;
}

interface CodeReviewResult {
  file: string;
  suggestions: Suggestion[]; // Normalized to Suggestion[] format
  score: number;
  summary: string;
  strengths?: string[];
  criticalIssues?: Suggestion[]; // Support snippets in critical issues
  recommendations?: Suggestion[]; // Support snippets in recommendations
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

VERIFICATION REQUIREMENTS (CRITICAL - READ FIRST):

Before reporting ANY issue, you MUST:

1. **Read and Analyze the ENTIRE Diff**: 
   - Read every line of the diff completely before making any assessments
   - Understand the full context of what was changed, not just individual lines
   - Verify that the problem you're about to report ACTUALLY EXISTS in the code shown
   - Do NOT assume something is missing without first verifying it's not already implemented

2. **Verify Problems Actually Exist**:
   - If you see a function call, check if error handling exists elsewhere in the diff
   - If you see an API route, verify if try-catch blocks are present before reporting missing error handling
   - If you see a component, check if types are defined before reporting missing types
   - If you see a database query, check if take/limit parameters are already present before suggesting pagination
   - If you see serviceContainer usage, verify it's being used correctly before suggesting to use it
   - If you're suggesting a code change, verify the change would actually improve the code (not just add comments)
   - If you see an import statement, verify it actually exists in the diff before suggesting to change it
   - If you see error handling, verify it's actually incomplete before suggesting improvements
   - If you see configuration values (like retry, skip), verify they're missing before suggesting to add them
   - Do NOT suggest adding parameters with default values (like skip: 0) that don't add functionality
   - Do NOT suggest cosmetic improvements (like adding prefixes to error messages) when the code is already clear
   - Do NOT suggest adding take/limit when it's already present in the query
   - Only report issues that are OBVIOUSLY and CLEARLY missing from the code shown

3. **Distinguish Between Missing Code vs Already Implemented**:
   - Code that is NOT in the diff but exists in the file is NOT a problem to report
   - Only report issues visible in the actual diff provided
   - If error handling exists in the diff (even if not perfect), do NOT report it as "missing error handling"
   - If types are used correctly, do NOT report them as "missing types"

4. **Context Analysis**:
   - Consider the full context of the file being reviewed
   - Look for patterns that show the code follows project conventions
   - Verify if the code aligns with the PROJECT RULES AND STANDARDS provided above
   - Do NOT report issues that are actually following the project's established patterns

5. **Conservative Reporting**:
   - When in doubt, do NOT report as a critical issue
   - If you're not 100% certain a problem exists, mark it as a suggestion or recommendation instead
   - Better to miss a minor issue than to report a false positive that wastes developer time

COMMON FALSE POSITIVES TO AVOID:

❌ DO NOT report these as issues:
- "Missing error handling" when try-catch blocks are already present in the diff
- "Missing type annotations" when TypeScript can infer types correctly
- "Missing validation" when validation exists but uses a different pattern than expected
- "Security issue" when authentication/authorization checks are present but implemented differently
- "Performance issue" when the code follows established project patterns
- "Architectural violation" when the code correctly uses ServiceContainer or follows DDD patterns
- "Missing pagination/limits" when take or limit parameters are already present in queries
- "Not using ServiceContainer" when the code already uses serviceContainer correctly
- "Code improvements" that only add comments or don't actually change functionality
- Suggesting to use a method/function that already exists but the current usage is also valid
- "Missing imports" when the import doesn't actually exist in the diff
- "Error handling improvements" when error handling is already comprehensive and correct
- Suggesting to add parameters with default values that don't add functionality (e.g., skip: 0)
- Suggesting to change configuration values (e.g., retry: 1 to retry: 2) as if the feature is missing
- Suggesting cosmetic improvements to error messages when the message is already descriptive
- Suggesting to add take/limit when it's already present in the code

✅ DO report these as issues:
- Actual security vulnerabilities (SQL injection, XSS, exposed secrets)
- Code that violates DDD boundaries (direct Prisma calls in domain layer)
- Missing authentication/authorization where user data is accessed
- Type safety issues (use of 'any', unsafe assertions)
- Actual bugs that would cause runtime errors

CRITICAL ISSUES CRITERIA (STRICT):

Only report as "criticalIssues" if ALL of these are true:
1. The problem is OBVIOUSLY present in the diff (not assumed)
2. The problem would cause a PRODUCTION FAILURE (crash, security breach, data loss)
3. The problem is NOT already handled in the code shown
4. The problem cannot be safely ignored or deferred

Examples of TRUE critical issues:
- SQL injection vulnerability in user input
- Missing authentication check before accessing user data
- Direct database access in domain layer (violates DDD)
- Exposed API keys or secrets in code
- Unhandled promise rejection that would crash the app

Examples of FALSE critical issues (report as suggestions instead):
- Error handling that exists but could be improved
- Type annotations that are optional but would improve clarity
- Code that follows project patterns but could be optimized
- Missing comments or documentation
- Performance optimizations that are already implemented (e.g., take: 100 already present)
- Architectural patterns already correctly implemented (e.g., ServiceContainer already used)

REVIEW REQUIREMENTS:

Conduct a comprehensive, rigorous code review as if this code will be deployed to a production system serving millions of users. Your review must be thorough, actionable, and based on industry best practices and academic research.

IMPORTANT: Before reporting any issue, verify it actually exists in the diff. Do not assume problems without evidence.

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
   - Authentication/authorization checks (VERIFY these exist before reporting)
   - Sensitive data handling
   - SQL injection / XSS / CSRF considerations
   - Environment variable usage
   - Error handling and information disclosure (VERIFY error handling exists in diff before reporting as missing)

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
    {
      "text": "[Category] Description of issue. Why it matters. How to fix it.",
      "snippet": {
        "before": "<Problematic code snippet from the diff - show the actual code that needs fixing>",
        "after": "<Suggested corrected code - show how it should be written>",
        "language": "typescript"
      }
    },
    ...
  ],
  "strengths": [
    "<What the code does well - be specific>",
    ...
  ],
  "criticalIssues": [
    {
      "text": "<Issue description>",
      "snippet": {
        "before": "<Problematic code>",
        "after": "<Corrected code>",
        "language": "typescript"
      }
    },
    ...
  ],
  "recommendations": [
    {
      "text": "<Optional improvement description>",
      "snippet": {
        "before": "<Current code (optional)>",
        "after": "<Improved code (optional)>",
        "language": "typescript"
      }
    },
    ...
  ]
}

IMPORTANT: For each suggestion, critical issue, and recommendation:
- Include code snippets showing the problematic code (before) and the suggested fix (after)
- Extract actual code from the diff when possible - reference specific lines or patterns
- Use proper code formatting with language tags
- If a suggestion doesn't require code changes, you can omit the snippet
- Always include snippets for critical issues and architectural problems

REVIEW STYLE:
- **VERIFY FIRST**: Always verify that a problem actually exists in the diff before reporting it
- Be thorough and specific. Reference exact lines, patterns, or architectural concepts from the diff
- Explain the "why" behind each suggestion, not just the "what"
- Prioritize suggestions by severity and impact
- Consider long-term maintainability and scalability
- Apply academic rigor while remaining practical
- **Conservative Approach**: When uncertain, prefer suggestions over critical issues
- **Context Awareness**: Consider the full context of the diff and project patterns
- If code is excellent, acknowledge it prominently in strengths
- Only report issues you can clearly see in the provided diff
- For error handling: Check if try-catch exists before reporting missing error handling
- For types: Check if types are used correctly (even if inferred) before reporting missing types
- For security: Verify authentication/authorization actually missing before reporting security issues
- For performance: Verify if optimizations (like take, limit, pagination) are already implemented before suggesting them
- For architecture: Verify if ServiceContainer or DDD patterns are already correctly used before suggesting to use them
- For suggestions: Only suggest changes that would actually improve the code, not just add comments or cosmetic changes
- For imports: Verify the import actually exists in the diff before suggesting to change it
- For error handling: Verify it's actually incomplete before suggesting improvements (don't suggest improvements to already-comprehensive error handling)
- For configuration: Distinguish between "missing feature" vs "could use different value" - only suggest if feature is missing
- For parameters: Do NOT suggest adding parameters with default values that don't add functionality (e.g., skip: 0)
- For error messages: Do NOT suggest cosmetic improvements when messages are already descriptive and clear
- For queries: Verify take/limit are actually missing before suggesting to add them

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

    // Normalize suggestions to support both string[] and Suggestion[] formats
    const normalizeSuggestions = (suggestions: unknown): Suggestion[] => {
      if (!Array.isArray(suggestions)) return [];
      return suggestions.map((suggestion) => {
        if (typeof suggestion === 'string') {
          return { text: suggestion };
        }
        if (typeof suggestion === 'object' && suggestion !== null && 'text' in suggestion) {
          return suggestion as Suggestion;
        }
        return { text: String(suggestion) };
      });
    };

    // Normalize criticalIssues and recommendations similarly
    const normalizeIssues = (issues: unknown): Suggestion[] => {
      if (!Array.isArray(issues)) return [];
      return issues.map((issue) => {
        if (typeof issue === 'string') {
          return { text: issue };
        }
        if (typeof issue === 'object' && issue !== null && 'text' in issue) {
          return issue as Suggestion;
        }
        return { text: String(issue) };
      });
    };

    return {
      file: filePath === 'unpushed commits' ? 'unpushed commits' : filePath || 'staged changes',
      suggestions: normalizeSuggestions(review.suggestions),
      score: review.score || 0,
      summary: review.summary || '',
      strengths: review.strengths || [],
      criticalIssues: normalizeIssues(review.criticalIssues),
      recommendations: normalizeIssues(review.recommendations),
    };
  } catch (error) {
    console.error('❌ Error calling OpenAI API:', error);
    return null;
  }
}

/**
 * Format code snippet for markdown display
 */
function formatCodeSnippet(snippet: CodeSnippet): string {
  if (!snippet.before && !snippet.after) return '';

  const language = snippet.language || 'typescript';
  let formatted = '';

  if (snippet.before) {
    formatted += `**❌ Problematic Code:**\n\`\`\`${language}\n${snippet.before}\n\`\`\`\n\n`;
  }

  if (snippet.after) {
    formatted += `**✅ Suggested Fix:**\n\`\`\`${language}\n${snippet.after}\n\`\`\`\n\n`;
  }

  return formatted;
}

/**
 * Get text from suggestion (supports both string and Suggestion object)
 */
function getSuggestionText(suggestion: string | Suggestion): string {
  if (typeof suggestion === 'string') return suggestion;
  return suggestion.text;
}

/**
 * Get snippet from suggestion (if available)
 */
function getSuggestionSnippet(suggestion: string | Suggestion): CodeSnippet | undefined {
  if (typeof suggestion === 'string') return undefined;
  return suggestion.snippet;
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
      const issueText = getSuggestionText(issue);
      const issueSnippet = getSuggestionSnippet(issue);
      markdown += `### ${index + 1}. ${issueText}\n\n`;
      if (issueSnippet) {
        markdown += formatCodeSnippet(issueSnippet);
      }
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
      const suggestionText = getSuggestionText(suggestion);
      const suggestionSnippet = getSuggestionSnippet(suggestion);
      markdown += `### ${index + 1}. ${suggestionText}\n\n`;
      if (suggestionSnippet) {
        markdown += formatCodeSnippet(suggestionSnippet);
      }
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
      const recText = getSuggestionText(rec);
      const recSnippet = getSuggestionSnippet(rec);
      markdown += `### ${index + 1}. ${recText}\n\n`;
      if (recSnippet) {
        markdown += formatCodeSnippet(recSnippet);
      }
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
        const issueText = getSuggestionText(issue);
        const issueSnippet = getSuggestionSnippet(issue);
        output += `${index + 1}. ${issueText}\n`;
        if (issueSnippet) {
          if (issueSnippet.before) {
            output += `\n❌ Problematic:\n\`\`\`${issueSnippet.language || 'typescript'}\n${issueSnippet.before}\n\`\`\`\n`;
          }
          if (issueSnippet.after) {
            output += `✅ Fix:\n\`\`\`${issueSnippet.language || 'typescript'}\n${issueSnippet.after}\n\`\`\`\n`;
          }
        }
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
        const suggestionText = getSuggestionText(suggestion);
        const suggestionSnippet = getSuggestionSnippet(suggestion);
        output += `${index + 1}. ${suggestionText}\n`;
        if (suggestionSnippet) {
          if (suggestionSnippet.before) {
            output += `\n❌ Problematic:\n\`\`\`${suggestionSnippet.language || 'typescript'}\n${suggestionSnippet.before}\n\`\`\`\n`;
          }
          if (suggestionSnippet.after) {
            output += `✅ Fix:\n\`\`\`${suggestionSnippet.language || 'typescript'}\n${suggestionSnippet.after}\n\`\`\`\n`;
          }
        }
      });
      output += '\n';
    }

    if (result.recommendations && result.recommendations.length > 0) {
      output += '### 🎯 Optional Recommendations\n';
      result.recommendations.forEach((rec, index) => {
        const recText = getSuggestionText(rec);
        const recSnippet = getSuggestionSnippet(rec);
        output += `${index + 1}. ${recText}\n`;
        if (recSnippet) {
          if (recSnippet.before) {
            output += `\nCurrent:\n\`\`\`${recSnippet.language || 'typescript'}\n${recSnippet.before}\n\`\`\`\n`;
          }
          if (recSnippet.after) {
            output += `Improved:\n\`\`\`${recSnippet.language || 'typescript'}\n${recSnippet.after}\n\`\`\`\n`;
          }
        }
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
        const issueText = getSuggestionText(issue);
        const issueSnippet = getSuggestionSnippet(issue);
        console.log(`   ${index + 1}. ${issueText}`);
        if (issueSnippet) {
          if (issueSnippet.before) {
            console.log(`\n   ❌ Problematic Code:\n${issueSnippet.before}\n`);
          }
          if (issueSnippet.after) {
            console.log(`   ✅ Suggested Fix:\n${issueSnippet.after}\n`);
          }
        }
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
        const suggestionText = getSuggestionText(suggestion);
        const suggestionSnippet = getSuggestionSnippet(suggestion);
        console.log(`   ${index + 1}. ${suggestionText}`);
        if (suggestionSnippet) {
          if (suggestionSnippet.before) {
            console.log(`\n   ❌ Problematic Code:\n${suggestionSnippet.before}\n`);
          }
          if (suggestionSnippet.after) {
            console.log(`   ✅ Suggested Fix:\n${suggestionSnippet.after}\n`);
          }
        }
      });
      console.log('');
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('🎯 Optional Recommendations:');
      result.recommendations.forEach((rec, index) => {
        const recText = getSuggestionText(rec);
        const recSnippet = getSuggestionSnippet(rec);
        console.log(`   ${index + 1}. ${recText}`);
        if (recSnippet) {
          if (recSnippet.before) {
            console.log(`\n   Current Code:\n${recSnippet.before}\n`);
          }
          if (recSnippet.after) {
            console.log(`   Improved Code:\n${recSnippet.after}\n`);
          }
        }
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
