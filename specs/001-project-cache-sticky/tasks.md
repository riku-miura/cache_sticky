# Tasks: Cache Sticky Web Application

**Input**: Design documents from `/home/riku-miura/project/cache_sticky/specs/001-project-cache-sticky/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → ✅ Found: TypeScript + Vite + Cache API + Jest + Playwright
2. Load optional design documents:
   → ✅ data-model.md: StickyNote entity → model tasks
   → ✅ contracts/: cache-api.interface.ts → contract test task
   → ✅ research.md: Vite + TDD decisions → setup tasks
3. Generate tasks by category:
   → ✅ Setup: Vite project, TypeScript, ESLint, Prettier
   → ✅ Tests: contract tests, integration tests for user journeys
   → ✅ Core: StickyNote model, CacheService, WhiteboardService, UI components
   → ✅ Integration: Cache API integration, DOM manipulation
   → ✅ Polish: unit tests, performance tests, documentation
4. Apply task rules:
   → ✅ Different files = marked [P] for parallel
   → ✅ Same file = sequential (no [P])
   → ✅ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → ✅ All contracts have tests
   → ✅ All entities have models
   → ✅ All user scenarios have integration tests
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths follow plan.md structure decision (Option 1: Single project)

## Phase 3.1: Setup
- [ ] T001 Create project structure with src/, tests/, public/ directories
- [ ] T002 Initialize TypeScript project with Vite bundler and package.json dependencies
- [ ] T003 [P] Configure ESLint and Prettier with TypeScript rules
- [ ] T004 [P] Setup Jest configuration for unit tests in jest.config.js
- [ ] T005 [P] Setup Playwright configuration for e2e tests in playwright.config.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T006 [P] Contract test for CacheService interface in tests/contract/test_cache_service.test.ts
- [ ] T007 [P] Contract test for WhiteboardService interface in tests/contract/test_whiteboard_service.test.ts
- [ ] T008 [P] Contract test for UIEventHandlers interface in tests/contract/test_ui_handlers.test.ts
- [ ] T009 [P] Integration test for note creation flow in tests/integration/test_note_creation.test.ts
- [ ] T010 [P] Integration test for note persistence in tests/integration/test_note_persistence.test.ts
- [ ] T011 [P] Integration test for cache clearing behavior in tests/integration/test_cache_clearing.test.ts
- [ ] T012 [P] E2E test for complete user journey in tests/e2e/test_user_journey.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T013 [P] StickyNote model with validation in src/models/StickyNote.ts
- [ ] T014 [P] Cache API error classes in src/models/CacheErrors.ts
- [ ] T015 CacheService implementation in src/services/CacheService.ts
- [ ] T016 WhiteboardService implementation in src/services/WhiteboardService.ts
- [ ] T017 [P] StickyNote UI component in src/components/StickyNote.ts
- [ ] T018 [P] NewNoteButton UI component in src/components/NewNoteButton.ts
- [ ] T019 [P] Whiteboard UI component in src/components/Whiteboard.ts
- [ ] T020 Main application entry point in src/main.ts
- [ ] T021 HTML template with whiteboard container in public/index.html
- [ ] T022 CSS styles for notes and whiteboard in src/styles/main.css

## Phase 3.4: Integration
- [ ] T023 Integrate Cache API with browser feature detection in src/services/CacheService.ts
- [ ] T024 Wire up DOM event handlers in src/main.ts
- [ ] T025 Implement input validation and sanitization in src/services/WhiteboardService.ts
- [ ] T026 Add error handling and user feedback messages in src/components/Whiteboard.ts

## Phase 3.5: Polish
- [ ] T027 [P] Unit tests for StickyNote model in tests/unit/test_sticky_note.test.ts
- [ ] T028 [P] Unit tests for validation functions in tests/unit/test_validation.test.ts
- [ ] T029 [P] Performance tests for 100+ notes in tests/performance/test_performance.test.ts
- [ ] T030 [P] Update README.md with setup and usage instructions
- [ ] T031 Add TypeScript type definitions for window.caches in src/types/globals.d.ts
- [ ] T032 Run quickstart.md validation scenarios manually

## Dependencies
- Setup (T001-T005) before everything
- Tests (T006-T012) before implementation (T013-T026)
- T013-T014 (models) before T015-T016 (services)
- T015-T016 (services) before T017-T019 (components)
- T017-T022 (components) before T023-T026 (integration)
- Implementation before polish (T027-T032)

## Parallel Example
```bash
# Launch T006-T012 together (all test files):
Task: "Contract test for CacheService interface in tests/contract/test_cache_service.test.ts"
Task: "Contract test for WhiteboardService interface in tests/contract/test_whiteboard_service.test.ts"
Task: "Contract test for UIEventHandlers interface in tests/contract/test_ui_handlers.test.ts"
Task: "Integration test for note creation flow in tests/integration/test_note_creation.test.ts"
Task: "Integration test for note persistence in tests/integration/test_note_persistence.test.ts"
Task: "Integration test for cache clearing behavior in tests/integration/test_cache_clearing.test.ts"
Task: "E2E test for complete user journey in tests/e2e/test_user_journey.spec.ts"

# Launch T013-T014 together (model files):
Task: "StickyNote model with validation in src/models/StickyNote.ts"
Task: "Cache API error classes in src/models/CacheErrors.ts"

# Launch T017-T019 together (component files):
Task: "StickyNote UI component in src/components/StickyNote.ts"
Task: "NewNoteButton UI component in src/components/NewNoteButton.ts"
Task: "Whiteboard UI component in src/components/Whiteboard.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task or logical group
- Follow Constitution: 90% test coverage, TDD, TypeScript strict mode
- Cache API usage must demonstrate educational value

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - cache-api.interface.ts → 3 contract test tasks [P] (CacheService, WhiteboardService, UIEventHandlers)
   - Each interface → implementation task

2. **From Data Model**:
   - StickyNote entity → model creation task [P]
   - Error classes → separate model task [P]

3. **From User Stories** (quickstart.md):
   - Note creation → integration test [P]
   - Persistence → integration test [P]
   - Cache clearing → integration test [P]
   - Complete journey → e2e test [P]

4. **Ordering**:
   - Setup → Tests → Models → Services → Components → Integration → Polish
   - TDD enforced: all tests before any implementation

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (T006-T008)
- [x] All entities have model tasks (T013-T014)
- [x] All tests come before implementation (T006-T012 before T013+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task