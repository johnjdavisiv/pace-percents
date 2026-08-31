# Decimal (.00) Button Implementation Plan

## Overview

Add a toggleable `.00` button to the pace input that reveals a decimal (tenths) dial, allowing input like `5:30.5` instead of just `5:30`. When disabled, the decimal is forced to zero. The result output and unit conversions must also handle decimals.

Reference implementation: `/Users/john/RW/race-pace-calculator/` (the `.00` button + `pace-decimal-container` pattern).

---

## 1. HTML Changes (`index.html`)

### A. Add decimal dial + .00 button inside the `.clock` div (after d3, before `</div><!-- end clock -->`)

```html
<!-- After the d3 digitbox, still inside .clock -->
<div class="dial-container hidden" id="decimal-container">
    <div class="digitbox colon">
        <span class="digit">.</span>
    </div>
    <div class="digitbox">
        <button class="material-icons svg-arrow" id="d4-up">expand_less</button>
        <div class="digit" id="d4">0</div>
        <button class="material-icons svg-arrow" id="d4-down">expand_more</button>
    </div>
</div>
```

### B. Add the .00 toggle button below the clock (inside `.pace-box`, after `.clock`)

```html
<div class="hh-00-container">
    <button class="hh-00-button is-disabled" id="decimal-toggle">.00</button>
</div>
```

Key HTML details borrowed from race-pace-calculator:
- `dial-container hidden` wraps the decimal period + digit so it can be shown/hidden as a unit
- `hh-00-button is-disabled` starts the button in its "off" state (grayed out with diagonal slash)

---

## 2. CSS Changes (`styles.css`)

### A. `.dial-container` — flex row to keep `.` and digit inline with the clock
```css
.dial-container {
    display: flex;
    flex-direction: row;
    align-items: center;
}
```

### B. `.hh-00-container` — layout wrapper for the .00 button
```css
.hh-00-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 0.5em;
}
```

### C. `.hh-00-button` — the circular toggle button itself
Ported from race-pace-calculator with minor simplification:
- Fixed-size circle (`1.95em` x `1.95em`, `border-radius: 50%`)
- Active (enabled) state: blue background (`#2196F3`), white text
- Disabled state (`.is-disabled`): gray background (`#e2e8f0`), reduced opacity
- Diagonal slash overlay via `::after` pseudo-element using a CSS gradient

### D. `.hidden` — already exists in `styles.css` as `display: none`; no change needed.

---

## 3. JavaScript Changes (`scripts.js`)

### A. New element references and event listeners (top of file, after d3 declarations)

```js
let d4 = document.querySelector("#d4");
const d4_up = document.querySelector('#d4-up');
const d4_down = document.querySelector('#d4-down');

d4_up.addEventListener('click', () => {
    increment_sec_digit(d4, 10, 1);
    updateResult();
});
d4_down.addEventListener('click', () => {
    increment_sec_digit(d4, 10, -1);
    updateResult();
});
```

The existing `increment_sec_digit(digit, limit, change)` already handles 0-9 wraparound with limit=10, so we reuse it as-is.

### B. .00 button toggle logic (new section, after the d4 listeners)

```js
const decimal_toggle = document.querySelector('#decimal-toggle');
const decimal_container = document.querySelector('#decimal-container');
let decimals_enabled = false;

decimal_toggle.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const wasDisabled = btn.classList.toggle('is-disabled');
    decimal_container.classList.toggle('hidden', wasDisabled);

    if (wasDisabled) {
        // Toggled OFF: force decimal to 0 (critical safety behavior)
        d4.textContent = 0;
        decimals_enabled = false;
    } else {
        decimals_enabled = true;
    }
    updateResult();
});
```

Core pattern from race-pace-calculator: `classList.toggle('is-disabled')` returns `true` when the class was added (i.e., button just became disabled). Zero out decimal on disable so user can't carry a hidden `.5`.

### C. Modify `updateResult()` — read decimal digit into pace calculation

Current code (line ~153):
```js
let current_input = parseInt(d1.textContent) + parseInt(d2.textContent + d3.textContent)/60
```

