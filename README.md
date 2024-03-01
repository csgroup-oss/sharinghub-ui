# SharingHub UI

## Table of contents

- [Environment setup](#environment-setup)
- [Development](#development)
- [Production](#production)
  - [Local build](#local-build)
  - [Docker image](#docker-image)

## Environment setup

You will need Node v18 and NPM 9.

Setup the environment:

```bash
npm install
```

## Development

Run the development server:

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
