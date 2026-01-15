# Fixes

- Added a shared question-utils module so numeric answer normalization preserves decimals and negative values, and reused it in the app for consistent evaluation.
- Added a local test runner for dashboard checks to avoid network-dependent Playwright installs.
- Updated the dashboard HTML to load the new utilities module before the app script.
