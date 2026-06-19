// Helper to communicate settings state and exact gear button boundaries with Python backend
function updateInteractiveRegion(isOpen) {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.set_interactive_mode) {
        if (isOpen) {
            window.pywebview.api.set_interactive_mode(true, 0, 0, 0, 0);
        } else {
            const btn = document.getElementById("settings-toggle");
            if (btn) {
                const rect = btn.getBoundingClientRect();
                window.pywebview.api.set_interactive_mode(
                    false,
                    Math.round(rect.left),
                    Math.round(rect.top),
                    Math.round(rect.width),
                    Math.round(rect.height)
                );
            }
        }
    }
}

// Set initial clickable shape as soon as pywebview's JS bridge is ready
window.addEventListener("pywebviewready", () => {
    updateInteractiveRegion(false);
});

// Canvas Star element for the night sky
class CanvasStar {
    constructor() {
        this.pctX = Math.random();
        this.pctY = Math.random();
        this.size = Math.random() * 1.6 + 0.8; // Larger radius: 0.8px to 2.4px
        this.maxOpacity = Math.random() * 0.6 + 0.4; // Brighter opacity range: 0.4 to 1.0
        this.opacity = Math.random() * this.maxOpacity;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.angle = Math.random() * Math.PI * 2;
    }

    update(nightFactor) {
        this.angle += this.twinkleSpeed;
        const twinkleVal = Math.sin(this.angle) * 0.35 + 0.65;
        // Stars fade out as the nightFactor (how much night sky is active) decreases
        this.opacity = this.maxOpacity * twinkleVal * nightFactor;
    }