New code:
```js
let seconds = parseInt(d2.textContent + d3.textContent);
if (decimals_enabled) {
    seconds += parseInt(d4.textContent) / 10;
}
let current_input = parseInt(d1.textContent) + seconds / 60;
```

### D. Modify `updateResult()` — use decimal-aware output formatter

Current code (line ~179):
```js
new_string = decimal_pace_to_string(new_result)
```

New code:
```js
if (decimals_enabled) {
    new_string = decimal_pace_to_string_dec(new_result)
} else {
    new_string = decimal_pace_to_string(new_result)
}
```

`decimal_pace_to_string_dec` already exists and returns `"M:SS.d"` format. It already handles rollover edge cases like `59.96` -> roll up minutes. No changes needed to either formatter.

### E. Modify `parse_pace()` — handle optional decimal in pace strings

This is needed because `convertPace()` reads the result string from the DOM (which may now contain `.d`) and passes it to `parse_pace()` via the `convert_dict` functions.

Current code:
```js
function parse_pace(s){
    let pace_arr = s.split(':').map((si) => parseInt(si))
    return pace_arr[0] + pace_arr[1]/60
}
```

New code:
```js
function parse_pace(s){
    let parts = s.split(':');
    let minutes = parseInt(parts[0]);
    let sec_parts = parts[1].split('.');
    let seconds = parseInt(sec_parts[0]);
    let decimal = sec_parts.length > 1 ? parseInt(sec_parts[1]) / 10 : 0;
    return minutes + (seconds + decimal) / 60;
}
```

This handles both `"5:30"` and `"5:30.5"` correctly without needing to know whether decimals are enabled.

### F. Modify `convertPace()` — handle `0:` prefix stripping with decimals

Current code strips `"0:"` prefix for 400m splits:
```js
if (converted_pace.substring(0,2) === '0:') {
    converted_pace = converted_pace.substring(2);
}
```

This already works for both `"0:45"` -> `"45"` and `"0:45.3"` -> `"45.3"`, so no change needed here.

### G. Add `format_pace` helper and update `convert_dict` functions

**Problem:** The convert_dict functions currently hardcode which formatter to use — e.g. `/mi|/km` always uses `decimal_pace_to_string` (no decimals), `/mi|/400m` always uses `decimal_pace_to_string_dec` (always decimals). When decimals are enabled, a conversion like /mi → /km should also output decimals, but currently won't.

**Rule:**
- Decimals enabled → all pace-to-pace conversions output with decimals
- Decimals disabled → only /400m and /200m output with decimals (sub-minute splits need the precision)
- Speed conversions (mph, km/h, m/s) → `.toFixed()` already handles this, no change

**Solution:** Add a small helper that centralizes the formatting decision:

```js
function format_pace(dec_min, to_unit) {
    if (decimals_enabled || to_unit === '/400m' || to_unit === '/200m') {
        return decimal_pace_to_string_dec(dec_min);
    }
    return decimal_pace_to_string(dec_min);
}
```

Then update all pace-to-pace convert_dict entries to use it instead of calling the formatters directly. For example:

```js
'/mi|/km': function(pace_string) {
    let pace_dec = parse_pace(pace_string)
    let conv_dec = pace_dec / 1.609344
    return format_pace(conv_dec, '/km')
},
'/mi|/400m': function(pace_string) {
    let pace_dec = parse_pace(pace_string)
    let conv_dec = pace_dec / 1609.344 * 400
    return format_pace(conv_dec, '/400m')
},
```

The speed conversions (mph, km/h, m/s) keep using `.toFixed()` as before — no change needed.

---

## 4. Edge Cases to Watch

1. **Rollover: `5:59.6` where the decimal fraction >= 0.95** — `decimal_pace_to_string_dec` already handles this: when `pace_sec_decimal >= 0.95 && pace_sec_floor === 59`, it rolls minutes up and zeros seconds.

2. **0:00.0 input** — `updateResult()` already checks for `new_string === '0:00'` to show the emoji. We need to also check for `'0:00.0'` when decimals are enabled.

