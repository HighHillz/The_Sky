# Version 3 — Real Weather

An advanced, immersive, and highly interactive live wallpaper simulation built with HTML5, CSS3, the HTML5 Canvas API, and Vanilla JavaScript. This version dynamically displays a live clock and floating year centerpiece against a realistic sky that shifts based on real-time weather data and the astronomical position of the Sun and Moon.

![Version](https://img.shields.io/badge/Version-3.1.0-blue.svg)


## 🌟 Features

### 1. Real-Time Weather Integration
* **Live API Syncing**: Integrates with the **Open-Meteo API** to fetch real-time weather conditions matching your geographical coordinates.
* **Hybrid Geolocation & Reverse Geocoding**: Automatically determines your location using a silent IP-based Geolocation API (`ipapi.co`) without requesting intrusive browser permissions. It falls back to the browser's native Geolocation API and finally default coordinates if offline.
* **Offline Resilience**: Automatically falls back to clear weather if the API requests or permission lookups fail or time out.

### 2. Native Desktop Integration & Z-Ordering
* **Cross-Platform**: Run the wallpaper directly as the desktop background on **Linux** (via GTK/Cairo), **macOS** (via AppKit `NSDesktopWindowLevel`), and **Windows** (via Win32 `SetWindowPos`).
* **Interactive Shape Masking**: Uses Cairo region blending to capture click inputs *only* on active UI elements (like the settings gear) while making the rest of the wallpaper completely click-through to allow normal OS usage.
* **Continuous Render Loop**: Utilizes a robust timer loop that bypasses browser engines' tendency to freeze/suspend `requestAnimationFrame` when the wallpaper is layered behind active workspace windows.

### 3. Advanced Canvas Particle Systems
* 🌧️ **Rain Engine**: Simulated raindrops falling at slanted angles to mimic wind, complete with circular ripples/splashes that trigger upon hitting the bottom edge of the screen.
* ❄️ **Snow Engine**: Floating snowflakes that sway gently using trigonometric waves (`Math.sin`), falling at randomized speeds.
* ☁️ **Cloud Engine**: Soft, semi-transparent fluffy cloud puffs that drift slowly across the upper 25% of the viewport.
* 🌠 **Shooting Stars**: Intermittent shooting stars with fading trails that appear randomly during the night phase.

### 4. Dynamic 4-Phase Sky Cycles
* Seamless CSS transitions that cross-fade gradients representing four distinct times of day:
  - **Sunrise** (Early morning dawn glow)
  - **Day** (Bright clear sky)
  - **Sunset** (Golden hour warm colors)
  - **Night** (Deep midnight starfield)
* **Celestial Paths**: The Sun and Moon follow custom mathematical parabolic arcs across the viewport. The Sun rises at `05:30` and sets at `18:30`, dynamically fading out as it reaches the horizon.

### 5. Glassmorphic Settings Panel
A sleek settings sidebar featuring blur filters and micro-animations that allows full customization:
* **Time Override**: Simulate different phases of the day (Auto, Sunrise, Day, Sunset, Night).
* **Weather Override**: Manually override live weather with Clear, Rain, Snow, or Cloudy presets.
* **Typography Selector**: Choose from different typography styles including *Poppins*, *Montserrat*, *Playfair Display*, and *Orbitron (Digital)*.
* **Element Toggles**: Individually show or hide the Clock & Date, Sun & Moon, and Weather Effects.
* **12/24-Hour Selector**: Switch between 12-hour and 24-hour clock formats.
* **LocalStorage Persistence**: Saves all configuration choices so they persist between page reloads.

## 🚀 How to Run

### Method 1: Desktop Wallpaper Mode (Recommended)
You can run the wallpaper directly on your desktop background using the native Python wrapper.

1. **Set up the virtual environment** (this allows access to system libraries like GTK/Cairo while keeping python packages isolated):
   ```bash
   python3 -m venv --system-site-packages venv
   ```

2. **Run the wallpaper**:
   * **Interactive/Testing Mode**:
     ```bash
     ./venv/bin/python3 wallpaper.py
     ```
   * **Background/Daemon Mode** (runs silently behind all your apps):
     ```bash
     nohup ./venv/bin/python3 wallpaper.py > wallpaper.log 2>&1 &
     ```

3. **Stop the background wallpaper**:
   ```bash
   pkill -f wallpaper.py
   ```

---

### Method 2: Browser Mode (Local Development)
Because the wallpaper uses reverse-geocoding, modern browsers restrict location lookups on raw local file paths (`file:///` protocols). You can preview the application in your browser using a local HTTP server:

#### Option A: Python HTTP Server (Easiest)
Open a terminal in this directory and run:
```bash
python3 -m http.server 8000
```
Then navigate to **`http://localhost:8000`** in your browser.

#### Option B: VS Code Live Server
If you are using Visual Studio Code, right-click `index.html` and click **"Open with Live Server"**.