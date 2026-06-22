# Aegis Sentinel: AI-Powered Industrial Safety Intelligence Platform

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Lucide Icons](https://img.shields.io/badge/Lucide--Icons-Active-00E5FF)](https://lucide.dev)
[![Licence](https://img.shields.io/badge/Licence-MIT-green)](LICENSE)

Aegis Sentinel is an advanced B2B Fused Safety Intelligence platform addressing **Problem Statement 1: AI-Powered Industrial Safety Intelligence for Zero-Harm Operations** in the **Economic Times AI Hackathon 2.0**.

By fusing real-time IoT/SCADA sensor registries, digital work permits, and CCTV visual streams analyzed via computer vision (YOLOv8 models), Aegis Sentinel acts as a central predictive safety brain to flag compound risks *before* they lead to critical incidents.

---

## 🌟 Core Features

1. **🖥️ Live Spatial Digital Twin Map:** SVG-based interactive blueprint mapping worker biometrics (heart rate), active permit boundaries (Hot Work, Confined Space), and dynamic radial gas dispersion plumes (CH4 Methane, H2S).
2. **📹 CCTV Computer Vision Viewports:** Simulates live YOLOv8 object classification, auditing PPE compliance (helmets, harnesses) and smoke anomalies with visual bounding boxes.
3. **🔌 IoT SCADA Telemetry Registry:** Lists active transducers, Modbus/TCP registers, and MQTT topics, complete with real-time SVG sparklines reacting dynamically to sensor inputs.
4. **🧠 Multi-Agent Safety War Room:** Simulates terminal logs of collaborative safety agents (Telemetry, Permit, Compliance, Emergency) debating hazards and quoting safety guidelines.
5. **📋 Regulatory RAG Auditor:** Conversational search bar indexing **The Factories Act, 1948** and **OISD safety standards**, yielding citations and compiling safety compliance reports.
6. **🚨 Emergency Playbooks:** Automates evacuation sirens, SMS dispatch logs to rescue crews, SCADA valve isolations, evacuation path drawings, and pre-fills a PESO Form XI-A Incident report.

---

## 🛠️ System Architecture

Aegis Sentinel compiles into a single-page reactive dashboard:

```
[IoT SCADA Sensors]   [Permit Registry API]   [CCTV Visual Streams]
        |                       |                       |
        v                       v                       v
+---------------------------------------------------------------+
|                 AEGIS FUSED INTELLIGENCE LAYER                |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|         MULTI-AGENT PREDICTIVE RISK & CORRELATION ENGINE      |
|  (Telemetry Agent, Permit Agent, Compliance Agent, Director)   |
+---------------------------------------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                      SENTINEL CORE BRAIN                      |
+---------------------------------------------------------------+
        |                                               |
        v                                               v
[Emergency Playbook Response]                 [Regulatory RAG Auditor]
(SCADA Isolation, Evac Paths)                 (OISD & Factories Act)
```

---

## 🚀 Getting Started

Follow these steps to run Aegis Sentinel locally on your computer.

### Prerequisites
* [Node.js](https://nodejs.org) (v18.0.0 or higher recommended)
* npm (v9.0.0 or higher)

### Installation & Local Run
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/aegis-sentinel.git
   cd aegis-sentinel
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Production Build
To compile the project into a static production bundle:
```bash
npm run build
```
The static build will be output to the `dist/` directory, ready to be hosted on Netlify, Vercel, or GitHub Pages.

---

## 📋 Regulatory Compliance Mappings

Aegis Sentinel maps live operations directly to Indian statutory codes:
* **The Factories Act, 1948 Section 36:** Confined space entry checks (ventilation requirements, safety certificate verification, retrieval harnesses).
* **OISD Standard 105 Clause 5.2:** Hot work requirements (flammable gas testing, clear radius, 10% LEL emergency thresholds).
* **OISD Standard 206 Clause 8.4:** Toxic gas limits (H2S exposure thresholds, 10 ppm permissible limit, SCBA requirements).
* **DGMS (Tech) Circular 12:** Carbon Monoxide toxicity thresholds.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

