# BreatheWise AI — Evaluator Video Demonstration Script
## Challenge 6: Urban Air Quality Assistant
**Target Duration:** 2 minutes 30 seconds (150 seconds)  
**Format:** Screen Recording with Voiceover Narration  
**Platform URL:** `http://localhost:5173` (Frontend) & `http://localhost:8000/docs` (Backend)

---

### Scene 1: Executive Hook & Live Telemetry Dashboard (0:00 – 0:35)
- **Visual:** Open browser at `http://localhost:5173`. Full viewport shows the Midnight Navy (`#050B14`) and Deep Navy (`#0A1128`) interface. The AQI hero radial gauge displays real-time air quality in New Delhi, India.
- **Action:**
  1. Hover over the radial gauge and show the active status badge ("Live Observation").
  2. Point out the live telemetry: Fine $PM_{2.5}$ ($195\,\mu\text{g/m}^3$), Coarse $PM_{10}$ ($310\,\mu\text{g/m}^3$), and dominant pollutant.
  3. Click the Standard Switcher tabs: toggle between **🇮🇳 Indian CPCB**, **🇺🇸 US EPA**, and **🇪🇺 European AQI**.
- **Narration:**
  > "Welcome to BreatheWise AI, built for Challenge 6: Urban Air Quality Assistant. Urban air pollution is not a single number; it's a dynamic public health emergency. BreatheWise AI streams live atmospheric telemetry directly from Open-Meteo sensor grids. Notice how our multi-standard engine dynamically differentiates between the Indian CPCB National AQI, US EPA, and European standards without conflating their breakpoints. In Indian mode, official linear interpolation is computed strictly across qualifying criteria pollutants."
- **Expected Result:** Gauge color, active standard badge, and categories recalibrate immediately without page reload.

---

### Scene 2: Severe Winter Smog & Optimal Activity Windows (0:35 – 1:00)
- **Visual:** Scroll down to the **Optimal Clean Air & Peak Windows** card and **24h/48h Forecast Curve**.
- **Action:**
  1. Highlight the amber **Restricted / Smog Caution** badge on the optimal window card.
  2. Toggle between the **24-Hour** and **48-Hour** forecast horizon pills.
  3. Hover over an individual hourly bar showing the diurnal trend.
- **Narration:**
  > "During severe winter episodes, early morning thermal inversions trap toxic combustion particulates near ground level. Rather than giving a naive recommendation to run at 6 AM, BreatheWise AI's clinical engine detects inversion traps, actively restricting early outdoor workouts and highlighting the safest window or directing users indoors."
- **Expected Result:** Forecast expands smoothly to 48 hours; diurnal morning peak and inversion risks are clearly explained.

---

### Scene 3: Family Protection Matrix & Vulnerability Scoring (1:00 – 1:30)
- **Visual:** Scroll to the **Family Profile & Household Vulnerability Matrix**.
- **Action:**
  1. Click through the demonstration profiles: select **Leo (8y, Pediatric Asthma)**.
  2. Observe the Personalized Health Guidance update: Risk Score: 85 (High Risk), activity safety restricted, quick-relief inhaler directive.
  3. Click **Elena (71y, Cardiovascular)**: observe the shift to blood pressure and arterial strain advisories.
  4. Click **Clear Demo** to demonstrate household customization, then click **Reset Demo** to restore simulation cohorts.
- **Narration:**
  > "Air pollution affects every family member differently. Our Family Protection Matrix scores vulnerabilities from 0 to 100 based on EPA and WHO clinical benchmarks. For eight-year-old Leo, who has pediatric asthma, high particulate levels trigger an immediate N95 recommendation and inhaler alert. For seventy-one-year-old Elena, cardiovascular strain is prioritized. Users can clear demonstration profiles and add custom family members with voluntary health flags at any time."
- **Expected Result:** Advisories and risk scores re-evaluate instantly with transparent 5-dimension evidence.

---

### Scene 4: Sustainable Living, Commuting & Community Intelligence (1:30 – 2:00)
- **Visual:** Scroll to **Sustainable Living & Green Commuting** and **Community Intelligence & Civic Airshed Defense**.
- **Action:**
  1. Move the distance slider to 15 km and switch target mode to **Electric Metro**.
  2. Point out the single-trip, weekly, and annual $\text{CO}_2$ abatement and tailpipe $PM_{2.5}$ saved.
  3. In Community Intelligence, highlight the $PM_{2.5} / PM_{10}$ aerosol ratio (0.63 combustion fingerprint) and official GRAP Stage advisory.
  4. Click the interactive **Citizen Clean Air Pledge** button: watch the state switch to 'Pledge Active: Thank You!' and counter increment.
- **Narration:**
  > "BreatheWise AI connects personal protection with climate action. Our commuter calculator correlates transit choices with live ambient air safety. Shifting a 15 km commute from a petrol car to metro avoids over 2 kilograms of $\text{CO}_2$ per trip and saves direct combustion particulates. Underneath, Community Intelligence computes aerosol fingerprint ratios to diagnose combustion versus crustal dust, maps civic GRAP directives, and lets citizens pledge zero open burning."
- **Expected Result:** Calculations update in real time with DEFRA benchmarks; pledge state persists in local storage.

---

### Scene 5: Conversational Gemini AI Assistant & Closing (2:00 – 2:30)
- **Visual:** Click the **Assistant** icon in the navbar. The slide-over drawer animates into view.
- **Action:**
  1. Click a suggested question: *"Should Leo play soccer in this air quality?"*
  2. Show the context-aware response citing verified telemetry, asthma precautions, and clinical disclaimers.
  3. Type an unsafe query: *"Should I double my asthma inhaler dose?"*
  4. Show the strict medical safety guardrail intercepting the request.
- **Narration:**
  > "Finally, our conversational assistant powered by Google Gemini 2.5 Flash integrates real-time telemetry and family context. When asked about outdoor sports, it delivers grounded, practical advice. And with our strict medical safety guardrails, any attempt to ask for drug dosages or clinical prescriptions is immediately redirected to medical professionals.
  > With 90 passing automated tests, complete WCAG 2.1 AA accessibility, and a sub-1 megabyte repository, BreatheWise AI delivers real environmental intelligence. Thank you."
- **Expected Result:** Instant grounded response, safe medical redirection, clean close with `Escape` key.

