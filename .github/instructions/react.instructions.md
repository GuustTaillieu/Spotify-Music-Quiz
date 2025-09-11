---
applyTo: "**/*.ts,**/*.tsx"
---

# Project coding standards for TypeScript and React

## TypeScript Guidelines

- Use TypeScript for all new code
- Use types for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- Use zod for schema validation

## React Guidelines

- Use functional components with hooks
- Use arrow functions for components with a separate props type
- Never import React directly (e.g., `import React from 'react'`)
- Never export default components
- Always add a `key` prop to lists of elements
- Always add missing imports at the top of the file
- Follow the React hooks rules (no conditional hooks)
- Keep components small and focused
- Use tailwind CSS for styling
