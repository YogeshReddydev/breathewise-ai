# BreatheWise AI — Urban Air Quality & Environmental Health Assistant

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4.svg?style=flat&logo=google)](https://ai.google.dev)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Live_AQI-10B981.svg?style=flat)](https://open-meteo.com)
[![CPCB India](https://img.shields.io/badge/CPCB-National_AQI-84CC16.svg?style=flat)](https://cpcb.nic.in)

> Built for **Challenge 6 – Urban Air Quality Assistant**. A production-grade environmental intelligence platform engineered to translate multi-spectral atmospheric sensor telemetry into actionable, personalized respiratory and cardiovascular health directives for urban families.

---

## What's New in v0.2.0

- 🇮🇳 **India-First AQI Intelligence**: Full support for the Indian Central Pollution Control Board (CPCB) National AQI (NAQI) with official linear breakpoint interpolation across 8 criteria pollutants and strict validation ($\ge 3$ monitored pollutants with PM10/PM2.5 required).
- ⚖️ **Multi-Standard Cross-Referencing**: Support for **CPCB NAQI (India)**, **US EPA AQI**, and **European AQI (EAQI)** without mixing breakpoints or presenting them as interchangeable.
- 🎯 **5-Dimension Target Cohort Directives**: Structured clinical recommendations covering Families with Children, Older Adults (65+), Students, Daily Commuters, Outdoor Workers, and General Households.
- 🌱 **Sustainable Living & Commuter Emissions Calculator**: Interactive calculator displaying single-trip, weekly, and annual $\text{CO}_2$ savings plus tailpipe $\text{PM}_{2.5}$ reductions, correlated with real-time ambient air safety.
- 🛡️ **Family Protection Mode**: Create, edit, and delete real household members with voluntary sensitivity selections. Demonstration profiles (Marcus, Elena, Leo, Sophia) are badged as fictional simulation data with one-click clear and restore controls.
- 🕒 **24-Hour & 48-Hour Extended Horizon**: Extended numerical simulation curve with clean-air and peak pollution window highlights.
- 🧪 **Complete Automated Test Suite**: 50 backend pytest tests and 10 frontend vitest tests passing with 100% success (including OWASP security headers, in-memory rate limiting, 8 dedicated AI safety evaluation scenarios, WAQI CPCB calculation, stale cache failover, and date-time formatters).

---

## Core Features

1. **Real Planetary Telemetry**: High-resolution atmospheric models and satellite observations via Open-Meteo with zero required API keys. Real concentrations for PM2.5, PM10, $O_3$, $NO_2$, $SO_2$, and $CO$.
2. **Clinical Risk Scoring ($0\text{--}100$)**: Algorithmic risk evaluation combining US EPA AQI standards, WHO 2021 air quality guidelines, and CPCB criteria.
3. **Google Gemini 2.5 Flash Orchestrator**: Context-aware natural-language assistant with strict ground-truth guardrails preventing hallucinated sensor stations or invented readings, plus a rich deterministic expert fallback engine.
4. **Indoor Clean Haven Protocols**: Actionable guidance for window cross-ventilation vs. airtight sealing, and automated HEPA purifier speeds (Low, Auto, High, Turbo).
5. **Offline & Stale Data Resilience**: Automatic detection of network disconnection with cached telemetry display and background re-synchronization.
6. **Premium Dark Theme Aesthetic**: Built with midnight navy (`#070D1E`, `#0D162B`), emerald green (`#10B981`), atmospheric cyan (`#06B6D4`), and accessible high-contrast typography.

---

## Project Structure

```
breathewise-ai/
├── .gitignore                     # Strict exclusion of node_modules, .venv, caches
├── .env.example                   # Unified environment variable documentation
├── README.md                      # Comprehensive project guide
├── docs/
│   ├── ARCHITECTURE.md            # Architecture, clinical formulas, failover design
│   └── API_SPEC.md                # Full REST API contracts and examples
├── backend/
│   ├── requirements.txt           # Python dependencies
│   ├── pyproject.toml             # Packaging & pytest configuration
│   ├── app/
│   │   ├── main.py                # FastAPI initialization & CORS
│   │   ├── core/                  # Configuration & sanitization
│   │   ├── models/                # AQI, Family, Recommendations & Sustainability schemas
│   │   ├── providers/             # Base class, Open-Meteo, WAQI & Registry
│   │   ├── services/              # Recommendation Engine, Sustainability, Gemini, AQI Coordinator
│   │   ├── utils/                 # Official Indian CPCB NAQI linear interpolation engine
│   │   └── api/                   # Telemetry, Recommendations, Profiles, Sustainability, Chat
│   └── tests/                     # 47 automated pytest test cases across 11 test suites
└── frontend/
    ├── package.json               # Dependencies & scripts
    ├── tsconfig.json              # TypeScript strict configuration
    ├── vite.config.ts             # Vite dev server & proxy settings
    ├── src/
    │   ├── types/                 # TypeScript interfaces (AQI, Family, Recommendations, Sustainability)
    │   ├── services/              # API HTTP client
    │   ├── utils/                 # EPA AQI, CPCB NAQI, European AQI & WHO calculators
    │   ├── hooks/                 # useAQI and useFamilyProfiles
    │   └── components/            # Dashboard hero, pollutant matrix, timeline, sustainability, family, chat
    └── tests/                     # Vitest unit test suite (5 tests)
```

---

## Quickstart Guide

### 1. Backend Setup

```bash
cd backend

# (Optional) Create virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Unix: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at:
- API Root: `http://localhost:8000`
- Interactive Swagger UI Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend dashboard will be available at: `http://localhost:5173`.

---

## Automated Testing Suite

### Run All Backend Tests (50 Passed)
```bash
cd backend
python -m pytest
```
Validates:
- CPCB sub-index linear interpolation and validation criteria.
- US EPA and European AQI standard mapping.
- 5-dimension structured cohort recommendations.
- Transport emissions and particulate reduction formulas.
- Fictional demonstration profile handling and custom member CRUD.
- Input validation, coordinate bounds checking, and query sanitization.
- Provider failover, WAQI CPCB calculation, and stale cache failover during outages.
- OWASP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- Sliding-window in-memory rate limiting to protect public endpoints.
- 8 dedicated AI safety evaluation scenarios (smog myth refutation, vulnerable cohort protections, zero data fabrication).

### Run All Frontend Tests (10 Passed)
```bash
cd frontend
npm test
```
Validates:
- US EPA AQI bands and category classification.
- Indian CPCB National AQI categories and color hexes.
- European AQI standard mapping.
- WHO 2021 air quality guideline limits and percentage calculations.
- Dynamic standard switching without breakpoint conflation.
- Edge case boundary conditions (0 and 500 AQI).
- Hourly forecast and date-time formatters.

### Run Production Build
```bash
cd frontend
npm run build
```
Type checks and bundles the production assets in $< 4$ seconds.

---

## Environment Configuration

Copy `.env.example` to `.env` in the root or `backend/` directory:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DEFAULT_AQI_PROVIDER` | `open-meteo` | Real live AQI provider (free, no key required) |
| `GEMINI_API_KEY` | *(empty)* | Optional. Google Gemini API key for natural language reasoning |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model variant |
| `WAQI_API_KEY` | *(empty)* | Optional. World Air Quality Index token |
| `AQI_CACHE_TTL_SECONDS`| `900` | In-memory cache time-to-live (15 minutes) |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins |

> [!NOTE]
> If `GEMINI_API_KEY` is omitted, BreatheWise operates autonomously using its built-in clinical rule engine derived from EPA, CPCB, and WHO standards.

---

## Repository Size & Hygiene Guardrails

- **Single Branch**: Developed strictly on `main`.
- **Zero Committed Secrets**: Protected by rigorous `.gitignore` rules.
- **Repository Size**: Clean codebase under 1 MB (excluding `node_modules` and Python bytecode).
- **No Mock AQI Data**: Real live planetary air quality telemetry provided by Open-Meteo.

---

## Medical Disclaimer

BreatheWise AI provides environmental intelligence and educational health guidance based on EPA AQI, WHO 2021, and CPCB standards. It does not provide medical diagnoses or clinical treatment. Consult licensed healthcare professionals for personal medical care.

---

## License

MIT License. Developed for Challenge 6 – Urban Air Quality Assistant.
