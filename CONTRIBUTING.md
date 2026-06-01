# Contributing to OrvixCRM

We welcome contributions! Every contribution is appreciated.

## How to Contribute

### Reporting Issues

- [Open an issue](https://github.com/rahul200618/orvixcrm/issues) if you find a bug or have a suggestion.

### Pull Requests

1. Fork the repository
2. Create your feature branch from `dev`
3. Commit your changes with descriptive messages
4. Push to your fork
5. Open a Pull Request targeting the `dev` branch

### Development Setup

```sh
git clone https://github.com/rahul200618/orvixcrm.git
cd orvixcrm
pnpm install
cp .env.example .env
# Fill in your env vars
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

### Code Style

- TypeScript strict mode
- ESLint with `eslint-config-next`
- Prettier formatting
- Run `pnpm lint` before submitting

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add round-robin assignment strategy
fix: correct lead status transition guard
docs: update webhook endpoint documentation
refactor: extract assignment engine to lib/
```

### Branch Strategy

- `main` — production releases only
- `dev` — integration branch, all PRs target here

## Code of Conduct

Be respectful, constructive, and inclusive.
