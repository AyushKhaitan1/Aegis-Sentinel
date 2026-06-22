# Aegis Sentinel: Fused Industrial Safety Intelligence for Zero-Harm Operations

**Submission for Phase 2: Build Sprint – Prototype Submission**  
**Competition:** ET AI Hackathon 2.0 (in partnership with Unstop)  
**Problem Statement Selected:** AI-Powered Industrial Safety Intelligence for Zero-Harm Operations (Problem Statement 1)  
**Target Sector:** Heavy Manufacturing, Oil & Gas Refineries, Steel Plants, Chemical Storage Facilities  

---

## Executive Summary

India's heavy industrial sector continues to pay a devastating human and operational cost. According to DGFASLI, over 6,500 fatal workplace accidents were recorded in FY2023, excluding the mining and construction sectors. Analysis of recent major industrial incidents (such as the Visakhapatnam Steel Plant coke oven battery explosion in January 2025) reveals a critical pattern: **warning telemetry existed, but safety systems remained siloed, and manual coordination failed to route alerts to decision-makers in time.**

**Aegis Sentinel** solves this systemic issue by building a **unified, fused intelligence layer** over industrial operations. It ingests:
1. Real-time IoT/SCADA sensor registries (Methane, Hydrogen Sulphide, Carbon Monoxide, Temperature).
2. Digital Permit-to-Work (PTW) logs (Hot Work, Confined Space, Height Work).
3. CCTV Visual Streams analyzed via Computer Vision (PPE compliance checking, smoke, and thermal anomalies).
4. Shift records and handovers.

Using a **Multi-Agent Risk Engine**, the system correlates independent "nominal" variables (such as a welding permit active near a piping run with minor gas seepage under high wind dispersion) to detect compound hazard conditions and initiate autonomous emergency containment protocols *before* a catastrophe occurs.

---

## 1. Problem Context & The Structural Gap

Modern industrial facilities are not lacking in safety equipment. They have gas detectors, permit processes, CCTV, and SCADA systems. The bottleneck lies in **information fragmentation**. A FICCI survey in 2024 revealed that **over 60% of large industrial facilities rely on manual handoffs** to coordinate between these safety systems.

```
[IoT Sensors]   [Permit Registry]   [CCTV Visuals]   [Shift Records]
     |                 |                  |                 |
     +---------> [ MANUAL SAFETY COORDINATION ] <-----------+
                               |
                   (Delays & Human Oversight)
                               |
                     [ Catastrophic Event ]
```

When separate departments operate in isolation:
* **The Telemetry team** sees a minor gas fluctuation (e.g., 8% LEL Methane) and logs it as "below warning limits."
* **The Operations team** issues a Hot Work permit for welding nearby, unaware of the gas reading.
* **The Safety team** is busy auditing paper logs.
* **The CCTV cameras** record workers removing PPE due to thermal fatigue, but no alarm is triggered.

Aegis Sentinel acts as a **unified predictive brain** that fuses these data streams, analyzes compound relationships in real-time, and automates emergency playbooks.

---

## 2. Technical System Architecture

Aegis Sentinel utilizes a highly responsive, event-driven web-dashboard architecture built on React, TypeScript, and modern styling libraries, ensuring high rendering performance for spatial twin layouts, camera streams, and console terminals.

```
+-----------------------------------------------------------------------+
|                         AEGIS SENTINEL HUBS                           |
+-----------------------------------------------------------------------+
|                                                                       |
|   +-------------------+  +--------------------+  +----------------+   |
|   |   SCADA Modbus    |  |    YOLOv8 Video    |  |  PTW API Logs  |   |
|   |    Gas Telemetry  |  |    PPE Audit Feed  |  |  Work Permits  |   |
|   +---------+---------+  +---------+----------+  +-------+--------+   |
|             |                      |                     |            |
|             +----------------------+---------------------+            |
|                                    v                                  |
|                 +------------------------------------+                |
|                 |    Fused Telemetry Analytics Box   |                |
|                 +------------------+-----------------+                |
|                                    |                                  |
|                                    v                                  |
|                 +------------------------------------+                |
|                 |     Multi-Agent Risk Assessor      |                |
|                 +--+------------+------------+----+--+                |
|                    |            |            |    |                   |
|         +----------+            |            |    +----------+        |
|         v                       v            v               v        |
|   [Telemetry]               [Permits]  [Compliance]     [Emergency]   |
|     Agent                     Agent        Agent           Agent      |
|         |                       |            |               |        |
|         +----------+------------+------------+---------------+        |
|                                    |                                  |
|                                    v                                  |
|                 +------------------------------------+                |
|                 |         Sentinel Core Brain        |                |
|                 +------------------+-----------------+                |
|                                    |                                  |
|             +----------------------+----------------------+           |
|             v                                             v           |
|   +--------------------+                        +------------------+  |
|   | Emergency Playbook |                        | Regulatory RAG   |  |
|   | Siren / Isolation  |                        |  Audit Reports   |  |
|   +--------------------+                        +------------------+  |
+-----------------------------------------------------------------------+
```

### Data Ingestion Layer:
* **Modbus/TCP & MQTT SCADA Integration:** Binds directly to gas transducers. Sensor values are polled from holding registers (e.g., Register 40012 for Methane, Register 40018 for H2S) or consumed from MQTT brokers (topic `refinery/co5/telemetry`) to capture immediate shifts in concentration.
* **Computer Vision CCTV Stream:** Processes RTSP camera feeds via a YOLOv8 object-detection pipeline trained to audit PPE (helmets and safety harnesses) and flag flame/smoke anomalies.
* **Permit-to-Work API Conduits:** Plugs into the digital permit registry, mapping active permit types, geographic coordinates, and personnel assigned.

