# Changelog

## 0.4.0 (March 2025)

### Bug fixes

- Login with path prefix
- Logout state management front ui
- Redirect after login
- Use BASE_URL for login redirect_uri instead of simple origin
- Update responsive middle screen breakpoints

### Features

- Add way to copy uri of package, container
- Add dvc mode for code generator, s3 or http
- Add support contact link
- Set default sort to recently updated
- Update eodag code generator

### Internal

- Update front to support deployment with dynamic server api prefix

## 0.3.0 (October 2024)

### Bug fixes

- Unify keywords tags color
- Better management of errors and logout
- MLflow tracking URI in code generator use mlflow deployed under sharinghub namespace

### Features

- Improve metadata section
- Add project contributor section
- Add badge and message helper for guest users
- Integrate MLflow as iframe
- Add access level indicator on project view
- Update header size in project overview
- Add user email as logname for mlflow code generator
- Integrate different type MLflow compatibility
- Add button create project redirect to wizard

## 0.2.0 (August 2024)

### Bug Fixes

- Adjust responsive
- Initialize tags with default tags
- Hide action helpers when not configured

### Changes

- Hide OAuth2 button when OAuth2 is deactivated
- Login redirect directly when OAuth2 is activated
- Add link to EODAG docs in STAC additional resources tab
- Add edit button in actions possible
- Integrate deployer services
- Add code generator for mlflow, dvc, and pystac
- Move Mlflow URL and Docs URL as server config
- Display read only jupyter and review even if not connected
- Provide docs button in navbar from config

## 0.1.0 (June 2024)

- Initial public release
