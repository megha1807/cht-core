# AGENTS.md — CHT Core Quick Reference

## Project Overview

CHT Core is a **monorepo** containing the server-side and client-side services of the Community Health Toolkit Core Framework. It powers offline-first digital health apps used by community health workers. The main services are:

- **`api/`** — Node.js server providing REST APIs, security, and filtered CouchDB replication
- **`sentinel/`** — Node.js service that runs transitions (validations, scheduled messages, alerts) on every CouchDB document change
- **`webapp/`** — Angular + NgRx single-page app for care teams (the main CHT web UI)
- **`admin/`** — AngularJS single-page app for program administrators ("App Management")
- **`shared-libs/`** — npm workspaces containing shared libraries used across services (e.g. `cht-datasource`, `transitions`, `rules-engine`)
- **`config/default/`** — Default CHT app configuration used for testing
- **`tests/`** — Integration and e2e tests that run against a live CHT instance
- **`scripts/`** — Build, CI, and deployment helper scripts

Database: CouchDB (run locally via Docker for development).

---

## Requirements & Setup

- **Node.js 22.x** and **npm 10.x** (use `nvm install 22`; Node 22 matches production)
- **Docker** (required for CouchDB and e2e/integration tests)
- `xsltproc`, `jq`, `git`, `make`, `g++` (Linux/macOS)

### Clone & install

```bash
git clone https://github.com/medic/cht-core ~/cht-core
cd ~/cht-core
npm ci           # installs all root + workspace deps; may take several minutes
npm run build-dev
```

### Required environment variables

Set these permanently in your shell rc file:

```bash
export COUCH_NODE_NAME=nonode@nohost
export COUCH_URL=http://medic:password@localhost:5984/medic
```

### Start CouchDB

```bash
mkdir -p ~/cht-docker
curl -s -o ~/cht-docker/docker-compose.yml \
  https://staging.dev.medicmobile.org/_couch/builds_4/medic:medic:master/docker-compose/cht-couchdb.yml

cat > ~/cht-docker/couchdb-override.yml << EOF
services:
  couchdb:
    ports:
      - "5984:5984"
      - "5986:5986"
EOF

cd ~/cht-docker
COUCHDB_USER=medic COUCHDB_PASSWORD=password \
  docker compose -f docker-compose.yml -f couchdb-override.yml up -d
```

---

## Development (3 terminals)

```bash
# Terminal 1 – compile & watch the webapp
npm run build-dev-watch     # wait for "Waiting…" before proceeding

# Terminal 2 – API service
npm run dev-api

# Terminal 3 – Sentinel service
npm run dev-sentinel
```

App runs at http://localhost:5988/. CouchDB Fauxton UI at http://localhost:5984/_utils (user: `medic`, pass: `password`).

---

## Build & Lint

```bash
npm run build-dev           # development build (webapp + shared-libs)
npm run build-dev-watch     # build + watch for changes
npm run lint                # ESLint + blank-link-check + shellcheck
npm run lint-translations   # check translation files
```

---

## Testing

### Unit tests

Unit tests run entirely in-process — no running CHT instance required.

```bash
npm run unit                # all unit tests: webapp + admin + shared-libs + api + sentinel

# Run individual service unit tests:
npm run unit-webapp         # Angular (Karma) + mocha timezone tests
npm run unit-admin          # Karma (AngularJS admin app)
npm run unit-api            # Mocha — files: api/tests/mocha/**/*.js
npm run unit-sentinel       # Mocha — files: sentinel/tests/**/*.js
npm run unit-shared-lib     # npm workspaces test across all shared-libs
```

### Integration tests

Require a running CHT instance (typically started via Docker in CI).

```bash
npm run integration-api             # API integration tests (used by `npm test`)
npm run integration-sentinel-local  # build images + run sentinel integration tests locally
npm run integration-all-local       # build images + run all integration tests locally
npm run integration-cht-form        # WebdriverIO tests for cht-form component
```

