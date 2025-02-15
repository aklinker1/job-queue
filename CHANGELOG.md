# Changelog

## v0.6.9

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.8...v0.6.9)

### 🩹 Fixes

- Include cause in job error ([e02c9ef](https://github.com/aklinker1/job-queue/commit/e02c9ef))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.8

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.7...v0.6.8)

### 🩹 Fixes

- Use hash router for dashboard to work around custom base paths ([dc59d52](https://github.com/aklinker1/job-queue/commit/dc59d52))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.7

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.6...v0.6.7)

### 🩹 Fixes

- `basePath` not resolving routes correctly ([7a1345f](https://github.com/aklinker1/job-queue/commit/7a1345f))

### 📖 Documentation

- Update docs link ([ed81f4f](https://github.com/aklinker1/job-queue/commit/ed81f4f))
- Add missing JSDoc ([8f41a36](https://github.com/aklinker1/job-queue/commit/8f41a36))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.6

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.5...v0.6.6)

### 🚀 Enhancements

- Add chart to dashboad ([#11](https://github.com/aklinker1/job-queue/pull/11))

### 🩹 Fixes

- Require `runAt` for `QueueEntry.runAt` ([#12](https://github.com/aklinker1/job-queue/pull/12))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.5

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.4...v0.6.5)

### 📖 Documentation

- Add section on scheduling ([d2bddcc](https://github.com/aklinker1/job-queue/commit/d2bddcc))
- Update web UI screenshot ([50d7b56](https://github.com/aklinker1/job-queue/commit/50d7b56))
- Update README.md ([b7e6055](https://github.com/aklinker1/job-queue/commit/b7e6055))
- Fix typos ([86e071d](https://github.com/aklinker1/job-queue/commit/86e071d))

### 🏡 Chore

- Generate bundle stats for web UI ([#10](https://github.com/aklinker1/job-queue/pull/10))

### 🤖 CI

- Fix release commit message ([2ee2210](https://github.com/aklinker1/job-queue/commit/2ee2210))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.4

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.3...v0.6.4)

### 🚀 Enhancements

- Retry jobs from web UI ([#8](https://github.com/aklinker1/job-queue/pull/8))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.3

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.2...v0.6.3)

### 📖 Documentation

- Update JSDoc to use `@link` ([cd30e44](https://github.com/aklinker1/job-queue/commit/cd30e44))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.2

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.1...v0.6.2)

## v0.6.1

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.6.0...v0.6.1)

### 📖 Documentation

- Add links at top of README ([f872ad0](https://github.com/aklinker1/job-queue/commit/f872ad0))
- Change order of HTML handler ([915c099](https://github.com/aklinker1/job-queue/commit/915c099))
- Remove periods ([27492ad](https://github.com/aklinker1/job-queue/commit/27492ad))
- Update runtime headings ([8d5d115](https://github.com/aklinker1/job-queue/commit/8d5d115))
- Add missing JSDoc for JobEntryNotFound ([a229b13](https://github.com/aklinker1/job-queue/commit/a229b13))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.6.0

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.5.0...v0.6.0)

### 🚀 Enhancements

- ⚠️  `retry` count option and default backoff ([#3](https://github.com/aklinker1/job-queue/pull/3))
- `job.in` to change the queue a job runs in ([#5](https://github.com/aklinker1/job-queue/pull/5))
- `job.in` for adhoc queue changes ([#6](https://github.com/aklinker1/job-queue/pull/6))
- Retry APIs and server endpoints ([#7](https://github.com/aklinker1/job-queue/pull/7))

### 🩹 Fixes

- ⚠️  Rename "task" to "job" ([#4](https://github.com/aklinker1/job-queue/pull/4))

#### ⚠️ Breaking Changes

- ⚠️  `retry` count option and default backoff ([#3](https://github.com/aklinker1/job-queue/pull/3))
- ⚠️  Rename "task" to "job" ([#4](https://github.com/aklinker1/job-queue/pull/4))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.5.0

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.5...v0.5.0)

### 🚀 Enhancements

- ⚠️  Rename `createQueue` to `createJobQueue` ([#2](https://github.com/aklinker1/job-queue/pull/2))

### 📖 Documentation

- Update UI screenshot ([eb4b5e5](https://github.com/aklinker1/job-queue/commit/eb4b5e5))
- Update README ([d293f39](https://github.com/aklinker1/job-queue/commit/d293f39))

#### ⚠️ Breaking Changes

- ⚠️  Rename `createQueue` to `createJobQueue` ([#2](https://github.com/aklinker1/job-queue/pull/2))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.5

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.4...v0.4.5)

### 📖 Documentation

- Update readme ([0cad56d](https://github.com/aklinker1/job-queue/commit/0cad56d))

### 🏡 Chore

- Update lockfile ([55e9d58](https://github.com/aklinker1/job-queue/commit/55e9d58))

### 🤖 CI

- Lock down runner version ([d66b804](https://github.com/aklinker1/job-queue/commit/d66b804))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.4

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.3...v0.4.4)

### 📖 Documentation

- Fix UI preview on jsr ([800d28e](https://github.com/aklinker1/job-queue/commit/800d28e))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.3

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.2...v0.4.3)

### 📖 Documentation

- Add missing JSDoc ([1176ae2](https://github.com/aklinker1/job-queue/commit/1176ae2))

### 🏡 Chore

- Fix failing checks ([9d98960](https://github.com/aklinker1/job-queue/commit/9d98960))
- Write tests and rename internal APIs ([#1](https://github.com/aklinker1/job-queue/pull/1))

### 🤖 CI

- Add validation workflow ([13cedf1](https://github.com/aklinker1/job-queue/commit/13cedf1))
- Fix runner versions ([4cf869c](https://github.com/aklinker1/job-queue/commit/4cf869c))
- Add publish workflow ([5143360](https://github.com/aklinker1/job-queue/commit/5143360))
- Convert publish workflow to `workflow_dispatch`, not `push` ([6801ef7](https://github.com/aklinker1/job-queue/commit/6801ef7))
- Add authentication to publish workflow ([166ef21](https://github.com/aklinker1/job-queue/commit/166ef21))
- Add git config ([b0c7bc0](https://github.com/aklinker1/job-queue/commit/b0c7bc0))
- Fix permissions ([c27edfa](https://github.com/aklinker1/job-queue/commit/c27edfa))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.2

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.1...v0.4.2)

### 📖 Documentation

- Add missing JSDoc ([aee1a54](https://github.com/aklinker1/job-queue/commit/aee1a54))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.1

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.4.0...v0.4.1)

### 📖 Documentation

- Update README ([83e2584](https://github.com/aklinker1/job-queue/commit/83e2584))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.4.0

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.3.1...v0.4.0)

### 🚀 Enhancements

- ⚠️  Extract database creation from persister ([97802cf](https://github.com/aklinker1/job-queue/commit/97802cf))

#### ⚠️ Breaking Changes

- ⚠️  Extract database creation from persister ([97802cf](https://github.com/aklinker1/job-queue/commit/97802cf))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.3.1

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- Rename `createDenoSqlitePersister` to `createBunSqlitePersister` ([a5cbc72](https://github.com/aklinker1/job-queue/commit/a5cbc72))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.3.0

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.2.4...v0.3.0)

### 🩹 Fixes

- ⚠️  Convert bun and deno sqlite persisters to be async ([cc36d42](https://github.com/aklinker1/job-queue/commit/cc36d42))

#### ⚠️ Breaking Changes

- ⚠️  Convert bun and deno sqlite persisters to be async ([cc36d42](https://github.com/aklinker1/job-queue/commit/cc36d42))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.2.4

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.2.3...v0.2.4)

### 🚀 Enhancements

- Add bun support ([8f90efc](https://github.com/aklinker1/job-queue/commit/8f90efc))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.2.3

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.2.2...v0.2.3)

### 🩹 Fixes

- Remove dependency on @std/fs ([da12c37](https://github.com/aklinker1/job-queue/commit/da12c37))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.2.2

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.2.1...v0.2.2)

### 📖 Documentation

- Update README ([f9bdfbd](https://github.com/aklinker1/job-queue/commit/f9bdfbd))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.2.1

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.2.0...v0.2.1)

### 📖 Documentation

- Remove NPM and PNPM install steps ([132c973](https://github.com/aklinker1/job-queue/commit/132c973))
- Update README ([337fd95](https://github.com/aklinker1/job-queue/commit/337fd95))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.2.0

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.1.4...v0.2.0)

### 🩹 Fixes

- ⚠️  Rename `workers` to `concurrency` ([9e1eb1e](https://github.com/aklinker1/job-queue/commit/9e1eb1e))

### 📖 Documentation

- Add missing JSDoc ([451a49b](https://github.com/aklinker1/job-queue/commit/451a49b))

#### ⚠️ Breaking Changes

- ⚠️  Rename `workers` to `concurrency` ([9e1eb1e](https://github.com/aklinker1/job-queue/commit/9e1eb1e))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.1.4

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.1.3...v0.1.4)

### 📖 Documentation

- Add README.md ([1a31d1f](https://github.com/aklinker1/job-queue/commit/1a31d1f))
- Add missing JSDoc ([61766d2](https://github.com/aklinker1/job-queue/commit/61766d2))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.1.3

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.1.2...v0.1.3)

### 🏡 Chore

- Fix publish task ([85bab61](https://github.com/aklinker1/job-queue/commit/85bab61))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.1.2

[compare changes](https://github.com/aklinker1/job-queue/compare/v0.1.1...v0.1.2)

### 📖 Documentation

- Remove module doc from index ([f43c374](https://github.com/aklinker1/job-queue/commit/f43c374))

### 🏡 Chore

- Fix publish task ([378ad31](https://github.com/aklinker1/job-queue/commit/378ad31))
- Add changelog ([5866c0d](https://github.com/aklinker1/job-queue/commit/5866c0d))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))

## v0.1.1

[compare changes](https://undefined/aklinker1/job-queue/compare/v0.1.0...v0.1.1)

### 🚀 Enhancements

- Simple single process job queue + basic monitoring UI ([0796163](https://undefined/aklinker1/job-queue/commit/0796163))
- Simple single process job queue + basic monitoring UI ([e7558b7](https://undefined/aklinker1/job-queue/commit/e7558b7))

### 📖 Documentation

- Add missing jsdoc ([52a4b9d](https://undefined/aklinker1/job-queue/commit/52a4b9d))

### 🏡 Chore

- Fix publish task ([358b280](https://undefined/aklinker1/job-queue/commit/358b280))
- Fix include/exclude for JSR ([abbad55](https://undefined/aklinker1/job-queue/commit/abbad55))
- Fix publish task ([381ba43](https://undefined/aklinker1/job-queue/commit/381ba43))
- Fix include/exclude for JSR ([45e8d82](https://undefined/aklinker1/job-queue/commit/45e8d82))
- Delete bun-sqlite persister ([c522550](https://undefined/aklinker1/job-queue/commit/c522550))
- Update publish task ([4779f6f](https://undefined/aklinker1/job-queue/commit/4779f6f))
- Update publish script ([bc2f131](https://undefined/aklinker1/job-queue/commit/bc2f131))
- Fix publish script ([8a8d393](https://undefined/aklinker1/job-queue/commit/8a8d393))
- Remove unused import ([eed92ed](https://undefined/aklinker1/job-queue/commit/eed92ed))

### ❤️ Contributors

- Aaron ([@aklinker1](http://github.com/aklinker1))