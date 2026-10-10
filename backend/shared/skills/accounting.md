---
name: deckworks-accounting
description: Reconcile financial and management reporting into a traceable slide deck.
---

# Accounting

Use for financial statements, management reporting, budgets, forecasts, variance
reviews, controls, and audit or close-readout decks.

## Establish the basis first

Confirm period, entity, currency, accounting basis, and source authority before
drafting conclusions. Reconcile totals before writing any conclusion. Show actual
versus plan, prior period, and forecast with explicit units and signs, and
separate reported values from estimates and management adjustments.

## Structure

Prefer a small set of components: `title` for the conclusion, `body` for the
bridge explanation, `chart` for trend or variance, `table` for reconciled
detail, and `callout` for a risk or control exception. Put definitions and
assumptions in speaker notes rather than hiding them in chart labels.

## Evidence

Record formulas, source files, period filters, rounding, and unresolved
reconciliation items in `scratchpad.md`. **STOP** at the narrative approval gate
if a number cannot be traced to a supplied source.

## Implement

Follow the `create` gate structure, then load the `build` subskill for the
stylesheet, layout, and Python slide-HTML rules.
