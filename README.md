# Slow Bloom — A Specialty Coffee Field Guide

A static, no-dependency website about specialty coffee: the Hario V60, five brew recipes, roast levels, bean species and varieties, flavor notes, why specialty coffee is different, its history, and market-growth analytics.

## What's inside

- **V60 guide** — geometry, filter, and why the brewer is so controllable
- **Interactive brew calculator** — dose, ratio, water, bloom, and pour targets
- **Five recipes** — daily 1:16, Hoffmann Ultimate, Tetsu Kasuya 4:6, Rao-style single pour, flash-chilled iced V60
- **Dial-in table** — sour vs. bitter troubleshooting
- **Roast levels** — light through dark with temperature, Agtron, flavor, and brew advice
- **Beans** — Arabica, Robusta, Liberica, Excelsa comparison plus six key varieties
- **Flavor guide** — six flavor families with descriptors and a four-step tasting method
- **History timeline** — from Ethiopian legend to the third wave
- **Analytics** — animated market-size, regional-consumption, production-share, and segment-growth charts
- Responsive layout, keyboard-friendly navigation, reduced-motion support

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

```
index.html   markup and content
styles.css   design system and responsive layout
script.js    navigation, calculator, counters, and canvas charts
```

No build step, no frameworks, no external requests.

## A note on the data

The market figures are rounded, illustrative estimates compiled from publicly reported industry research (SCA, ICO, World Coffee Research, NCA, and market-research summaries). Methodologies differ — verify before citing commercially.
