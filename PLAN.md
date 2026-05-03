# Time Lens — Modernization Plan

## Context

The repo currently contains a single artifact: `Calendrical Calculator.mht` — a 2006-era Holger Oertel calculator (based on Reingold/Dershowitz's classic algorithms) saved as an MHTML archive. It's a working but dated tool: form-per-calendar UI, results emitted to a popup window, IE/Netscape branching, no arithmetic, no holidays, no NL input, no extensibility.

The math inside is **excellent and reusable**: 11 calendars converted via a Julian Date pivot, with rigorous leap rules, Hebrew Molad arithmetic, Mayan Long Count + Tzolkin/Haab, Roman Kalends/Nones/Ides, and date-validity ranges per system. We are **not** doing a UI reskin — we're rebuilding it as a product (**"Time Lens"**) where the legacy algorithms become a clean, deterministic, testable engine and the UI becomes a modern, explainable, AI-flavored experience.

---

## Step 1 — System Understanding (extracted from legacy file)

**Pivot representation:** Julian Date (JD), a continuous integer day count. Every calendar provides `jd_from_X()` and `X_from_jd()`. All math goes through this pivot.

**Calendars supported (11):**

| # | Calendar | Epoch (JD) | Notes |
|---|---|---|---|
| 0 | Gregorian | — | Valid >= 15 Oct 1582 |
| 1 | Julian | — | Valid >= 1 Jan 8 CE |
| 2 | Roman | — | Kalends/Nones/Ides notation, AUC year |
| 3 | Hebrew | 347998 | 19-year Metonic cycle, 6 year-shapes, Molad math |
| 4 | Islamic | 1948440 | 30-year cycle, 11 leap years per cycle |
| 5 | Coptic | 1824665 | 12x30 + 5 epagomenal, leap every 4y |
| 6 | Julian Date | — | Used as internal pivot |
| 7 | French Revolutionary | 2375475 | 12x30 + 5/6 sansculottides |
| 8 | Mayan Long Count | 584283 | + Tzolkin (260) + Haab (365) |
| 9 | Ancient Egyptian | — | 365-day, no leap, 3 seasons |
| 10 | "OF" calendar | — | Fictional/pedagogical — drop |
| 11 | Day-of-week | — | Derived |

**Operations:** single date in -> all 11 representations out. **Nothing else.** No arithmetic, no holidays, no ranges, no astronomy, no batch.

**Edge cases handled:** Gregorian/Julian leap rules, Hebrew variable year length (6 shapes via `jmd0..jmd5`), Islamic 30-year leap pattern, Mayan validity window, Roman leap-day duplication ("ante diem bis VI Kal. Mar."), pre-epoch suppression, italicized "out-of-range but computable" output.

**Gaps to fill in modern product:** Persian, Bahai, Ethiopic, ISO 8601 week date, Chinese; date arithmetic; business days; holidays; natural-language input; explainability; batch; sharing.

---

## Step 2 — Core Capabilities (product surface)

1. **Universal conversion** — any date in any supported calendar -> all others, instantly.
2. **Date arithmetic** — add/subtract days, weeks, months, years; "next Tuesday after X"; difference between two dates expressed in multiple units.
3. **Business-day logic** — skip weekends; pluggable holiday calendars per region (US, UK, IN, IL, SA...); "5 business days from today" / "deadline minus 10 working days".
4. **Holidays & observances** — derived per calendar: Easter (Computus), Passover, Eid al-Fitr/Adha, Diwali, Chinese New Year. Day-of-week, ISO week number, day-of-year, days-until-X.
5. **Edge-case surfacing** — leap day, month-end clamp ("Jan 31 + 1 month = Feb 28/29?"), Gregorian gap (Oct 5–14, 1582), Hebrew leap year with Adar I/II, calendar pre-epoch warnings.
6. **Natural-language input** — "two fridays from now", "100 days before my birthday", "what's 5 Iyar 5785 in Gregorian".
7. **Explainability** — every result ships with a step-by-step trace ("Gregorian -> JD 2460800 via formula X -> Hebrew year 5786 because JD >= new_year(5786)...").
8. **Shareable permalinks** — entire query state encoded in URL hash; no backend.
9. **Batch / CSV** — paste a column of dates, get a converted column back.

---

## Step 3 — UI/UX Design

**Aesthetic:** Notion/Linear — generous whitespace, mono for dates, subtle borders, single accent color, dark mode first, no chrome.

### Layout — single-page workspace

```
+--------------------------------------------------------------+
|  Time Lens                              Cmd-K  theme  ?  cog |  Top bar
+--------------------------------------------------------------+
|                                                              |
|   +------------------------------------------------------+   |
|   |  > "5 business days after my birthday"           Ret |   |  Smart input
|   +------------------------------------------------------+   |  (always at top)
|                                                              |
|   +---------------------+    +--------------------------+    |
|   | INPUT               |    | RESULTS                  |    |
|   |                     |    |                          |    |
|   | Calendar: Gregorian |    | Gregorian  03 May 2026   |    |  Dual-pane
|   | Date    : 2026-05-03|--> | Julian     20 Apr 2026   |    |  conversion
|   | + add operation     |    | Hebrew     15 Iyar 5786  |    |
|   |                     |    | Islamic    15 Dhu-l-Q... |    |
|   |                     |    | Persian    13 Ordibehe...|    |
|   |                     |    | ISO Week   2026-W18-7    |    |
|   +---------------------+    +--------------------------+    |
|                                                              |
|   --------------  TIMELINE  --------------                   |
|                                                              |
|   o-------------o--------------o------------o                |  Operation
|   Today      +30 days       skip wknd    May 3, 2026         |  timeline
|   Apr 3      May 3 (Sun)    May 4 (Mon)                      |
|                                                              |
|   v How this was calculated  (3 steps)                       |  Explainable
|                                                              |  trace
+--------------------------------------------------------------+
```

### Key screens / modes

1. **Convert** (default) — input one date, see all calendars side-by-side.
2. **Calculate** — chain operations (`+30d`, `skip weekends`, `next holiday`); each step renders as a pill on a horizontal timeline.
3. **Compare** — two dates -> difference in days/weeks/months/business-days/Hebrew months/etc.
4. **Batch** — textarea / CSV upload -> table output -> CSV download.
5. **Command palette (Cmd-K)** — fuzzy switch calendars, jump to today, share, toggle theme.

### Component hierarchy

```
<App>
  <TopBar>                    Cmd-K palette, theme, help
  <SmartInput>                NL parser -> structured query
  <Workspace>
    <QueryPanel>              Calendar select + date fields + ops list
      <CalendarPicker/>
      <DateField/>            One per calendar (renders correct sub-fields)
      <OperationList>
        <OperationPill/>      add/sub/skip-weekend/next-holiday
    <ResultsPanel>
      <CalendarRow/>          One per target calendar; click -> make it input
      <EdgeCaseBadge/>        "Leap year", "Month-end clamp", "Gregorian gap"
    <Timeline/>               Horizontal ops trail with intermediate dates
    <ExplainTrace/>           Collapsible, numbered reasoning steps
  <ShareBar>                  Permalink, copy-as-text, export CSV
```

---

## Step 4 — Data Model (JSON, extensible)

```ts
// A date in any calendar — discriminated by `calendar`
type CalendarDate = {
  calendar: "gregorian" | "julian" | "hebrew" | "islamic" | "persian"
          | "coptic" | "ethiopic" | "french-rev" | "mayan-lc"
          | "egyptian" | "iso-week" | "roman" | "jd";
  fields: Record<string, number | string>;   // e.g. {y:2026, m:5, d:3} or {baktun:13,...}
};

// A query = input date + zero or more operations
type Query = {
  input: CalendarDate;
  operations: Operation[];
  outputCalendars?: string[];                // default: all
  rules?: RuleSet;
};

type Operation =
  | { kind: "add" | "sub"; amount: number; unit: "day" | "week" | "month" | "year" | "business-day" }
  | { kind: "skip"; what: "weekend" | "holiday" }
  | { kind: "next" | "prev"; target: "weekday:mon..sun" | "month-end" | "holiday:<id>" }
  | { kind: "diff"; other: CalendarDate; in: "day" | "week" | "month" | "business-day" }
  | { kind: "convert"; to: string };         // explicit single-target conversion

type RuleSet = {
  weekStart?: "mon" | "sun";
  weekend?: ("mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun")[];   // Israel/SA differ
  holidayCalendar?: "us" | "uk" | "in" | "il" | "sa" | "none";
  monthEndPolicy?: "clamp" | "overflow";                       // Jan 31 + 1mo
};

// Result returned by the engine
type Result = {
  dates: Record<string, CalendarDate>;       // one per outputCalendar
  jd: number;                                // pivot
  dayOfWeek: 0..6;
  flags: EdgeCaseFlag[];                     // {kind:"leap-year", calendar:"gregorian"} etc.
  trace: TraceStep[];                        // for ExplainTrace
};

type TraceStep = { id: string; description: string; from: any; to: any; rule?: string };
```

**Extensibility:** A new calendar = one module exporting `{ id, fields, jdFrom, fromJd, validate, format }`. Engine auto-discovers via registry.

---

## Step 5 — Engine Design

**Principles:** pure TypeScript, zero runtime deps, deterministic, fully unit-testable, explainable by construction.

```
src/engine/
  pivot.ts                  // JD <-> JS Date helpers; ZERO floating point in calendar math
  registry.ts               // Map<id, CalendarAdapter>
  calendars/
    gregorian.ts            // ports legacy jd_from_greg / greg_from_jd
    julian.ts
    hebrew.ts               // ports molad / new_year / jmd0..jmd5
    islamic.ts
    persian.ts              // NEW — 33-year cycle (Birashk algorithm)
    coptic.ts
    ethiopic.ts             // NEW — same shape as Coptic, different epoch
    french-rev.ts
    mayan.ts                // long-count + tzolkin + haab
    egyptian.ts
    iso-week.ts             // NEW
    roman.ts
  operations/
    arithmetic.ts           // add/sub days, weeks, months, years
    business.ts             // skip-weekend / skip-holiday with pluggable RuleSet
    holidays/
      easter.ts             // Computus (Anonymous Gregorian algorithm)
      jewish.ts             // Pesach, Rosh Hashanah from Hebrew adapter
      islamic.ts            // Eid al-Fitr/Adha from Islamic adapter
      regional/{us,uk,in,il,sa}.ts
  edgecases.ts              // detectors: leap, month-end, Gregorian-gap, pre-epoch
  trace.ts                  // TraceStep builder with structured templates
  index.ts                  // run(query: Query): Result
```

**Algorithm pattern (every calendar):**

```ts
interface CalendarAdapter<F> {
  id: string;
  schema: FieldSchema;                       // for UI generation
  toJD(fields: F, trace?: TraceCollector): number;
  fromJD(jd: number, trace?: TraceCollector): F;
  validRange?: { minJD: number; maxJD: number };
  format(fields: F, locale?: string): string;
}
```

Trace is built **inside the adapter** so each formula step is self-described — no separate explainer that could drift from real math.

**Determinism:** All math is integer arithmetic on JD. Locale only affects formatting. Same input -> same output, always. Snapshot tests against legacy file's own outputs guarantee parity.

**Natural-language layer:** Thin shell over `chrono-node` for English temporal parsing, post-processed into a `Query`. NL is a *front-end translator*, never a math input — the engine never sees free text. (Optional v2: small LLM call for ambiguous phrasing, but strictly returns structured `Query` JSON, validated before execution.)

---

## Step 6 — React Implementation

**Stack (recommended):**

- **Vite + React 18 + TypeScript**
- **Tailwind CSS + shadcn/ui** (Radix primitives) — Notion/Linear feel, zero runtime cost. (Prefer this over MUI: lighter, more design-control, current React community default.)
- **Zustand** for app state (one store, ~5 slices) — simpler than Redux, more structured than Context.
- **chrono-node** for NL parsing.
- **date-fns** *only* for display formatting & timezone helpers; never for calendrical math.
- **lucide-react** for icons.
- **@tanstack/react-table** for batch view.
- **vitest + @testing-library/react** for tests.

**State slices (Zustand):**

- `querySlice` — current `Query` (input + operations + rules)
- `resultSlice` — last `Result` (memoized)
- `historySlice` — recent queries (for Cmd-K)
- `uiSlice` — theme, panel collapsed states
- `settingsSlice` — region defaults, holiday calendar, week start

**Reusable components:**

- `<DateField calendar="hebrew" value={..} onChange={..}/>` — auto-renders correct sub-fields by reading the adapter's `schema`.
- `<CalendarRow date={..} highlighted={..}/>` — one row of the results panel.
- `<EdgeCaseBadge flag={..}/>` — colored chip with tooltip.
- `<TraceStep step={..}/>` — single line of the explain panel.
- `<OperationPill op={..} onEdit={..}/>` — draggable op in the timeline.

**Folder structure:**

```
time-lens/
  public/
  src/
    engine/                  (Step 5)
    nl/                      chrono-node wrapper, query builder
    components/              shadcn primitives + app components
      ui/                    (button, input, dialog — shadcn)
      DateField/
      CalendarRow/
      Timeline/
      ExplainTrace/
      CommandPalette/
    store/                   zustand slices
    pages/                   (Convert, Calculate, Compare, Batch)
    lib/                     url-hash codec, csv, formatters
    App.tsx
    main.tsx
  tests/
    engine/                  per-calendar unit tests + parity snapshots from legacy
    ui/
  legacy/
    Calendrical Calculator.mht   (kept as reference)
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
  README.md
```

---

## Step 7 — GitHub-Ready Setup

- **Vite scaffold:** `npm create vite@latest -- --template react-ts`
- **Hosting:** GitHub Pages from `gh-pages` branch (free, static, no backend needed since engine is client-side).
- **Vite config:** `base: "/time-lens/"` for project-page routing.
- **CI/CD (`.github/workflows/deploy.yml`):**
  - On push to `main` -> `npm ci && npm run build && npm test` -> deploy `dist/` via `peaceiris/actions-gh-pages@v3`.
- **Quality gates:** ESLint + Prettier + Husky pre-commit + `tsc --noEmit` in CI.
- **Repo top-level:**

  ```
  README.md            screenshots, demo link, "powered by Reingold/Dershowitz" credit
  LICENSE              MIT
  CONTRIBUTING.md      "add a calendar in 1 file" guide
  .github/workflows/   deploy.yml, ci.yml
  ```

---

## Step 8 — Phased Build Plan

### Phase 1 — Foundation (MVP, ~1 week)

- Vite + React + TS + Tailwind + shadcn scaffolding.
- Engine `pivot.ts` + `registry.ts` + Gregorian, Julian, Hebrew, Islamic, Mayan adapters ported 1:1 from legacy.
- Snapshot tests vs. legacy file outputs (parity gate).
- Single-screen UI: pick calendar -> enter date -> see all 11 conversions.
- Deploy to GitHub Pages.

### Phase 2 — Operations + Timeline (~1 week)

- `arithmetic.ts`, `business.ts`, basic `RuleSet`.
- Add Persian, ISO Week, Coptic, Ethiopic, Egyptian, Roman, French Rev. adapters.
- `<Timeline>` component with op pills.
- Easter + Passover + Eid al-Fitr/Adha computed; US/UK/IL holiday calendars.
- Cmd-K command palette.

### Phase 3 — Smart Input + Explainability (~1 week)

- `nl/` layer with chrono-node; "5 days from today", "next Tuesday".
- `trace.ts` wired into every adapter & operation.
- `<ExplainTrace>` collapsible panel.
- Edge-case detection + `<EdgeCaseBadge>` (leap year, month-end clamp, Gregorian gap).

### Phase 4 — Polish (~1 week)

- Compare + Batch screens.
- Permalink encoding (URL hash codec).
- Dark mode, motion polish, keyboard nav.
- Accessibility pass (WCAG AA, keyboard-only, screen reader labels for date fields).
- README with screenshots + GIF demo.

---

## Critical Files to Modify / Create

| Path | Purpose |
|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts` | Scaffold |
| `src/engine/pivot.ts` | JD pivot, integer math primitives |
| `src/engine/registry.ts` | Calendar adapter registry |
| `src/engine/calendars/*.ts` | One file per calendar (port from legacy) |
| `src/engine/operations/*.ts` | add/sub/skip/holiday logic |
| `src/engine/edgecases.ts`, `trace.ts` | Edge detection + structured trace |
| `src/nl/parse.ts` | chrono-node -> `Query` |
| `src/components/{DateField,CalendarRow,Timeline,ExplainTrace,CommandPalette}/` | UI |
| `src/store/*.ts` | Zustand slices |
| `tests/engine/parity.test.ts` | Snapshots from legacy MHT outputs |
| `.github/workflows/deploy.yml` | GH Pages CI/CD |
| `legacy/Calendrical Calculator.mht` | Move existing file here for reference |

## Reusable Logic from the Legacy File

These are the formulas to **port verbatim** (not rewrite) into TS — they're correct and battle-tested:

- `jd_from_greg` / `greg_from_jd` -> `engine/calendars/gregorian.ts`
- `jd_from_julian` / `julian_from_jd` -> `engine/calendars/julian.ts`
- `molad`, `new_year`, `elapsed_time235`, `elapsed_time19`, `dhp_mult`, `dhp_add`, `index_from_length`, `jmd0..jmd5` -> `engine/calendars/hebrew.ts`
- `jd_from_islamic` / `islamic_from_jd` (with the 30-year rem30 leap table) -> `engine/calendars/islamic.ts`
- `jd_from_french` / `french_from_jd` -> `engine/calendars/french-rev.ts`
- `jd_from_coptic` / `coptic_from_jd` -> both `coptic.ts` and (with epoch swap) `ethiopic.ts`
- `long_count_from_jd`, `tzolkin_from_jd` -> `engine/calendars/mayan.ts`
- `egyptian_from_jd` (incl. season labelling) -> `engine/calendars/egyptian.ts`
- `roman_date_from_julian` -> `engine/calendars/roman.ts`
- Validity ranges (Gregorian >= 1582-10-15, Islamic >= JD 1948440, Mayan JD in [584283, 58184282], etc.) -> `edgecases.ts`

**Drop:** "OF" calendar (fictional/pedagogical), browser-detection branching, document.writeln output, popup-window result rendering.

---

## Verification

1. **Engine parity:** Pick 50 reference dates (incl. Gregorian gap, Hebrew leap, Islamic year boundary, Mayan epoch). Run them through the original MHT (open in browser) **and** the new engine. Snapshot diff must be zero. Lives in `tests/engine/parity.test.ts`.
2. **Unit tests per calendar:** Round-trip — `fromJD(toJD(x)) === x` for 10 000 random fields per calendar.
3. **Operation tests:** "Jan 31 + 1 month" with `clamp` -> Feb 28/29; with `overflow` -> Mar 3. "5 business days from Friday" -> next Friday. Easter 2024 = Mar 31. Passover 5785 1 = April 13, 2025.
4. **NL fuzz:** 30 phrases covering "tomorrow", "next Tuesday", "100 days ago", "5 business days after my birthday", non-English mixed input -> expected `Query`.
5. **End-to-end:** `npm run dev` -> enter `2026-05-03` -> verify all 11 calendars match legacy file output side-by-side.
6. **Deploy smoke:** Merge to `main` -> GH Pages URL renders -> Cmd-K opens -> conversion works -> permalink round-trips.