### E2E (end-to-end) tests

Require a fully running CHT instance and Chrome. Run via WebdriverIO (`wdio`).

```bash
npm run ci-webdriver-default         # default e2e suite
npm run ci-webdriver-default-mobile  # mobile e2e suite
npm run upgrade-wdio                 # upgrade scenario e2e tests
```

### Full CI test command

```bash
npm test    # lint + unit tests + integration-api
```

### Default config tests

```bash
npm run test-config-default    # runs tests in config/default/
```

---

## Repository Structure

```
cht-core/
├── api/                    # Node.js API service
│   ├── src/                # Source code
│   └── tests/mocha/        # Unit tests (Mocha + Chai)
├── sentinel/               # Node.js background processing service
│   ├── src/                # Source code
│   └── tests/              # Unit tests (Mocha + Chai)
├── webapp/                 # Angular web app (care teams)
│   ├── src/
│   │   ├── ts/             # Angular TypeScript source
│   │   └── js/             # Vanilla JS (Enketo widgets, etc.)
│   └── tests/              # Karma + Mocha unit tests
├── admin/                  # AngularJS admin app
│   ├── src/
│   └── tests/              # Karma unit tests
├── shared-libs/            # npm workspaces — shared libraries
│   ├── cht-datasource/
│   ├── transitions/
│   ├── rules-engine/
│   └── ...
├── tests/
│   ├── e2e/                # WebdriverIO e2e tests
│   │   ├── default/        # Standard browser tests
│   │   └── default-mobile/ # Mobile browser tests
│   └── integration/        # Integration tests (Mocha, requires running CHT)
├── config/
│   └── default/            # Default app config (used in tests)
├── scripts/
│   ├── build/              # Build scripts
│   └── ci/                 # CI helper scripts
└── package.json            # Root scripts; uses npm workspaces for shared-libs
```

- **New service-level code** goes in `api/src/`, `sentinel/src/`, or `webapp/src/ts/`
- **New unit tests** mirror the source path: `api/src/foo.js` → `api/tests/mocha/foo.spec.js`
- **New shared functionality** used by multiple services → `shared-libs/`
- **New e2e tests** → `tests/e2e/default/`
- **New integration tests** → `tests/integration/`

---

## Code Conventions

### General

- JavaScript (CommonJS) for `api/`, `sentinel/`, `admin/`; TypeScript for `webapp/` and newer shared-libs
- ESLint enforced — run `npm run lint` before committing; fix all errors
- 2-space indentation, single quotes, semicolons required (see root `eslint.config.js`)
- Strict equality (`===`) throughout

### Commit format

Conventional Commits are used and enforced by CI:

```
feat(#1234): short description
fix(#1234): short description
chore(#1234): short description
test(#1234): short description
```
### Branching

- Branch off `master`; open PRs against `master`
- Branch naming: `<issue-number>-short-description`

### Testing conventions

- Unit tests must not require a running CouchDB or CHT instance (`UNIT_TEST_ENV=1` stubs external calls)
- Use `sinon` for stubs/spies/mocks; `chai` for assertions
- Coverage is measured with `nyc` for `api/` and `sentinel/`
- E2e tests use `wdio` + Chrome; keep tests independent (each test sets up its own data)

---

## CI

GitHub Actions runs on Node 22.15. The main CI pipeline runs:

1. `npm run lint`
2. `npm run unit`
3. `npm run integration-api`

E2e and full integration tests run on separate CI jobs (require Docker image builds).

---

## Key Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `COUCH_URL` | Yes | — | Full CouchDB URL e.g. `http://medic:password@localhost:5984/medic` |
| `COUCH_NODE_NAME` | Yes | — | CouchDB node name e.g. `nonode@nohost` |
| `API_PORT` | No | `5988` | Port the API listens on |
| `CHROME_BIN` | No | — | Path to Chrome binary (needed for some test environments) |

---