3. **Disabling .00 mid-use** — forcing `d4.textContent = 0` and `decimals_enabled = false` ensures the calculator reverts to whole-second behavior immediately.

4. **Unit conversion with mixed formats** — `parse_pace()` handles both `"5:30"` and `"5:30.5"` so conversions work regardless of when/how the result string was generated.

---

## 5. Stuff we are now moving on to do:  

- Cookie persistence of decimal setting
- "Reset to defaults" button
- These will come in a later task

---

## 6. Implementation Order (COMPLETED)

1. CSS first (`.dial-container`, `.hh-00-button`, `.hh-00-button.is-disabled`)
2. HTML (decimal dial + .00 button)
3. JS — new elements, listeners, toggle logic
4. JS — modify `updateResult()` for input reading + output formatting
5. JS — modify `parse_pace()` for decimal-aware string parsing
6. JS — add `format_pace()` helper and update `convert_dict` entries
7. JS — fix `0:00.0` edge case check
8. Manual testing of edge cases from section 4

---

## 7. Cookie State Persistence Plan

### Overview

Save calculator state to a cookie so returning visitors pick up where they left off. This cookie is **separate** from the existing `meeBannerClosed` cookie used for the book promotion banner.

Reference: race-pace-calculator uses a `racePaceCalc` cookie with JSON state, version field, saved on every `updateResult()` call, loaded on page init.

### A. State to Persist

Here is every piece of user-settable state, its current default (from HTML or JS), and where it lives:

| State | Default | Source |
|-------|---------|--------|
| d1 (minutes digit) | `5` | HTML `#d1` textContent |
| d2 (tens-of-seconds) | `0` | HTML `#d2` textContent |
| d3 (ones-of-seconds) | `0` | HTML `#d3` textContent |
| d4 (decimal tenths) | `0` | HTML `#d4` textContent |
| pct_int (percentage) | `95` | HTML `.percent-digits` textContent |
| decimals_enabled | `false` | JS variable, `.00` button starts `is-disabled` |
| checkbox (pace vs speed) | `checked` (= pace mode) | HTML `input[type="checkbox"]` checked attribute |
| flip mode (of vs is) | `of` (not flipped) | `.flip-button` has no `flipped` class initially |
| from_units_string | `''` (no selection) | No `.active` button in from-units |
| to_units_string | `''` (no selection) | No `.active` button in to-units |

### B. What NOT to persist

- The computed result (`pace-result` text) — derived from the above state
- The converted pace (`convert-res` text) — also derived
- Banner state — already has its own `meeBannerClosed` cookie

### C. Cookie Format

Following the race-pace-calculator pattern:

- **Cookie name:** `pacePercentsCalc` (distinct from `meeBannerClosed`)
- **Format:** JSON, URI-encoded
- **Expiration:** 365 days
- **Version field:** `version: 1` for future migration
- **Attributes:** `path=/; SameSite=Lax`

```js
{
    version: 1,
    dials: {
        d1: 5,      // minutes
        d2: 0,      // tens of seconds
        d3: 0,      // ones of seconds
        d4: 0       // decimal tenths
    },
    pct: 95,
    decimals_enabled: false,
    pace_mode: true,         // true = pace (checkbox checked), false = speed
    flip_mode: "of",         // "of" or "is"
    from_unit: "",           // "" or "/mi", "/km", "/400m", "/200m"
    to_unit: ""              // "" or "/mi", "/km", "/400m", "/200m", "mph", "km/h", "m/s"
}
```

### D. Saving — `saveStateToCookie()`

