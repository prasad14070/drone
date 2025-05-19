# 🛸 Drone Survey Management System – FlytBase 

This repository contains my submission for the **FlytBase Full-Stack Assignment V2**. The project demonstrates a scalable system for planning, managing, and monitoring autonomous drone surveys across multiple global sites.

---

## 🌐 Live Demo / Video Walkthrough
> [Insert your video demo link here (e.g., YouTube, Loom, etc.)]

---

## 📌 Features

### 🗺️ Mission Planning and Configuration
- Define survey areas and flight paths
- Set flight parameters like altitude, speed, and waypoint locations
- Configure mission-specific data collection options (e.g., sensor types)

### 🚁 Fleet Visualization and Management
- Real-time drone status (available, in-mission)
- Battery levels and health indicators
- Organizational view of entire drone fleet

### 📡 Mission Monitoring
- Real-time map with active drone flight paths
- Mission status updates: Starting, In Progress, Completed, Aborted
- In-flight control options: Pause, Resume, Abort

### 📊 Survey Reporting and Analytics
- Individual mission stats (duration, coverage, distance)
- Organization-wide analytics and historical summary
- Exportable reports for compliance or insights

---

## 🧰 Tech Stack

| Category        | Tools/Frameworks Used          |
|----------------|--------------------------------|
| Frontend       | React / Next.js / Tailwind CSS |
| Backend        | Node.js / Express.js           |
| Database       | MongoDB / PostgreSQL           |
| Maps & Visualization | Leaflet.js / Mapbox / Google Maps API |
| Dev Tools      | Docker, GitHub Actions, Postman|
| AI Tools Used  | [Claude / Cursor / Replit / etc.] |

---

## 🧠 My Approach

- **Modular Design**: Broke down the system into independent modules (missions, fleet, monitoring, analytics).
- **Scalability**: Used RESTful API patterns and database indexing to ensure performance under high load.
- **Real-Time Monitoring**: Simulated drone telemetry using WebSockets for a near-real-time experience.
- **Adaptability**: Added configuration flexibility for mission parameters like crosshatch/perimeter flight paths.

---

## ⚖️ Trade-offs Considered

- Chose MongoDB for flexible schema to support diverse mission data, though relational DBs offer stricter integrity.
- Prioritized mission control and monitoring UIs over advanced analytics to deliver core functionality thoroughly.
- Simulated drone movement data due to scope limits; real integration would require drone SDK.

---

## ✅ Safety & Adaptability Strategy

- Used schema validations to prevent incorrect mission configurations.
- Included mission abort/resume functionality for quick response to anomalies.
- Modular architecture enables easy integration with real drone APIs or AI planning agents in the future.

---

## 🧪 Bonus Features

- Dark Mode UI toggle
- Role-based access for Admin vs Operator
- PDF report export
- (Optional) Integrated AI co-pilot suggestion system for flight path optimization

---

## 📂 Project Structure

