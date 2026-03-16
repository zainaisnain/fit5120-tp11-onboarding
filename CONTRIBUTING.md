# Contributing Guide

## Git Commit Message Convention

### Format

```
type(scope): short description
```

### Types

| Type | When to Use |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `style` | CSS/UI changes, formatting |
| `refactor` | Code restructure, no feature change |
| `chore` | Setup, config, dependencies |
| `docs` | README, comments, documentation |
| `test` | Adding or updating tests |

### Scopes

Use the feature or layer name as the scope such as:

`uv` `sunscreen` `clothing` `skintone` `reminder` `db` `auth` `router`

### Examples

```
feat(uv): add real-time UV index card component
feat(sunscreen): implement dosage calculator logic
fix(uv): correct UV level colour thresholds
style(clothing): update clothing advisor layout
chore: initialise Vue project structure
chore: add PostgreSQL connection pool
docs: update README with setup instructions
refactor(db): extract query logic into model layer
test(sunscreen): add unit tests for dosage calculation
```

### Rules

- Lowercase always
- Present tense. "add" not "added"
- Keep it under 72 characters
- Scope is optional but recommended

---

## Environment Variables

Never commit `.env` files to GitHub. They contain secrets like API keys and database credentials.