- Build the state object from current JS variables and DOM state
- JSON.stringify → encodeURIComponent → set cookie
- **Trigger:** Call at the end of `updateResult()`, same pattern as race-pace-calculator
- Also call when from/to unit buttons are clicked (since those don't always trigger `updateResult()`)

### E. Loading — `loadStateFromCookie()`

- Parse `document.cookie`, find `pacePercentsCalc`
- `decodeURIComponent` → `JSON.parse`
- Validate `version === 1`
- Return parsed object or `null`
- Wrap in try/catch for safety

### F. Applying state — `applyState(state)`

Applies a state object (from cookie or defaults) to the DOM and JS variables:

1. **Set dial textContent:** `d1.textContent = state.dials.d1`, etc.
2. **Set percentage:** `pct_int = state.pct; pct_text.textContent = state.pct`
3. **Set decimals:**
   - `decimals_enabled = state.decimals_enabled`
   - Toggle `is-disabled` class on `decimal_toggle` and `hidden` on `decimal_container`
4. **Set pace/speed checkbox:** `checkbox.checked = state.pace_mode`
   - Update the pace/speed text label accordingly
5. **Set flip mode:**
   - If `state.flip_mode === "is"`, add `flipped` class, update labels, and swap boxes
   - If `"of"`, ensure default state
6. **Set from/to unit buttons:**
   - Clear all `.active` classes
   - If `state.from_unit !== ""`, find matching button, add `.active`, call `setFromUnitText()`
   - Same for `state.to_unit` and `setToUnitText()`
7. **Call `updateResult()`** to compute and display the result from restored state

### G. Initialization flow — on DOMContentLoaded

```
1. Try loadStateFromCookie()
2. If cookie exists and is valid:
     → applyState(loaded_state)
3. If no cookie:
     → do nothing (HTML defaults are already correct)
     → just call updateResult() to ensure result text matches
```

The key insight: when there's no cookie, the HTML already has the right defaults baked in (d1=5, d2=0, d3=0, pct=95, etc.), so we don't need a separate `setDefaultState()` function. We just need to make sure `updateResult()` fires on load.

### H. Reset to defaults

Add a reset button (like race-pace-calculator's "Restore defaults"):
1. Call a `clearStateCookie()` function (set cookie expiration to past)
2. Call `location.reload()` — page reloads, finds no cookie, uses HTML defaults

**HTML — Reset button:** Add a reset row at the very bottom of the app, after `</div><!-- end app-content -->` and before the `<hr class="separator-thick">` divider:
```html
<div class="reset-box">
    <button class="material-icons flip-button" title="Restore defaults">history</button>
    <span class="reset-text">Restore defaults</span>
    <a href="#calculator-settings" class="i-note">?</a>
</div>
```

**HTML — Explainer section:** Add a new `<h2 id="calculator-settings">` section in the about-container, before the "Get updates" section. Text adapted from race-pace-calculator (minus custom distances mention):
```html
<h2 id="calculator-settings">Calculator settings<a class="material-icons up" href="#top">arrow_upward</a></h2>
<p>This calculator will remember your settings using a cookie. So, when you come back to the calculator later, you'll be able to pick up where you left off. You can reset all settings to their defaults using the <span class="material-icons inline-icon">history</span> button.</p>
```

**CSS:** Port the following from race-pace-calculator:

```css
.reset-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1em;
    padding-top: 1em;
}

.reset-text {
    font-size: 1.1em;
    color: #6b7280;
}

.reset-box button {
    color: #6b7280;
}
```

Note: race-pace-calculator uses `var(--gray-out)` for the color but pace-percents doesn't have CSS variables, so we use the literal `#6b7280`.

The reset button uses the existing `.flip-button` class, which already has a `:hover` rule inside `@media (hover: hover)`. The `.i-note` `?` button also already has hover styling. The `.hh-00-button` hover is also already defined. So no additional hover rules needed.

The `<span class="material-icons inline-icon">history</span>` in the explainer text also already has styling via `.material-icons.inline-icon` (sets `font-size: 1em`).

### I. Implementation Order

1. Add default constants at top of scripts.js (for documentation, used by reset)
2. Add `saveStateToCookie()` function
3. Add `loadStateFromCookie()` function
4. Add `applyState(state)` function
5. Add `clearStateCookie()` function
6. Hook `saveStateToCookie()` into `updateResult()` and unit button clicks
7. Hook initialization into existing `DOMContentLoaded` listener
8. Add reset button HTML + CSS + click handler
9. Test: set state → reload → verify state persists
10. Test: reset → verify defaults restored