---

## 3. The Multi-Agent Safety War Room

At the core of the Aegis platform is an agentic AI system that simulates collaboration between specialized safety agents:

1. **Telemetry Agent:** Continuously tracks gas levels (CH4, H2S, CO) and ambient conditions (temperature, wind). Evaluates trends and issues alerts if sensors rise or drift toward critical limits.
2. **Permit Coordinator:** Audits active permits against the layout, checking for geographic overlaps between high-risk maintenance (like hot work) and active telemetry alerts.
3. **Compliance Officer:** A RAG-powered agent that monitors operations against safety standards. It queries the local regulatory database, cites violations, and issues statutory recommendations.
4. **Emergency Director:** Remains on standby, activating automatically when risk exceeds critical limits to isolate SCADA valves, alert rescue crews, and map evacuation routes.

As risk factors change, these agents hold a collaborative dialogue in the **Safety War Room Console**, debating hazards, referencing regulations, and aligning on corrective actions in seconds.

---

## 4. Compound Risk Scenarios & AI Evaluation

Single-sensor alerts often trigger too late. Aegis Sentinel's risk engine evaluates **compound risks** by looking at overlapping conditions:

* **Scenario A (Confined Space Gas Trap):** If a "Confined Space Entry" permit is active in Storage Tank B, H2S gas levels exceed 5 ppm, and forced ventilation fails, the risk engine immediately triggers a **CRITICAL (95%)** state. The system bypasses manual approvals to start evacuation procedures.
* **Scenario B (Ignition Threat):** If a "Hot Work" permit (welding) is active at the Coke Oven Battery, methane leaks hit 8% LEL, and high wind dispersion is active, the engine raises the risk index to **HIGH/CRITICAL (90%)**. It shuts down the electrical welding grid to prevent sparks from igniting the gas cloud.
* **Scenario C (Thermal Fatigue & PPE Breach):** If temperature telemetry exceeds 42°C during "Height Work" permits, and CCTV audits detect a technician removing their safety harness, the engine registers a **HIGH (75%)** risk index. It flags the PPE violation and directs the supervisor to enforce hydration breaks.

---

## 5. Regulatory Compliance & Local RAG

The platform integrates a client-side **Retrieval-Augmented Generation (RAG) search engine** pre-loaded with a safety document corpus, including:
* **The Factories Act, 1948 (Section 36 - Confined Spaces, Section 36A - Height Fall Protection)**
* **OISD Standard 105 (Work Permit System, Clause 5.2 - Hot Work, Clause 6.1 - Confined Space)**
* **OISD Standard 206 (Gas Processing Plants safety guidelines)**
* **DGMS Circulars (Carbon Monoxide toxic thresholds)**

Operators can query the RAG search bar to find answers complete with match confidence levels and citations. The **Live Safety Audit** tool extracts active telemetry, permits, and violations, compiling them into a formatted audit report for regulatory submission.

---

## 6. Emergency Playbook Execution

When risk levels breach critical limits (>= 80%) or the operator presses the Manual Panic button, the **Emergency Response Orchestrator** automates containment protocols:

```
[ CRITICAL TRIGGER ]
        |
        v
[ 01. SIREN ] -------> Activate visual and audible alarms across map
        |
        v
[ 02. SMS LOGS ] ----> Dispatch SMS alerts to local rescue crews
        |
        v
[ 03. ISOLATE ] -----> Terminate welding power & close SCADA gas valves
        |
        v
[ 04. PATHWAYS ] ----> Map safe wind-direction evacuation routes
        |
        v
[ 05. FORM XI-A ] ---> Draft official PESO Form XI-A incident report
```

This automates containment actions, compressing incident response times **from minutes to seconds** and protecting workers on-site.

---

## 7. Business Viability, Scalability & Market Impact

### Target Market:
* Primary focus: Heavy manufacturing (Steel, Aluminum, Cement), Refineries, Petrochemical plants, and Logistics hubs.
* In India, this platform addresses compliance needs for major enterprises, including SAIL, Tata Steel, Reliance Industries, and GAIL.

### Value Proposition (ROI):
* **Lives Saved:** Achieves a zero-harm operational environment.
* **Reduced Downtime:** Minimizes unplanned shutdowns (which currently account for 18–22% of losses in heavy manufacturing due to safety incidents).
* **Automated Audits:** Cuts compliance overheads by compiling digital audit documents automatically.
* **Lower Insurance Premiums:** Demonstrates lower risk profiles to underwriters, reducing facility insurance costs.

### Expansion & Scalability:
* Built on highly modular web components, the digital twin layout can scale to represent multiple plants on a global map.
* The API-driven design allows seamless integration with existing SCADA systems (Honeywell, Siemens) and CCTV camera networks.

---

## Conclusion

**Aegis Sentinel** represents a step-change in industrial safety management. Fusing IoT telemetry, permit logs, computer vision, and regulatory guidelines into a single predictive layer, it transitions safety management from reactive investigation to **predictive containment**. By leveraging agentic AI and RAG search databases, Aegis Sentinel provides a robust tool to help heavy industry achieve the goal of **Zero-Harm Operations**.
