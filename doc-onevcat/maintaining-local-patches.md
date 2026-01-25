# Maintaining Local Patches

This document describes the strategy for maintaining local customizations while staying in sync with upstream.

## Our Local Changes

### 1. CJK IME Punctuation Workaround (Feature)
- **Files:** `Terminal.tsx`, `helpers.ts`
- **Conflict risk:** Medium - modifies `setupKeyboardHandler` function
- **Strategy:** Changes are additive (new functions, new code blocks)

### 2. Personal Preferences (Config)
- **Files:** `config.ts`, `env.ts`
- **Changes:** Font family, font size, environment variables
- **Conflict risk:** Low - simple value changes

### 3. Custom Theme (Feature)
- **Files:** `themes/built-in/index.ts`, `kanagawa-bones.ts`
- **Conflict risk:** Low - additive changes

### 4. Build Config
- **Files:** `turbo.jsonc`
- **Changes:** `SKIP_ENV_VALIDATION`
- **Conflict risk:** Low - additive

## Recommended Strategy: Rebase-based Workflow

### Setup

```bash
# Add upstream remote (if not already)
git remote add upstream <upstream-repo-url>

# Create a branch for local patches
git checkout -b local-patches main
```

### Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Rebase local-patches onto upstream/main
git checkout local-patches
git rebase upstream/main

# Resolve conflicts if any, then continue
git rebase --continue
```

### Tips to Minimize Conflicts

1. **Keep changes isolated:** Each patch should modify as few lines as possible in existing functions

2. **Prefer additive changes:**
   - Add new functions instead of modifying existing ones
   - Add new files instead of modifying existing ones
   - Add new array elements at the end

3. **Use markers for easy identification:**
   ```typescript
   // [LOCAL] CJK IME workaround - start
   if (isIMELikelyActive()) { ... }
   // [LOCAL] CJK IME workaround - end
   ```

4. **Extract config to separate files:**
   - Instead of modifying `config.ts`, consider creating `config.local.ts`
   - Use TypeScript path aliases to override

5. **Consider patch files for complex changes:**
   ```bash
   # Generate patch
   git format-patch upstream/main --stdout > local-patches.patch

   # Apply patch after upstream sync
   git am local-patches.patch
   ```

## Alternative: Git Stash Workflow (Simpler)

For smaller changes:

```bash
# Before pulling upstream
git stash push -m "local customizations"

# Pull upstream
git pull upstream main

# Reapply local changes
git stash pop

# Resolve conflicts manually
```

## Current Patch Summary

| Change | Files | Risk | Notes |
|--------|-------|------|-------|
| IME Workaround | helpers.ts, Terminal.tsx | Medium | Core functionality |
| Font/Size | config.ts | Low | Simple values |
| ZSH env | env.ts | Low | Additive |
| Theme | index.ts, kanagawa-bones.ts | Low | Additive |
| Turbo | turbo.jsonc | Low | Additive |
