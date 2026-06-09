# Version 3 — Real Weather

An advanced, immersive, and highly interactive live wallpaper simulation built with HTML5, CSS3, the HTML5 Canvas API, and Vanilla JavaScript. This version dynamically displays a live clock and floating year centerpiece against a realistic sky that shifts based on real-time weather data and the astronomical position of the Sun and Moon.

![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)


## 🌟 Features

### 1. Real-Time Weather Integration
* **Live API Syncing**: Integrates with the **Open-Meteo API** to fetch real-time weather conditions matching your geographical coordinates.
* **Geolocation & Reverse Geocoding**: Requests the user's location via the browser's Geolocation API and reverses the coordinates to display your local city and country (e.g., `Live: London, GB`).
* **Offline Resilience**: Automatically falls back to clear weather if the API requests or permission lookups fail or time out.

### 2. Advanced Canvas Particle Systems
* 🌧️ **Rain Engine**: Simulated raindrops falling at slanted angles to mimic wind, complete with circular ripples/splashes that trigger upon hitting the bottom edge of the screen.
* ❄️ **Snow Engine**: Floating snowflakes that sway gently using trigonometric waves (`Math.sin`), falling at randomized speeds.
* ☁️ **Cloud Engine**: Soft, semi-transparent fluffy cloud puffs that drift slowly across the upper 25% of the viewport.
* 🌠 **Shooting Stars**: Intermittent shooting stars with fading trails that appear randomly during the night phase.

### 3. Dynamic 4-Phase Sky Cycles
* Seamless CSS transitions that cross-fade gradients representing four distinct times of day:
  - **Sunrise** (Early morning dawn glow)
  - **Day** (Bright clear sky)
  - **Sunset** (Golden hour warm colors)
  - **Night** (Deep midnight starfield)
* **Celestial Paths**: The Sun and Moon follow custom mathematical parabolic arcs across the viewport. The Sun rises at `05:30` and sets at `18:30`, dynamically fading out as it reaches the horizon.

### 4. Glassmorphic Settings Panel
A sleek settings sidebar featuring blur filters and micro-animations that allows full customization:
* **Time Override**: Simulate different phases of the day (Auto, Sunrise, Day, Sunset, Night).
* **Weather Override**: Manually override live weather with Clear, Rain, Snow, or Cloudy presets.
* **Typography Selector**: Choose from different typography styles including *Poppins*, *Montserrat*, *Playfair Display*, and *Orbitron (Digital)*.
* **Element Toggles**: Individually show or hide the Clock & Date, Sun & Moon, and Weather Effects.
* **12/24-Hour Selector**: Switch between 12-hour and 24-hour clock formats.
* **LocalStorage Persistence**: Saves all configuration choices so they persist between page reloads.

## 🚀 How to Run

Because this version uses the browser's Geolocation API to fetch live weather details, most modern browsers restrict location lookups on raw local file paths (`file:///` protocols).

It is recommended to run Version 3 using a local development server:

### Option A: Python HTTP Server (Easiest)
Open a terminal in this directory (`v3 - real weather`) and run:
```bash
python3 -m http.server 8000
```
Then navigate to **`http://localhost:8000`** in your browser.

### Option B: VS Code Live Server
If you are using Visual Studio Code, right-click `index.html` and click **"Open with Live Server"**.