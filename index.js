class SkyObjects {
    constructor(section) {
        this.element = document.createElement('i');
        this.createObject();
        this.setPosition();
        this.setSize();
        this.setAnimation();
        section.appendChild(this.element);
    }
}

class Star extends SkyObjects {
    createObject() {
        this.element.classList.add("star");
    }
    setPosition() {
        const x = Math.floor(Math.random() * window.innerWidth);
        const y = Math.floor(Math.random() * window.innerHeight);
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }

    setSize() {
        const size = Math.random() * 1;
        this.element.style.width = 1 + size + 'px';
        this.element.style.height = 1 + size + 'px';
    }

    setAnimation() {
        const duration = Math.random() * 3;
        this.element.style.animationDuration = 3 + duration + 's';
        this.element.style.animationDelay = duration + 's';
    }
}

class ShootingStar extends SkyObjects {
    createObject() {
        this.element.classList.add("shooting-star");
    }
    setPosition() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight / 2);
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }
    setSize() {
        const size = Math.random() * 2;
        this.element.style.width = size + "px";
        this.element.style.height = size * 50 + "px";
    }
    setAnimation() {
        this.duration = Math.random() * 2 + 3;
        this.element.style.animationDuration = this.duration + 's';
        setTimeout(() => {
            this.element.remove();
        }, this.duration * 1000);
    }
}

class Sky {
    constructor(section, time) {
        this.section = section;
        this.hours = time.getHours();
        this.setSky();
    }
    setSky() {
        if(this.hours < 18 && this.hours >= 6) {
            this.day();
        } else {
            this.night();
        }
    }
    setContentColour(stat_clr, year_clr, shadow_clr) {
        document.getElementById("extra").style.color = stat_clr;
        const h2 = document.getElementsByTagName("h2")[0];
        h2.style.color = year_clr;
        h2.style.textShadow = `1px 1px 0 ${shadow_clr}, 2px 2px 0 ${shadow_clr}, 3px 3px 0 ${shadow_clr}, 4px 4px 0 ${shadow_clr}, 5px 5px 0 ${shadow_clr}, 6px 6px 0 ${shadow_clr}, 7px 7px 0 ${shadow_clr}, 8px 8px 0 ${shadow_clr}, 9px 9px 0 ${shadow_clr}, 20px 20px 0 rgba(0,0,0,0.2)`;
    }
    day() {
        document.getElementById("sun").style.display = "block";
        document.getElementById("moon").style.display = "none";
        this.section.style.background = "linear-gradient(45deg, #87ceeb, #b0e0e6, #f0f8ff)";
        this.setContentColour("black", "#222", "#333");
        // Hide shooting stars
        for (let i = 0; i < this.section.getElementsByTagName("i").length; i++) {
            this.section.getElementsByTagName("i")[i].style.display = "none";
        }
    }
    night() {
        document.getElementById("sun").style.display = "none";
        document.getElementById("moon").style.display = "block";
        this.section.style.background = "linear-gradient(135deg, #0b0c1e, #090a1a, #060617)";
        this.setContentColour("white", "#fff", "#ccc");
        // Show shooting stars
        for (let i = 0; i < this.section.getElementsByTagName("i").length; i++) {
            this.section.getElementsByTagName("i")[i].style.display = "block";
        }
    }
}

class WallpaperApp {
    constructor(section) {
        this.countStars = 70;
        this.version = "v 2.2";
        this.section = document.querySelector(section);
        this.stars = [];
        this.init();
    }

    static leapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }

    init() {
        for (let i = 0; i < this.countStars; i++) {
            this.stars.push(new Star(this.section));
        }
        document.getElementById("version").innerHTML = this.version;
        this.start();
    }

    start() {
        setInterval(() => this.update(), 100);
    }

    update() {
        const time = new Date();
        this.sky = new Sky(this.section, time);
        const daysList = [
            31,
            WallpaperApp.leapYear(time.getFullYear()) ? 29 : 28,
            31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ];
        const monthsList = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        document.getElementById("year").innerHTML = time.getFullYear();
        const days = daysList[time.getMonth()];
        document.getElementById("moon").style.top = (100 / days) * time.getDate() + "%";
        document.getElementById("date").innerHTML = `${time.getDate()} ${monthsList[time.getMonth()]} ${time.getFullYear()}`;
        if(Math.random() < 0.05) new ShootingStar(this.section);
    }
}

// Start the app
new WallpaperApp('section');