    draw(ctx, w, h) {
        if (this.opacity <= 0.01) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.pctX * w, this.pctY * h, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Canvas Rain Particle
class RainParticle {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h; // Random start height on init
    }

    reset() {
        this.x = Math.random() * this.w;
        this.y = -20;
        this.length = Math.random() * 15 + 15;
        this.speed = Math.random() * 8 + 12;
        this.opacity = Math.random() * 0.25 + 0.15;
        this.wind = -0.7; // Slanted fall
        this.splash = false;
        this.splashTimer = 0;
        this.isDead = false;
    }

    update() {
        if (this.splash) {
            this.splashTimer++;
            if (this.splashTimer > 6) {
                this.reset();
            }
            return;
        }

        this.x += this.wind;
        this.y += this.speed;

        // Splash on screen bottom
        if (this.y >= this.h - 10) {
            this.y = this.h - 5;
            this.splash = true;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        if (this.splash) {
            ctx.strokeStyle = `rgba(174, 219, 240, ${this.opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.arc(this.x, this.y, this.splashTimer * 1.6, 0, Math.PI, true);
            ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(174, 219, 240, ${this.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.wind * 0.5, this.y + this.length);
            ctx.stroke();
        }
    }
}

// Canvas Snow Particle
class SnowParticle {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
        this.y = Math.random() * h;
    }

    reset() {
        this.x = Math.random() * this.w;
        this.y = -10;
        this.radius = Math.random() * 2.5 + 0.8;
        this.speed = Math.random() * 0.8 + 0.6;
        this.opacity = Math.random() * 0.5 + 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.015 + 0.008;
        this.swayWidth = Math.random() * 0.8 + 0.4;
        this.isDead = false;
    }

    update() {
        this.y += this.speed;
        this.angle += this.swaySpeed;
        this.x += Math.sin(this.angle) * this.swayWidth;

        if (this.y >= this.h || this.x < -10 || this.x > this.w + 10) {
            this.reset();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Canvas Cloud Particle
class CloudParticle {
    constructor(w, h, randomStart = false) {
        this.w = w;
        this.h = h;
        this.reset(randomStart);
    }

    reset(randomStart) {
        this.scale = Math.random() * 0.7 + 0.5;
        this.speed = Math.random() * 0.12 + 0.05;
        this.opacity = Math.random() * 0.14 + 0.06;
        this.y = Math.random() * (this.h * 0.25) + 30; // Float in the top 25% of the screen

        if (randomStart) {
            this.x = Math.random() * this.w;
        } else {
            this.x = -220 * this.scale;
        }

        this.isDead = false;
    }

    update() {
        this.x += this.speed;
        if (this.x > this.w + 220 * this.scale) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = `rgba(240, 245, 255, ${this.opacity})`;
        ctx.beginPath();

        const x = this.x;
        const y = this.y;
        const s = this.scale;

        // Draw fluffy cloud puffs
        ctx.arc(x, y, 35 * s, 0, Math.PI * 2);
        ctx.arc(x + 30 * s, y - 12 * s, 40 * s, 0, Math.PI * 2);
        ctx.arc(x + 65 * s, y, 32 * s, 0, Math.PI * 2);
        ctx.arc(x + 32 * s, y + 16 * s, 28 * s, 0, Math.PI * 2);

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Canvas Shooting Star Particle
class ShootingStarParticle {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.reset();
    }

    reset() {
        this.x = Math.random() * (this.w * 0.7);
        this.y = Math.random() * (this.h * 0.4);
        this.length = Math.random() * 120 + 80; // Extended length from 60-150px to 80-200px
        this.speed = Math.random() * 14 + 16;
        this.opacity = 1;
        this.angle = Math.PI / 4; // 45 degree angle fall
        this.dx = Math.cos(this.angle) * this.speed;
        this.dy = Math.sin(this.angle) * this.speed;
        this.isDead = false;
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.opacity -= 0.025; // Gradual fade

        if (this.opacity <= 0 || this.x > this.w || this.y > this.h) {
            this.isDead = true;
        }
    }

    draw(ctx) {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2.2; // Increased from 1.6 to 2.2 for better visual presence
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
        ctx.stroke();
        ctx.restore();
    }
}

// Engine to coordinate Canvas drawing and animations
class WeatherEngine {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById("weather-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.stars = [];
        this.particles = [];
        this.clouds = [];
        this.shootingStars = [];
        this.activeWeather = "clear";
        this.nightFactor = 0;
        this.running = false;

        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    setWeather(weather) {
        if (this.activeWeather === weather) return;
        this.activeWeather = weather;
        this.particles = [];
        this.clouds = [];
        this.shootingStars = [];

        if (weather === "cloudy") {
            // Pre-spawn 5 clouds on screen so it doesn't start completely cloudless
            for (let i = 0; i < 5; i++) {
                this.clouds.push(new CloudParticle(this.width, this.height, true));
            }
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        setTimeout(() => this.loop(), 16);
    }

    update() {
        // Spawning weather-specific particles if weather is toggled on
        if (this.app.settings.showWeather) {
            if (this.activeWeather === "rain") {
                if (this.particles.length < 140) {
                    this.particles.push(new RainParticle(this.width, this.height));
                }
            } else if (this.activeWeather === "snow") {
                if (this.particles.length < 90) {
                    this.particles.push(new SnowParticle(this.width, this.height));
                }
            } else if (this.activeWeather === "cloudy") {
                if (this.clouds.length < 7 && Math.random() < 0.004) {
                    this.clouds.push(new CloudParticle(this.width, this.height, false));
                }
            }
        }

        // Spawn shooting stars randomly during the night phase if celestial elements are enabled
        if (this.app.settings.showCelestial) {
            if (this.nightFactor > 0.6 && Math.random() < 0.008 && this.shootingStars.length < 2) {
                this.shootingStars.push(new ShootingStarParticle(this.width, this.height));
            }
        }

        // Update all canvas particles
        this.stars.forEach(s => s.update(this.nightFactor));

        this.particles.forEach((p, idx) => {
            p.update();
            if (p.isDead) this.particles.splice(idx, 1);
        });

        this.clouds.forEach((c, idx) => {
            c.update();
            if (c.isDead) this.clouds.splice(idx, 1);
        });

        this.shootingStars.forEach((s, idx) => {
            s.update();
            if (s.isDead) this.shootingStars.splice(idx, 1);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);



        // Stars are drawn first
        this.stars.forEach(s => s.draw(this.ctx, this.width, this.height));

        if (!this.app.settings.showWeather) return;

        // Clouds drift behind the text and rain particles
        this.clouds.forEach(c => c.draw(this.ctx));

        // Shooting stars draw
        this.shootingStars.forEach(s => s.draw(this.ctx));

        // Rain/snow particles draw on top
        this.particles.forEach(p => p.draw(this.ctx));
    }
}

// Controller to map and query real-world weather using Open-Meteo
class WeatherAPI {
    constructor(app) {
        this.app = app;
        this.lastFetch = 0;
        this.fetchInterval = 10 * 60 * 1000; // 10 minutes cache
    }

    async updateWeather() {
        if (this.app.settings.weatherMode !== "auto") return;

        const now = Date.now();
        if (now - this.lastFetch < this.fetchInterval) return;

        this.app.settings.updateWeatherStatus("Querying location...");

        try {
            // First attempt: IP-based geolocation (silent, instant, and handles sandboxed/desktop environments perfectly)
            const ipGeoUrl = "https://ipapi.co/json/";
            const geoRes = await fetch(ipGeoUrl);
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.latitude && geoData.longitude) {
                    const city = geoData.city || "Local";
                    const country = geoData.country_code ? geoData.country_code.toUpperCase() : "";
                    const displayName = country ? `${city}, ${country}` : city;
                    await this.fetchFromMeteo(geoData.latitude, geoData.longitude, displayName);
                    return;
                }
            }
        } catch (e) {
            console.warn("IP-based geolocation failed, trying browser Geolocation API...", e);
        }

        // Second attempt: Browser Geolocation API as a fallback
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    let displayName = "Local";
                    try {
                        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                        const geoRes = await fetch(geoUrl);
                        if (geoRes.ok) {
                            const geoData = await geoRes.json();
                            const city = geoData.city || geoData.locality || geoData.principalSubdivision || "Local";
                            const country = geoData.countryCode ? geoData.countryCode.toUpperCase() : "";
                            displayName = country ? `${city}, ${country}` : city;
                        }
                    } catch (e) {
                        console.warn("Reverse geocoding failed, using fallback label.", e);
                    }

                    await this.fetchFromMeteo(lat, lon, displayName);
                },
                async (error) => {
                    console.warn("Geolocation permission denied or timed out. Defaulting to London.", error);
                    await this.fetchFromMeteo(51.5074, -0.1278, "London (Default)");
                },
                { timeout: 7000 }
            );
        } else {
            console.warn("Geolocation is not supported. Defaulting to London.");
            await this.fetchFromMeteo(51.5074, -0.1278, "London (Default)");
        }
    }

    async fetchFromMeteo(lat, lon, locationLabel) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!res.ok) throw new Error("Weather API request failed");
            const data = await res.json();

            const weathercode = data.current_weather.weathercode;
            const temp = Math.round(data.current_weather.temperature);

            const mappedWeather = this.mapWeatherCode(weathercode);
            this.app.weatherEngine.setWeather(mappedWeather);
            this.lastFetch = Date.now();

            const desc = this.getWeatherDescription(weathercode);
            this.app.settings.updateWeatherStatus(`Live: ${locationLabel} - ${desc} (${temp}°C)`);
        } catch (err) {
            console.error("Live weather fetching failed", err);
            this.app.settings.updateWeatherStatus("API Error. Offline");
            // If offline, default to clear weather
            this.app.weatherEngine.setWeather("clear");
        }
    }

    mapWeatherCode(code) {
        if (code === 0) return "clear";
        if (code >= 1 && code <= 3) return "cloudy";
        if (code === 45 || code === 48) return "cloudy"; // Fog acts like cloudy
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return "rain";
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
        return "clear";
    }

    getWeatherDescription(code) {
        const descriptions = {
            0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
            45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
            55: "Dense Drizzle", 61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
            71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
            80: "Light Showers", 81: "Moderate Showers", 82: "Heavy Showers",
            85: "Slight Snow Showers", 86: "Heavy Snow Showers", 95: "Thunderstorm"
        };
        return descriptions[code] || "Clear";
    }
}

// Manager to handle user configurations, UI bindings and localStorage saving
class SettingsManager {
    constructor(app) {
        this.app = app;

        // Defaults
        this.timeMode = "auto";
        this.weatherMode = "auto";
        this.fontSelect = "Poppins";
        this.showClock = true;
        this.showCelestial = true;
        this.showWeather = true;
        this.twelveHour = false;

        this.loadSettings();
        this.initDOMReferences();
        this.initUIListeners();
        this.applyAllSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem("sky_wallpaper_settings");
            if (saved) {
                const parsed = JSON.parse(saved);
                this.timeMode = parsed.timeMode ?? this.timeMode;
                this.weatherMode = parsed.weatherMode ?? this.weatherMode;
                this.fontSelect = parsed.fontSelect ?? this.fontSelect;
                this.showClock = parsed.showClock ?? this.showClock;
                this.showCelestial = parsed.showCelestial ?? this.showCelestial;
                this.showWeather = parsed.showWeather ?? this.showWeather;
                this.twelveHour = parsed.twelveHour ?? this.twelveHour;
            }
        } catch (e) {
            console.warn("localStorage not available or corrupted. Using defaults.", e);
        }
    }

    saveSettings() {
        try {
            const config = {
                timeMode: this.timeMode,
                weatherMode: this.weatherMode,
                fontSelect: this.fontSelect,
                showClock: this.showClock,
                showCelestial: this.showCelestial,
                showWeather: this.showWeather,
                twelveHour: this.twelveHour
            };
            localStorage.setItem("sky_wallpaper_settings", JSON.stringify(config));
        } catch (e) {
            console.warn("Failed to save settings to localStorage.", e);
        }
    }

    initDOMReferences() {
        this.panel = document.getElementById("settings-panel");
        this.toggleBtn = document.getElementById("settings-toggle");
        this.closeBtn = document.getElementById("settings-close");

        this.timeModeSelect = document.getElementById("override-time");
        this.weatherModeSelect = document.getElementById("weather-mode");
        this.fontSelectElement = document.getElementById("font-select");

        this.showClockCheckbox = document.getElementById("show-clock");
        this.showCelestialCheckbox = document.getElementById("show-celestial");
        this.showWeatherCheckbox = document.getElementById("show-weather");
        this.twelveHourCheckbox = document.getElementById("twelve-hour");

        this.weatherStatusText = document.getElementById("weather-status");
        this.refreshWeatherBtn = document.getElementById("refresh-weather");
    }

    initUIListeners() {
        // Toggle Sidebar open/close
        this.toggleBtn.addEventListener("click", () => {
            const isOpen = this.panel.classList.toggle("open");
            updateInteractiveRegion(isOpen);
        });
        this.closeBtn.addEventListener("click", () => {
            this.panel.classList.remove("open");
            updateInteractiveRegion(false);
        });

        // Listeners for selectors
        this.timeModeSelect.addEventListener("change", (e) => {
            this.timeMode = e.target.value;
            this.saveSettings();
            this.app.timeController.update();
        });

        this.weatherModeSelect.addEventListener("change", (e) => {
            this.weatherMode = e.target.value;
            this.saveSettings();
            this.updateWeatherLogic();
        });

        this.fontSelectElement.addEventListener("change", (e) => {
            this.fontSelect = e.target.value;
            this.saveSettings();
            this.applyFont();
        });

        // Listeners for checkboxes
        this.showClockCheckbox.addEventListener("change", (e) => {
            this.showClock = e.target.checked;
            this.saveSettings();
            document.getElementById("clock-container").style.opacity = this.showClock ? "1" : "0";
        });

        this.showCelestialCheckbox.addEventListener("change", (e) => {
            this.showCelestial = e.target.checked;
            this.saveSettings();
            this.app.timeController.update();
        });

        this.showWeatherCheckbox.addEventListener("change", (e) => {
            this.showWeather = e.target.checked;
            this.saveSettings();
        });

        this.twelveHourCheckbox.addEventListener("change", (e) => {
            this.twelveHour = e.target.checked;
            this.saveSettings();
            this.app.timeController.update();
        });

        // Refresh Weather API
        this.refreshWeatherBtn.addEventListener("click", async () => {
            if (this.weatherMode === "auto") {
                this.app.weatherAPI.lastFetch = 0;
                await this.app.weatherAPI.updateWeather();
            }
        });

        // Click outside settings sidebar to close it
        document.addEventListener("click", (e) => {
            if (!this.panel.contains(e.target) && !this.toggleBtn.contains(e.target) && this.panel.classList.contains("open")) {
                this.panel.classList.remove("open");
                updateInteractiveRegion(false);
            }
        });

        // Update gear button interactive coordinates on window resize if closed
        window.addEventListener("resize", () => {
            if (!this.panel.classList.contains("open")) {
                updateInteractiveRegion(false);
            }
        });
    }

    applyAllSettings() {
        this.timeModeSelect.value = this.timeMode;
        this.weatherModeSelect.value = this.weatherMode;
        this.fontSelectElement.value = this.fontSelect;

        this.showClockCheckbox.checked = this.showClock;
        this.showCelestialCheckbox.checked = this.showCelestial;
        this.showWeatherCheckbox.checked = this.showWeather;
        this.twelveHourCheckbox.checked = this.twelveHour;

        document.getElementById("clock-container").style.opacity = this.showClock ? "1" : "0";
        this.applyFont();
        this.updateWeatherLogic();
    }

    applyFont() {
        const font = this.fontSelect;
        document.getElementById("clock-container").style.fontFamily = `"${font}", sans-serif`;
        document.querySelector("h2").style.fontFamily = `"${font}", sans-serif`;
    }

    updateWeatherLogic() {
        if (this.weatherMode === "auto") {
            this.refreshWeatherBtn.style.display = "flex";
            this.app.weatherAPI.updateWeather();
        } else {
            this.refreshWeatherBtn.style.display = "none";
            this.updateWeatherStatus("Weather: Manual");
            this.app.weatherEngine.setWeather(this.weatherMode);
        }
    }

    updateWeatherStatus(text) {
        this.weatherStatusText.textContent = text;
    }
}
class TimeController {
    constructor(app) {
        this.app = app;
        this.currentPhase = null;

        this.phaseGradients = {
            sunrise: "linear-gradient(135deg, #f5a623 0%, #ff7e5f 50%, #feb47b 100%)",
            day: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
            sunset: "linear-gradient(135deg, #2c3e50 0%, #fd746c 50%, #ff7e5f 100%)",
            night: "linear-gradient(135deg, #090a1f 0%, #050515 50%, #020208 100%)"
        };

        // Colors tailored to coordinate nicely during each cycle phase
        this.phaseTextColors = {
            sunrise: { text: "#975f00ff", year: "#ffe082", shadow: "rgba(139, 69, 19, 0.4)" },
            day: { text: "#181a30", year: "#181a30", shadow: "rgba(0, 0, 0, 0.15)" },
            sunset: { text: "#ffab91", year: "#ffab91", shadow: "rgba(44, 62, 80, 0.55)" },
            night: { text: "#ffffff", year: "#ffffff", shadow: "rgba(255, 255, 255, 0.1)" }
        };

        this.sun = document.getElementById("sun");
        this.moon = document.getElementById("moon");
    }

    update() {
        const now = new Date();
        const effectiveTime = this.getEffectiveTime(now);

        const hour = effectiveTime.getHours();
        const min = effectiveTime.getMinutes();
        const sec = effectiveTime.getSeconds();
        const decimalTime = hour + min / 60 + sec / 3600;

        // 1. Identify time phase and calculate Night factor for stars
        let phase = "night";
        let nightFactor = 1.0;

        if (decimalTime >= 5.0 && decimalTime < 7.0) {
            phase = "sunrise";
            nightFactor = 1.0 - (decimalTime - 5.0) / 2.0; // Fades stars out as sunrise advances
        } else if (decimalTime >= 7.0 && decimalTime < 17.0) {
            phase = "day";
            nightFactor = 0.0; // No stars
        } else if (decimalTime >= 17.0 && decimalTime < 19.0) {
            phase = "sunset";
            nightFactor = (decimalTime - 17.0) / 2.0; // Fades stars in as sunset deepens
        } else {
            phase = "night";
            nightFactor = 1.0; // Stars full opacity
        }

        this.setPhase(phase);
        this.app.weatherEngine.nightFactor = nightFactor;

        // 2. Position celestial objects along parabolic arcs
        this.updateCelestialPositions(decimalTime);

        // 3. Update the Clock Overlay and Year displays
        this.updateClockDisplay(now);
    }

    getEffectiveTime(realTime) {
        if (this.app.settings.timeMode === "auto") {
            return realTime;
        }

        const simulated = new Date(realTime);
        if (this.app.settings.timeMode === "sunrise") {
            simulated.setHours(6, 0, 0, 0);
        } else if (this.app.settings.timeMode === "day") {
            simulated.setHours(12, 0, 0, 0);
        } else if (this.app.settings.timeMode === "sunset") {
            simulated.setHours(18, 0, 0, 0);
        } else if (this.app.settings.timeMode === "night") {
            simulated.setHours(24, 0, 0, 0);
        }
        return simulated;
    }

    setPhase(phase) {
        if (this.currentPhase === phase) return;
        const prevPhase = this.currentPhase;
        this.currentPhase = phase;

        const baseBg = document.getElementById("bg-base");
        const overlayBg = document.getElementById("bg-overlay");

        if (!prevPhase) {
            baseBg.style.background = this.phaseGradients[phase];
            this.updateTextColors(phase);
            return;
        }

        // Pre-configure overlay and fade it in
        overlayBg.style.background = this.phaseGradients[phase];
        overlayBg.style.opacity = "1";

        this.updateTextColors(phase);

        // Clean up and swap base background once transition finishes
        setTimeout(() => {
            if (this.currentPhase === phase) {
                baseBg.style.background = this.phaseGradients[phase];
                overlayBg.style.transition = "none";
                overlayBg.style.opacity = "0";
                overlayBg.offsetHeight; // Force reflow repaint
                overlayBg.style.transition = "opacity 2.5s ease-in-out";
            }
        }, 2500);
    }

    updateTextColors(phase) {
        const colors = this.phaseTextColors[phase];
        const clockContainer = document.getElementById("clock-container");
        const h2 = document.querySelector("h2");
        const gearToggle = document.getElementById("settings-toggle");

        clockContainer.style.color = colors.text;
        h2.style.color = colors.year;

        const shadow = colors.shadow;
        h2.style.textShadow = `
            1px 1px 0 ${shadow}, 
            2px 2px 0 ${shadow}, 
            3px 3px 0 ${shadow}, 
            4px 4px 0 ${shadow}, 
            5px 5px 0 ${shadow}, 
            6px 6px 0 ${shadow}, 
            7px 7px 0 ${shadow}, 
            8px 8px 0 ${shadow}, 
            9px 9px 0 ${shadow}, 
            15px 15px 15px rgba(0,0,0,0.3)
        `;

        // Softly recolor gear icon so it stays readable in day vs night modes
        if (phase === "day") {
            gearToggle.style.color = "#181a30";
            gearToggle.style.borderColor = "rgba(0, 0, 0, 0.15)";
            gearToggle.style.background = "rgba(0, 0, 0, 0.05)";
        } else if (phase == "sunrise") {
            gearToggle.style.color = "#ffa";
            gearToggle.style.borderColor = "rgba(255, 255, 255, 0.18)";
            gearToggle.style.background = "rgba(255, 255, 255, 0.1)";
        } else if (phase == "sunset") {
            gearToggle.style.color = "#2c3e50";
            gearToggle.style.borderColor = "rgba(255, 255, 255, 0.18)";
            gearToggle.style.background = "rgba(255, 255, 255, 0.1)";
        } else {
            gearToggle.style.color = "#fff";
            gearToggle.style.borderColor = "rgba(255, 255, 255, 0.18)";
            gearToggle.style.background = "rgba(255, 255, 255, 0.1)";
        }
    }

    updateCelestialPositions(decimalTime) {
        if (!this.app.settings.showCelestial) {
            this.sun.style.opacity = "0";
            this.moon.style.opacity = "0";
            return;
        }

        // Sun Active Hours: 5:30 to 18:30 (13 hours)
        const sunStart = 5.5;
        const sunEnd = 18.5;

        if (decimalTime >= sunStart && decimalTime <= sunEnd) {
            const t = (decimalTime - sunStart) / (sunEnd - sunStart);
            const theta = Math.PI - t * Math.PI; // Calculate radian angle (PI to 0)

            const x = 50 + Math.cos(theta) * 44;
            const y = 92 - Math.sin(theta) * 78;

            this.sun.style.transform = `translate3d(calc(${x}vw - 70px), calc(${y}vh - 70px), 0)`;

            // Fade out near the bottom horizons
            let edgeOpacity = 1.0;
            if (t < 0.08) edgeOpacity = t / 0.08;
            if (t > 0.92) edgeOpacity = (1.0 - t) / 0.08;

            this.sun.style.opacity = edgeOpacity;
        } else {
            this.sun.style.opacity = "0";
        }

        // Moon Active Hours: 17:30 to 06:30 (13 hours)
        let moonActive = false;
        let t = 0;

        if (decimalTime >= 17.5) {
            moonActive = true;
            t = (decimalTime - 17.5) / 13.0;
        } else if (decimalTime <= 6.5) {
            moonActive = true;
            t = (decimalTime + 24 - 17.5) / 13.0;
        }

        if (moonActive) {
            const theta = Math.PI - t * Math.PI;
            const x = 50 + Math.cos(theta) * 44;
            const y = 92 - Math.sin(theta) * 78;

            this.moon.style.transform = `translate3d(calc(${x}vw - 50px), calc(${y}vh - 50px), 0)`;

            let edgeOpacity = 1.0;
            if (t < 0.08) edgeOpacity = t / 0.08;
            if (t > 0.92) edgeOpacity = (1.0 - t) / 0.08;

            this.moon.style.opacity = edgeOpacity;
        } else {
            this.moon.style.opacity = "0";
        }
    }

    updateClockDisplay(realTime) {
        document.getElementById("year").textContent = realTime.getFullYear();

        if (!this.app.settings.showClock) return;

        let hours = realTime.getHours();
        const minutes = String(realTime.getMinutes()).padStart(2, "0");
        const seconds = String(realTime.getSeconds()).padStart(2, "0");
        let ampm = "";

        if (this.app.settings.twelveHour) {
            ampm = hours >= 12 ? " PM" : " AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 is 12
        }

        const hrStr = String(hours).padStart(2, "0");
        document.getElementById("clock").textContent = `${hrStr}:${minutes}:${seconds}${ampm}`;

        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        const dateStr = realTime.toLocaleDateString(undefined, options);
        document.getElementById("date").textContent = dateStr;
    }
}

// Master Wallpaper App class
class WallpaperApp {
    constructor() {
        this.weatherEngine = new WeatherEngine(this);
        this.weatherAPI = new WeatherAPI(this);
        this.settings = new SettingsManager(this);
        this.timeController = new TimeController(this);

        this.init();
    }

    init() {
        // Instantiate 110 stars on the canvas
        for (let i = 0; i < 110; i++) {
            this.weatherEngine.stars.push(new CanvasStar());
        }

        // Start engine frame loops
        this.weatherEngine.start();

        // Sync time cycles immediately, then update once a second
        this.timeController.update();
        setInterval(() => this.timeController.update(), 1000);

        // Query live weather on startup, then poll weather API every 15 minutes
        setTimeout(() => this.weatherAPI.updateWeather(), 500);
        setInterval(() => this.weatherAPI.updateWeather(), 15 * 60 * 1000);
    }
}

// Start the application when the DOM is fully ready
function startApp() {
    if (!window.app) {
        window.app = new WallpaperApp();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
} else {
    startApp();
}
