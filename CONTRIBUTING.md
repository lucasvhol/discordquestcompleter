# Contributing Guidelines

## Code Style

- Use consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Maintain readability with clear variable names
- Add comments for complex logic
- Follow the existing code structure and organization

## Testing

Before submitting changes:

1. Test the script in a browser console
2. Verify all quest types are processed correctly
3. Check error handling for edge cases
4. Ensure no breaking changes to existing functionality

## Reporting Issues

When reporting bugs, include:

- Your Discord client (browser/desktop/mobile)
- Error message from console
- Steps to reproduce
- Expected vs actual behavior

## Feature Requests

Provide details about:

- Why the feature is needed
- How it would improve the script
- Any potential implementation approaches

## Pull Requests

- Keep changes focused and atomic
- Update README if behavior changes
- Test thoroughly before submission
- Include a clear description of changes

## Code Organization

The script maintains these core sections:

1. **Configuration** - Adjustable parameters
2. **Store Extraction** - Discord webpack stores
3. **Quest Management** - Main orchestration
4. **Quest Handlers** - Type-specific implementations
5. **Main Execution** - Entry point

Maintain this structure when adding new functionality.
