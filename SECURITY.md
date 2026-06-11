# Security Policy

## Supported versions

Security fixes are applied to the latest state of the default branch.

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

- Use GitHub private vulnerability reporting if it is enabled.
- Otherwise, contact the maintainer privately using the LinkedIn profile listed in [public.md](./public.md).

Please include:

- affected route, file, or dependency
- reproduction steps
- impact
- any suggested mitigation

## Sensitive data and configuration

- Do not commit `.env` files, API keys, tokens, or private service-account data.
- Review backend dependency declarations before deploying; the current backend imports more packages than `_ops/pip/requirements.in` declares.
- Treat the current frontend authentication flow as demo-only and not suitable for production use.
