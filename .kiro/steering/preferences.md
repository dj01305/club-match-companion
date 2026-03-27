# Developer Preferences

The user is a QE (Quality Engineer) by profession and is learning app development for the first time.

Before creating any files or making any changes, always briefly explain:
- What each file is
- What its purpose is in the context of the app
- Why it's needed

Keep explanations simple and avoid assuming prior development knowledge. Use plain language over jargon where possible.

## Testing philosophy

The 80% coverage threshold is a safety net, not the goal. When writing tests, prioritise:
- Business logic (auth flows, data validation, access control)
- Critical paths (anything a user does to create, read, update, or delete data)
- Frequently changing code (new features, recently modified files)

Do not write tests purely to hit a coverage number. Trivial code (simple getters, config files, one-line helpers) does not need dedicated tests.
