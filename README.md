# SharingHub UI

## Table of contents

- [Environment setup](#environment-setup)
- [Development](#development)
- [Production](#production)
  - [Local build](#local-build)
  - [Docker image](#docker-image)

## Environment setup

You will need:

- Node v18
- NPM 9.
- [Python 3.11 or later](https://www.python.org/downloads/)

Setup the environment:

```bash
npm install
```

Install the [pre-commit](https://pre-commit.com/) hooks:

```bash
python3 -m pip install pre-commit
pre-commit install --install-hooks
```

## Development

### Lint

The linting is managed by pre-commit, but you can run it with:

```bash
pre-commit run --all-files
```

### Run the development server

```bash
npm start -- --apiUrl="http://localhost:8000/api/" --docsUrl="http://localhost:5000/"
```

## Production

### Local build

Build the web UI with:

```bash
npm run build
```

### Docker image

Build the image:

```bash
docker build . -t sharinghub-ui:latest --build-arg VERSION=$(git rev-parse --short HEAD)
```
