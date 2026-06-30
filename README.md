# The Sky

An advanced, immersive, and highly interactive live wallpaper simulation built with HTML5, CSS3, the HTML5 Canvas API, and Vanilla JavaScript. This version dynamically displays a live clock and floating year centerpiece against a realistic sky that shifts based on real-time weather data and the astronomical position of the Sun and Moon.

![Latest Version](https://img.shields.io/badge/Latest%20Version-3.2.0--dev-navy.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)


## 🌟 Features

### 1. Real-Time Weather Integration
* **Live API Syncing**: Integrates with the **Open-Meteo API** to fetch real-time weather conditions matching your geographical coordinates.
* **Hybrid Geolocation & Reverse Geocoding**: Automatically determines your location using a silent IP-based Geolocation API (`ipapi.co`) without requesting intrusive browser permissions. It falls back to the browser's native Geolocation API and finally default coordinates if offline.
* **Offline Resilience**: Automatically falls back to clear weather if the API requests or permission lookups fail or time out.

### 2. Native Desktop Integration & Z-Ordering
* **Linux Desktop Integration**: Run the wallpaper directly as the desktop background on any **Linux distribution** using GTK + X11 (or XWayland). The click-through shape masking relies on Cairo's `input_shape_combine_region`, which is an X11 feature.
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
A sleek, centered glassmorphic popup modal featuring backdrop blur and micro-animations that allows full customization. An **About** screen — accessible via the info icon in the settings header — displays project details, version, and key capabilities:
* **Time Override**: Simulate different phases of the day (Auto, Sunrise, Day, Sunset, Night).
* **Weather Override**: Manually override live weather with Clear, Rain, Snow, or Cloudy presets.
* **Element Toggles**: Individually show or hide the Clock & Date, Sun & Moon, and Weather Effects.
* **LocalStorage Persistence**: Saves all configuration choices so they persist between page reloads.

### 6. Widgets
The wallpaper features interactive widget cards. Clicking a card opens a dedicated details and customization popup panel:
* **Clock Widget**: Shows detailed system time info (timezone, day of year). Includes a customization tab to toggle 12/24-hour formats and day-of-week display.
* **Weather Widget**: Shows detailed live weather metrics (relative humidity, wind speed, daily min/max range). Includes a customization tab to switch between Celsius (°C) and Fahrenheit (°F) units.

## 🚀 How to Run

### Method 1: Desktop Wallpaper Mode (Recommended)
You can run the wallpaper directly on your desktop background using the native Python wrapper. This requires **Linux with GTK and X11** (or XWayland). It works on any major Linux distribution.

1. **Install system dependencies** (required for GTK/Cairo drawing and the WebKit rendering engine):

   **Ubuntu / Debian:**
   ```bash
   sudo apt update
   sudo apt install python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1 wmctrl
   ```
   *(Note: Depending on your Ubuntu version, you might need `gir1.2-webkit2-4.0` instead of `4.1`.)*

   **Fedora / RHEL:**
   ```bash
   sudo dnf install python3-gobject python3-cairo webkit2gtk4.1 wmctrl
   ```

   **Arch Linux:**
   ```bash
   sudo pacman -S python-gobject python-cairo webkit2gtk wmctrl
   ```

   **openSUSE:**
   ```bash
   sudo zypper install python3-gobject python3-cairo webkit2gtk3 wmctrl
   ```

2. **Set up the virtual environment** (accesses the system packages for GTK/Cairo while keeping other dependencies isolated):
   ```bash
   python3 -m venv --system-site-packages venv
   ./venv/bin/pip install pywebview
   ```

3. **Run the wallpaper**:
   * **Foreground (Testing Mode)**:
     ```bash
     ./venv/bin/python3 wallpaper.py
     ```
   * **Background (Daemon Mode)**:
     ```bash
     nohup ./venv/bin/python3 wallpaper.py > wallpaper.log 2>&1 &
     ```

4. **Stop the background wallpaper**:
   ```bash
   pkill -f wallpaper.py
   ```
---

### Method 2: Browser Mode (Local Development)
Because the wallpaper uses reverse-geocoding, modern browsers restrict location lookups on raw local file paths (`file:///` protocols). You can preview the application in your browser using a local HTTP server:

#### Option A: Python HTTP Server (Easiest)
Open a terminal in the project directory and run:
```bash
python3 -m http.server 8000
```
Then navigate to **`http://localhost:8000`** in your browser.

#### Option B: VS Code Live Server
If you are using Visual Studio Code, right-click `index.html` and click **"Open with Live Server"**.