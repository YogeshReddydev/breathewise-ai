# BreatheWise AI — Urban Air Quality Assistant
### Intelligent Atmospheric Telemetry, Family Health Vulnerability Profiling & Preventative Guidance
*Challenge 6 – Urban Air Quality Assistant*

![BreatheWise Platform](https://img.shields.io/badge/Status-Foundation%20Ready-10B981?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=for-the-badge&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google)

---

## 1. Project Overview

**BreatheWise AI** is an advanced environmental health platform engineered to protect urban families and sensitive individuals from the acute and chronic health hazards of air pollution.

By combining **live atmospheric sensor feeds** (Open-Meteo High-Resolution Air Quality API), **EPA breakpoint algorithms**, **diurnal pollution forecasting**, and **Google Gemini multimodal AI reasoning**, BreatheWise AI translates raw parts-per-billion chemical data into actionable, life-saving preventative health routines.

---

## 2. Key Architectural Features

1. **Modular AQI Data Provider Architecture**:
   - `BaseAQIProvider` abstract protocol enabling plug-and-play atmospheric data feeds.
   - Built-in **Open-Meteo Air Quality Provider** providing live, high-resolution global atmospheric monitoring for 6 criteria pollutants ($PM_{2.5}, PM_{10}, NO_2, O_3, CO, SO_2$) without requiring third-party API keys.
   - Secondary **WAQI Provider** supporting sensor networks across global metropolises.
   - `ResilientAQIProviderRegistry` featuring TTL in-memory caching and automatic multi-provider fallback.

2. **Standardized AQI & Breakpoint Calculation Engine**:
   - Official US EPA piecewise linear interpolation for all 6 criteria pollutants.
   - Dynamic dominant pollutant detection and clinical cautionary statement generation.

3. **Intelligent Preventative Recommendation Engine**:
   - Physiological risk scoring ($0 - 100$) integrating clinical vulnerability coefficients:
     - Pediatric airway hyperreactivity (< 12 years)
     - Geriatric reduced ciliary clearance (> 65 years)
     - Asthma & Bronchial hyperresponsiveness
     - Chronic Obstructive Pulmonary Disease (COPD)
     - Cardiovascular & Hypertensive sensitivity
     - Endurance athlete minute-ventilation factors
   - **4 Pillars of Prevention**:
     - *Certified Respirator Guidance*: N95 / FFP2 threshold triggers.
     - *Window & Natural Ventilation Window*: Diurnal recommendations to avoid temperature inversion smog traps.
     - *Indoor Air Scrubbing*: HEPA filtration mode settings (Auto, Medium, Turbo continuous).
     - *Outdoor Exertion Guidance*: Safe workout durations and commuter route recommendations.

4. **Family Health Profile & Vulnerability Matrix**:
   - Multi-persona household management (seeded with pediatric asthma, geriatric cardiovascular, and marathon runner profiles).
   - Dynamic alert thresholds that signal when personal safety margins are breached.

5. **Google Gemini Conversational Health Consultant**:
   - Multi-turn AI consultation powered by `gemini-2.5-flash`.
   - Context-aware prompt injection supplying real-time atmospheric readings and active patient health conditions.
   - Dynamic suggestion pills for follow-up questions and real-time clinical risk alerts.
   - Deterministic rule-based fallback when operating offline or without an API key.

6. **Design System & Visual Dashboard**:
   - Deep navy canvas (`#050B14`, `#0A1128`), emerald green (`#10B981`), and cyan (`#06B6D4`) atmospheric accents.
   - Precision SVG 260-degree radial AQI gauge with category badges.
   - 24-hour diurnal trajectory chart marking peak smog and cleanest ventilation hours.

---

## 3. Directory Structure

```text
Breath Ai/
├── .env.example                  # Environment configuration template
├── .gitignore                    # Strict size and secrets exclusion
├── ARCHITECTURE.md               # Detailed system design specification
├── README.md                     # Platform overview & setup guide
├── backend/
│   ├── app/
│   │   ├── api/v1/               # FastAPI route controllers
│   │   │   ├── aqi.py            # Real-time AQI & forecast endpoints
│   │   │   ├── consultation.py   # Gemini AI consultation endpoints
│   │   │   ├── family.py         # Family vulnerability matrix CRUD
│   │   │   └── recommendations.py# Clinical action recommendation endpoints
│   │   ├── models/               # Pydantic v2 data schemas
│   │   ├── providers/            # Modular AQI provider implementations
│   │   │   ├── base.py           # Abstract Base Provider
│   │   │   ├── open_meteo.py     # Live Open-Meteo atmospheric client
│   │   │   ├── waqi.py           # WAQI provider integration
│   │   │   └── registry.py       # Caching & failover orchestrator
│   │   ├── services/             # Core business logic
│   │   │   ├── aqi_calculator.py # EPA sub-index calculation engine
│   │   │   ├── family_service.py # In-memory family store
│   │   │   ├── gemini_service.py # Google GenAI SDK integration
│   │   │   └── recommendation_engine.py # Risk scoring algorithms
│   │   ├── config.py             # Pydantic BaseSettings
│   │   └── main.py               # FastAPI application entry point
│   ├── tests/                    # Automated Pytest suite (100% pass)
│   ├── pytest.ini                # Pytest runner settings
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/           # Modular React components
    │   │   ├── AQIGauge.tsx      # SVG radial meter
    │   │   ├── ActionCards.tsx   # Preventative action directives
    │   │   ├── FamilyMatrix.tsx  # Vulnerability cards & switcher
    │   │   ├── FamilyModal.tsx   # Add family profile modal
    │   │   ├── ForecastChart.tsx # 24-hour diurnal timeline
    │   │   ├── GeminiConsultation.tsx # Conversational AI consultant
    │   │   ├── Navbar.tsx        # Responsive navigation & city search
    │   │   └── PollutantGrid.tsx # 6 Criteria pollutant breakdown
    │   ├── services/api.ts       # Typed API client
    │   ├── types/index.ts        # Comprehensive TypeScript types
    │   ├── utils/aqi-theme.ts    # Color tokens and category mapping
    │   ├── App.tsx               # Main dashboard layout
    │   ├── index.css             # Tailwind base & glass styling
    │   └── main.tsx              # React DOM mounting
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 4. Quick Start & Local Development

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional for live Gemini)
cp ../.env.example .env

# Run FastAPI development server
uvicorn app.main:app --reload --port 8000
```
The interactive Swagger API documentation will be available at:
`http://localhost:8000/docs`

### Step 2: Frontend Setup
```bash
# Navigate to frontend directory in another terminal
cd frontend

# Install dependencies
npm install

# Start Vite dev server with backend proxy
npm run dev
```
Open your browser at:
`http://localhost:5173`

---

## 5. Automated Testing

### Backend Test Suite
Run the full automated pytest suite covering EPA breakpoint calculations, provider fallbacks, recommendation engines, and API endpoints:
```bash
python -m pytest backend/tests
```
**Results:** `20 passed, 0 failed (100% pass rate)`.

### Frontend TypeScript & Bundle Verification
```bash
cd frontend
npm run build
```
**Results:** Zero TypeScript compiler errors; production bundle built cleanly in ~2.4s.

---

## 6. Security & Environment Configuration

- **Zero Hardcoded Secrets**: All API tokens (Gemini, WAQI) are sourced exclusively through environment variables (`pydantic-settings`).
- **Resilient Fallbacks**: If `GEMINI_API_KEY` is omitted, BreatheWise AI transitions to an intelligent clinical rule-based engine, ensuring 100% operational uptime without unhandled exceptions.
- **Repository Hygiene**: Strict `.gitignore` prevents commits of `.env`, `node_modules`, `dist`, `.pytest_cache`, or Python virtual environments. Total repository source size is less than 0.5 MB.
