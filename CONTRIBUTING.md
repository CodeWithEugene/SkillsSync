# Contributing to SkillSync

First off, thank you for considering contributing to SkillSync! 🎉

It's people like you that make SkillSync such a great tool for tracking and developing skills. This document provides guidelines and steps for contributing.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [How Can I Contribute?](#-how-can-i-contribute)
- [Development Setup](#-development-setup)
- [Pull Request Process](#-pull-request-process)
- [Style Guidelines](#-style-guidelines)
- [Community](#-community)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. By participating, you are expected to uphold this commitment.

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later
- **pnpm** (recommended) or npm
- **Git**
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### First Time Contributors

New to open source? Here are some resources to help you get started:

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [First Timers Only](https://www.firsttimersonly.com/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

Look for issues labeled `good first issue` - these are specifically curated for new contributors!

---

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**

1. **Clear title** - Descriptive summary of the issue
2. **Steps to reproduce** - Detailed steps to recreate the bug
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Screenshots** - If applicable
6. **Environment details:**
   - OS and version
   - Browser and version
   - Node.js version
   - Any relevant error messages

**Bug Report Template:**

```markdown
## Bug Description

A clear description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Screenshots

If applicable, add screenshots.

## Environment

- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.10.0]
```

### 💡 Suggesting Features

We love feature suggestions! Before suggesting:

1. Check if the feature already exists
2. Check if there's already an open issue for it
3. Consider if it aligns with the project's goals

**Feature Request Template:**

```markdown
## Feature Description

A clear description of the feature.

## Problem it Solves

What problem does this feature solve?

## Proposed Solution

How do you envision this working?

## Alternatives Considered

Any alternative solutions you've considered.

## Additional Context

Any other context or screenshots.
```

### 📝 Improving Documentation

Documentation improvements are always welcome:

- Fix typos or clarify language
- Add examples or tutorials
- Improve code comments
- Update outdated information

### 💻 Contributing Code

Ready to write some code? Here's how:

1. Find an issue to work on (or create one)
2. Comment on the issue to let others know you're working on it
3. Fork the repository
4. Create a feature branch
5. Write your code
6. Write/update tests if applicable
7. Submit a pull request

---

## 🛠 Development Setup

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/skillsync.git
cd skillsync
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your environment variables
```

### 4. Set Up the Database

Follow the database setup instructions in the [README](README.md#installation).

### 5. Start Development Server

```bash
pnpm dev
```

### 6. Create a Branch

```bash
# Create a branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes** - Ensure everything works as expected
2. **Update documentation** - If you changed APIs or added features
3. **Follow style guidelines** - Run linting and formatting
4. **Write meaningful commits** - Use conventional commit messages

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add Google OAuth support
fix(dashboard): resolve skill count display issue
docs(readme): update installation instructions
refactor(api): simplify document upload logic
```

### Submitting Your PR

1. Push your branch to your fork

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template with:

   - Clear description of changes
   - Link to related issue(s)
   - Screenshots if UI changes
   - Any breaking changes

4. Request a review

### Review Process

- PRs require at least one approval before merging
- Address any requested changes
- Keep your branch up to date with `main`
- Be patient - reviews may take a few days

---

## 📏 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
/**
 * Extracts skills from a document using AI analysis
 * @param documentId - The ID of the document to analyze
 * @returns Array of extracted skills with confidence scores
 */
async function extractSkills(documentId: string): Promise<Skill[]> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing folder structure

```tsx
interface SkillCardProps {
  skill: Skill;
  onEdit?: (skill: Skill) => void;
}

export function SkillCard({ skill, onEdit }: SkillCardProps) {
  // Component implementation
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Use CSS variables for custom colors
- Ensure responsive design

### File Organization

```
components/
├── feature-name/
│   ├── feature-component.tsx
│   ├── feature-utils.ts
│   └── index.ts
```

### Linting

Before committing, run:

```bash
pnpm lint
```

---

## 🌐 Community

### Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion

### Stay Updated

- ⭐ Star the repository to show support
- 👁 Watch for updates and new releases

---

## 🙏 Recognition

Contributors will be recognized in:

- The README contributors section
- Release notes when their changes ship

---

## ❓ Questions?

If you have any questions not covered here, feel free to:

1. Open a GitHub issue
2. Start a GitHub discussion

Thank you for contributing to SkillSync! 🚀

---

<div align="center">
  <strong>Happy Contributing!</strong>
  <br/>
  Made with ❤️ by the SkillSync community
</div>
