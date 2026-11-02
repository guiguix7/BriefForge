# Security Policy

## Supported versions

BriefForge is under active development and does not currently publish supported release versions. Security fixes should target the latest version on the default branch unless the maintainers state otherwise.

## Reporting a vulnerability

Please do not report security vulnerabilities in a public issue or pull request.

Use a private GitHub Security Advisory for this repository when that feature is available. If it is not available, contact the repository maintainers privately through the repository hosting service and include the word `SECURITY` in the subject.

Include only the information needed to reproduce and assess the issue:

- A concise description of the vulnerability and its impact.
- The affected file, route, package, or version.
- Reproduction steps or a minimal proof of concept.
- Any suggested mitigation.
- Whether the issue may expose credentials, personal data, or other sensitive information.

Please redact tokens, passwords, private keys, personal data, and production URLs from reports. Do not attach real secrets or customer data.

## Response process

Maintainers will acknowledge a private report when possible, investigate the report, and coordinate a fix or mitigation. The disclosure timeline depends on severity, exploitability, affected users, and the availability of a tested fix.

Security fixes may be released without immediately publishing all technical details. Once users have a practical mitigation, the maintainers may publish a concise advisory with affected versions and upgrade guidance.

## Scope

This policy covers the BriefForge source code and its documented development configuration. Third-party dependencies and hosting providers should be reported to their respective maintainers as well, while still notifying BriefForge when the issue affects this project.
