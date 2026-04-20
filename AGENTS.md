# AGENTS.md — CHT Core Quick Reference

## Monorepo Structure

- **`api/`** — Node.js server providing REST APIs, security, and filtered CouchDB replication
- **`sentinel/`** — Node.js service that runs transitions (validations, scheduled messages, alerts) on every CouchDB document change
- **`webapp/`** — Angular + NgRx single-page app for care teams (the main CHT web UI)
- **`admin/`** — AngularJS single-page app for program administrators ("App Management")
- **`shared-libs/`** — npm workspaces containing shared libraries used across services (e.g. `cht-datasource`, `transitions`, `rules-engine`)
- **`config/default/`** — Default CHT app configuration used for testing
- **`tests/`** — Integration and e2e tests that run against a live CHT instance
- **`scripts/`** — Build, CI, and deployment helper scripts

For full project overview, architecture, and setup instructions, see the [CHT Docs](https://docs.communityhealthtoolkit.org) or query the **CHT Docs MCP** (via Kapa.ai).

---

## Where to Put New Code

- **New service-level code** → `api/src/`, `sentinel/src/`, or `webapp/src/ts/`
- **New unit tests** mirror the source path: `api/src/foo.js` → `api/tests/mocha/foo.spec.js`
- **New shared functionality** used by multiple services → `shared-libs/`
- **New e2e tests** → `tests/e2e/default/`
- **New integration tests** → `tests/integration/`

---

## npm Commands

### Build & Lint

```bash
npm run build-dev           # development build (webapp + shared-libs)
npm run build-dev-watch     # build + watch for changes
npm run lint                # ESLint + blank-link-check + shellcheck
npm run lint-translations   # check translation files
```

### Unit Tests

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

### Integration Tests

Require a running CHT instance (typically started via Docker in CI).

```bash
npm run integration-api             # API integration tests (used by `npm test`)
npm run integration-sentinel-local  # build images + run sentinel integration tests locally
npm run integration-all-local       # build images + run all integration tests locally
npm run integration-cht-form        # WebdriverIO tests for cht-form component
```

### E2E Tests

Require a fully running CHT instance and Chrome. Run via WebdriverIO (`wdio`).

```bash
npm run ci-webdriver-default         # default e2e suite
npm run ci-webdriver-default-mobile  # mobile e2e suite
npm run upgrade-wdio                 # upgrade scenario e2e tests
```

### Full CI Test Command

```bash
npm test    # lint + unit tests + integration-api
```

### Default Config Tests

```bash
npm run test-config-default    # runs tests in config/default/
```

---

## Commit Format

Conventional Commits are used and enforced by CI:
```
feat(#1234): short description
fix(#1234): short description
chore(#1234): short description
test(#1234): short description
```
The parenthetical must contain the issue number, not a component name.

### Branching

- Branch off `master`; open PRs against `master`
- Branch naming: `<issue-number>-short-description`

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

## MCP Servers

AI agents can query these MCP servers for up-to-date project information instead of relying solely on this file:

- **CHT Docs MCP** (via Kapa.ai) — Full CHT documentation: setup instructions, architecture, code conventions, contributing guides
- **OpenDeepWiki MCP** (for medic/cht-core) — Codebase navigation, repository structure, and code-level documentation
