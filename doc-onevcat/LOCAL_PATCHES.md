# Local Patches Maintenance Guide

This document describes all local patches maintained in this fork and provides guidance for future maintenance, especially when syncing with upstream.

## Quick Reference

| Commit Message Pattern | Files | Conflict Risk | Rebase Difficulty |
|------------------------|-------|---------------|-------------------|
| `feat(desktop): add CJK IME punctuation workaround` | Terminal.tsx, helpers.ts | **Medium** | May need manual merge |
| `chore(desktop): personal terminal preferences` | config.ts | Low | Usually auto-resolves |
| `feat(desktop): add kanagawa-bones theme` | index.ts, kanagawa-bones.ts | Low | Usually auto-resolves |
| `chore: add SKIP_ENV_VALIDATION to turbo` | turbo.jsonc | Low | Usually auto-resolves |

---

## Patch Details

### 1. CJK IME Punctuation Workaround

**Purpose:** Fix fullwidth punctuation input for IMEs like Rime that don't trigger `keyCode: 229` for punctuation.

**Files Modified:**
- `apps/desktop/src/renderer/.../Terminal/helpers.ts`
  - Added `HALFWIDTH_TO_FULLWIDTH_PUNCTUATION` mapping
  - Added `markIMEActive()` / `isIMELikelyActive()` functions
  - Modified `setupKeyboardHandler()` to intercept punctuation
- `apps/desktop/src/renderer/.../Terminal/Terminal.tsx`
  - Added `compositionend` event listener

**Conflict Likelihood:** Medium
- `helpers.ts` modifies the beginning of `setupKeyboardHandler()` function
- If upstream modifies this function, manual merge may be needed

**Rebase Guide:**
```bash
# If conflict in helpers.ts setupKeyboardHandler():
# 1. Keep upstream changes to the function signature and other logic
# 2. Ensure these blocks are present at the START of the handler function:

# Block 1: IME pass-through (must be first)
if (event.keyCode === 229 || event.isComposing) {
    return true;
}

# Block 2: CJK punctuation conversion (after IME check)
if ((event.type === "keydown" || event.type === "keypress") && isIMELikelyActive() && ...) {
    // ... conversion logic
}
```

**Related Documentation:** [cjk-ime-punctuation-workaround.md](./cjk-ime-punctuation-workaround.md)

**Upstream Issue:** https://github.com/xtermjs/xterm.js/issues/5348

---

### 2. Personal Terminal Preferences

**Purpose:** Custom font and size settings.

**Files Modified:**
- `apps/desktop/src/renderer/.../Terminal/config.ts`
  - Added "Maple Mono NF CN" to font family list (first priority)
  - Changed fontSize from 14 to 13

**Conflict Likelihood:** Low
- Simple value changes in a config file
- If upstream changes these values, just re-apply our preferences

**Rebase Guide:**
```bash
# If conflict in config.ts:
# Simply ensure these values are set:
const TERMINAL_FONT_FAMILY = [
    "Maple Mono NF CN",  // <-- Add this as first item
    # ... rest of upstream list
];

export const TERMINAL_OPTIONS: ITerminalOptions = {
    fontSize: 13,  // <-- Change from upstream default (14) to 13
    # ... rest unchanged
};
```

---

### 3. Kanagawa-Bones Theme

**Purpose:** Custom color theme.

**Files Modified:**
- `apps/desktop/src/shared/themes/built-in/kanagawa-bones.ts` (new file)
- `apps/desktop/src/shared/themes/built-in/index.ts` (import and export added)

**Conflict Likelihood:** Low
- New file won't conflict
- `index.ts` changes are additive (import + array item + export)

**Rebase Guide:**
```bash
# If conflict in index.ts:
# 1. Add import at top:
import { kanagawaBonesTheme } from "./kanagawa-bones";

# 2. Add to builtInThemes array:
export const builtInThemes: Theme[] = [
    # ... existing themes
    kanagawaBonesTheme,  // <-- Add this
];

# 3. Add to exports:
export { ..., kanagawaBonesTheme };
```

---

### 4. Turbo Config

**Purpose:** Add `SKIP_ENV_VALIDATION` to global environment passthrough.

**Files Modified:**
- `turbo.jsonc`

**Conflict Likelihood:** Low
- Additive change to an array

**Rebase Guide:**
```bash
# If conflict in turbo.jsonc globalEnv:
# Add "SKIP_ENV_VALIDATION" to the array
```

---

## Repository Structure

```
origin   → git@github.com:onevcat/superset.git      (your fork)
upstream → https://github.com/superset-sh/superset.git (official repo)
```

