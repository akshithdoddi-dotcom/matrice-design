# Security Policy

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, use [GitHub's private vulnerability reporting](../../security/advisories/new).

### Response SLA

| Severity | Response Time |
| -------- | ------------- |
| Critical | 24 hours      |
| High     | 72 hours      |
| Medium   | Next sprint   |
| Low      | Next sprint   |

## Automated Scanning

This repository uses:

- **CodeQL** — static analysis
- **ESLint Security** — JavaScript/TypeScript security rules
- **Trivy** — dependency & container scanning
- **Dependabot** — automated dependency updates
- **gitleaks** — secret detection (pre-commit)
- **Secret scanning** — GitHub native
