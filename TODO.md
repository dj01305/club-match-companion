# TODO

## Backend
- [ ] Add `DELETE /auth/user` endpoint so global-teardown can fully clean up test user accounts after E2E runs

Add a delete user API test to the BE too

Register form fields have no asterisks — add visual required indicators
No success message shown after registration — add a confirmation before redirecting to login
Replace browser-native "please fill out this field" popups with inline red error messages per field, styled consistently with the existing alert alert-error component
Add email format validation to the register backend endpoint, return a 400 for invalid formats, then add an API test to cover it
Allow logged-in users to update their favourite club from the dashboard — will need a new PUT /api/user/profile endpoint and a corresponding API test

Delete this file if it accidnelty gets committed 