All local patches are committed to `main` branch. We use **rebase** (not merge) to keep local commits on top of upstream changes.

---

## Upstream Sync Procedure

### Pre-flight Check

```bash
# Verify remotes are configured correctly
git remote -v
# Should show:
# origin   git@github.com:onevcat/superset.git (fetch/push)
# upstream https://github.com/superset-sh/superset.git (fetch/push)

# Check current branch
git branch --show-current
# Should be: main

# Ensure working directory is clean
git status
# Should show no uncommitted changes
```

### Step-by-Step Sync Process

```bash
# Step 1: Fetch upstream changes
git fetch upstream

# Step 2: Preview what's coming
git log --oneline HEAD..upstream/main | head -30
# This shows commits in upstream that we don't have

# Step 3: Check which of our local patches will be rebased
git log --oneline upstream/main..HEAD
# These are our local commits that will be replayed

# Step 4: Perform the rebase
git rebase upstream/main

# Step 5: If NO conflicts - you're done! Skip to Step 7.
# If conflicts occur, continue to Step 6.
```

### Step 6: Resolving Conflicts

```bash
# See which files have conflicts
git status

# For each conflicted file:
# 1. Open the file and look for conflict markers:
#    <<<<<<< HEAD
#    (upstream version)
#    =======
#    (your version)
#    >>>>>>> your-commit-message

# 2. Refer to the "Patch Details" section in this document
#    for guidance on how each patch should look

# 3. Edit the file to resolve conflicts

# 4. Mark as resolved
git add <resolved-file>

# 5. Continue rebase
git rebase --continue

# Repeat until all conflicts are resolved
```

### Step 7: Verify and Push

```bash
# Test the build
bun install
bun run build

# Run type check
bun run typecheck

# Test affected features manually:
# - Open terminal, type Chinese characters, then punctuation
# - Check custom theme appears in theme list

# Push to your fork (force push required after rebase)
git push origin main --force-with-lease
```

### Quick Reference Commands

```bash
# === NORMAL SYNC (no conflicts expected) ===
git fetch upstream && git rebase upstream/main && git push origin main --force-with-lease

# === CHECK UPSTREAM CHANGES ===
git fetch upstream && git log --oneline HEAD..upstream/main

# === SEE LOCAL PATCHES ===
git log --oneline upstream/main..HEAD
# Or search by marker:
git log --oneline --grep="LOCAL PATCH"

# === ABORT REBASE IF THINGS GO WRONG ===
git rebase --abort
```

---

## Emergency Procedures

### Abort Failed Rebase

```bash
git rebase --abort
# Returns to exact state before rebase started
```

### Reset to Known Good State

```bash
# Find the commit hash before rebase
git reflog
# Look for entries like "rebase (start)" and find the commit before it

# Reset to that commit
git reset --hard <commit-hash>
```

### Start Fresh from Upstream

If everything is broken, you can recreate local patches:

```bash
# 1. Save current branch
git branch backup-main

# 2. Reset main to upstream
git checkout main
git reset --hard upstream/main

# 3. Cherry-pick local patches from backup
git log --oneline backup-main  # Find your local commits
git cherry-pick <commit-hash>  # Apply each one

# 4. Or manually reapply patches following this document
```

### Export Patches as Files (Backup Method)

```bash
# Export all local patches to files
git format-patch upstream/main -o doc-onevcat/patches/

# Later, apply patches to a fresh upstream
git reset --hard upstream/main
git am doc-onevcat/patches/*.patch
```

---

## Commit Message Convention

All local patches should include `[LOCAL PATCH]` marker:

```
feat(desktop): add CJK IME punctuation workaround

<description>

[LOCAL PATCH - may need manual rebase after upstream sync]
```

This makes it easy to identify local changes:

```bash
git log --oneline --grep="LOCAL PATCH"
```

---

## Future Improvements

1. **Monitor upstream xterm.js** for IME fix - if [#5348](https://github.com/xtermjs/xterm.js/issues/5348) is resolved, we may be able to remove our workaround

2. **Consider config externalization** - move personal preferences to a separate `config.local.ts` file to reduce conflicts

3. **Theme as separate package** - consider moving custom themes to a separate location that won't conflict

---

## Checklist After Each Upstream Sync

- [ ] Build succeeds (`bun run build`)
- [ ] Terminal opens without errors
- [ ] CJK punctuation input works (type Chinese, then `,` `.`)
- [ ] Custom theme appears in theme selector
- [ ] Font rendering looks correct (Maple Mono NF CN)
