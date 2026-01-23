# Contributing to VertiGo SaaS

Thank you for your interest in contributing to VertiGo SaaS! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/VertiGo-SaaS.git
   cd VertiGo-SaaS
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. Make your changes
2. Run linting: `pnpm lint`
3. Run tests: `pnpm test`
4. Format code: `pnpm format`
5. Commit your changes
6. Push to your fork
7. Open a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types for function parameters and return values
- Use Zod for runtime validation
- Avoid `any` type - use `unknown` if type is uncertain

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### Code Style

- Use functional components with hooks
- Prefer `const` over `let`
- Use early returns to reduce nesting
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Example Component

```typescript
// components/user-profile.tsx

import { type FC } from 'react'
import { z } from 'zod'

interface UserProfileProps {
  userId: string
  showEmail?: boolean
}

/**
 * Displays user profile information
 */
export const UserProfile: FC<UserProfileProps> = ({
  userId,
  showEmail = false
}) => {
  // Component implementation
}
```

## Project Structure

When adding new features:

### New Vertical Application

1. Create directory in `apps/`
2. Copy structure from existing vertical
3. Update `package.json` with vertical name
4. Add Tailwind config with brand colors
5. Create vertical-specific AI modules
6. Add documentation in `_docs/verticals/`

### New AI Feature

1. Define prompt in `packages/ai-core/src/prompts/`
2. Create Zod schema in `packages/ai-core/src/schemas/`
3. Implement feature using AIClient
4. Add API route in the vertical app
5. Create UI component
6. Write tests

### New Shared Component

1. Add component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Add Storybook story (if applicable)
4. Document props with JSDoc

## Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(ai-core): add embedding service for RAG

fix(musicians): correct setlist ordering bug

docs(readme): update installation instructions

refactor(database): optimize tenant query performance
```

## Pull Requests

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New code has appropriate tests
- [ ] Documentation is updated
- [ ] Commit messages follow convention

### PR Description

Include:
- Summary of changes
- Related issue number (if applicable)
- Screenshots for UI changes
- Testing instructions

### Review Process

1. Automated checks must pass
2. At least one maintainer approval required
3. All review comments addressed
4. Squash merge to main branch

## Testing

### Unit Tests

```bash
pnpm test              # Run all tests
pnpm test:ai           # Run AI module tests
pnpm test -- --watch   # Watch mode
```

### Test Structure

```typescript
// __tests__/component.test.tsx

import { render, screen } from '@testing-library/react'
import { Component } from '../component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    // Test implementation
  })
})
```

### AI Testing

AI features require mocking the OpenAI client:

```typescript
import { createMockAIClient } from '@vertigo/ai-core/testing'

const mockAI = createMockAIClient({
  responses: {
    'shot-list': { categories: [...] }
  }
})
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions and components
- Include `@param` and `@returns` tags
- Provide usage examples for complex APIs

### Markdown Documentation

- Keep language clear and concise
- Use code blocks with language hints
- Include practical examples
- Update table of contents if adding sections

## Questions?

- Open a GitHub Discussion for general questions
- Create an Issue for bugs or feature requests
- Contact maintainers for sensitive matters

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to VertiGo SaaS!
