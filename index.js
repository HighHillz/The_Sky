//List of functions
//Check for leap year
function leapYear(Year) {
  return Year%4 == 0 && Year%100 != 0 || Year%400 == 0;
}

function generateRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

//Draw stars
function stars(Number) {
  const count = Number; //Number of stars
  const section = document.querySelector('section');
  var i = 0;

  while(i < count) {
    const star = document.createElement('i');
    star.classList.add("star");

    //Star position
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    star.style.left = x+'px';
    star.style.top = y+'px';

    //Star size
    const size = Math.random() * 1;
    star.style.width = 1+size+'px';
    star.style.height = 1+size+'px';

    //Twinkle animation duration
    const duration = Math.random() * 3;
    star.style.animationDuration = 3+duration+'s';
    star.style.animationDelay = duration+'s';

    section.appendChild(star); //Display star
    i++;
  }
}

function sprinkles(Number) {
  const count = Number; //Number of sprinkles
  const section = document.querySelector('#bday');
  var i = 0;

  while(i < count) {
    const sprinkle = document.createElement('i');
    sprinkle.classList.add("sprinkle");

    sprinkle.style.backgroundColor = generateRandom(colours);
    sprinkle.style.transform = "rotate("+ Math.random()*360 + "deg)";

    //Sprinkle position
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    sprinkle.style.left = x+'px';
    sprinkle.style.top = y+'px';

    section.appendChild(sprinkle); //Display sprinkle
    i++;
  }
}

function day() {
  //Day night transition
    //Display sun only
    document.getElementById("sun").style.display = "block";
    document.getElementById("moon").style.display = "none";

    //Blue sky
    document.getElementsByTagName('section')[0].style.background = "linear-gradient(135deg,#5bdeff,#99ebff,#5bdeff)";

    document.getElementById("version").style.color = "black";

    //Year text colours
    document.getElementsByTagName("h2")[0].style.color = "#222";
    document.getElementsByTagName("h2")[0].style.textShadow = `1px 1px 0 #333, 2px 2px 0 #333, 3px 3px 0 #333, 4px 4px 0 #333, 5px 5px 0 #333, 6px 6px 0 #333, 7px 7px 0 #333, 8px 8px 0 #333, 9px 9px 0 #333, 20px 20px 0 rgba(0,0,0,0.2)`;
  
    //Hide stars
    for(var i = 0; i < countStars; i++) {
      document.getElementsByTagName('section')[0].getElementsByTagName("i")[i + countSprinkles].style.display = "none";
    }
}

function night() {
  //Show moon only
  document.getElementById("sun").style.display = "none";
  document.getElementById("moon").style.display = "block";
  
  //Dark sky
  document.getElementsByTagName('section')[0].style.background = "linear-gradient(135deg,#111,#222,#111)";

  document.getElementById("version").style.color = "white";
  
  //Year text colours
  document.getElementsByTagName("h2")[0].style.color = "white";
  document.getElementsByTagName("h2")[0].style.textShadow = `1px 1px 0 #ccc, 2px 2px 0 #ccc, 3px 3px 0 #ccc, 4px 4px 0 #ccc, 5px 5px 0 #ccc, 6px 6px 0 #ccc, 7px 7px 0 #ccc, 8px 8px 0 #ccc, 9px 9px 0 #ccc, 20px 20px 0 rgba(0,0,0,0.2)`;

  //Show stars
  for(var i = 0; i < countStars; i++) {
    document.getElementsByTagName('section')[0].getElementsByTagName("i")[i + countSprinkles].style.display = "block";
  }
}

function dayNight(time) {
  if(time.getHours() < 18 && time.getHours() >= 6) {
    day();
  } else {
    night();
  }
  
  document.getElementById("version").innerHTML = version;
}

function newYear() {
  document.getElementById("version").innerHTML = version + " (Happy New Year)";

  document.getElementsByTagName("h2")[0].style.color = "gold";
  document.getElementsByTagName("h2")[0].style.fontSize = "7vw";
  document.getElementsByTagName("h2")[0].style.textShadow = `1px 1px 0 #ebcf00, 2px 2px 0 #ebcf00, 3px 3px 0 #ebcf00, 4px 4px 0 #ebcf00, 5px 5px 0 #ebcf00, 6px 6px 0 #ebcf00, 7px 7px 0 #ebcf00, 8px 8px 0 #ebcf00, 9px 9px 0 #ebcf00, 20px 20px 0 rgba(0,0,0,0.2)`;
}

//Main code

//Write the date
setInterval(function() {
  const time = new Date(); //Get current date
  
  //Number of days to move the moon accordingly
  const daysList = [
    31, //Jan
    leapYear(time.getFullYear()) ? 29 : 28, //Feb - Non leap year, Leap year
    31, //Mar
    30, //Apr
    31, //May
    30, //Jun
    31, //Jul
    31, //Aug
    30, //Sep
    31, //Oct
    30, //Nov
    31  //Dec
  ];
  
  //Conditions for custom messages
  if(time.getMonth() == 0 && time.getDate() == 1) {
    document.getElementById("year").innerHTML = time.getFullYear();
    dayNight(time);
    newYear();
  } else {
    document.getElementById("year").innerHTML = time.getFullYear();
    dayNight(time);
  }
  
  const days = daysList[time.getMonth()];
  document.getElementById("moon").style.top = (100/days) * time.getDate() + "%";
  
}, 100);

//Display stars
const countStars = 100;
const countSprinkles = 50;
const colours = ["red","blue","green","white","yellow","orange","purple","cyan"]

const version = "v 2.1";

stars(countStars); 
sprinkles(countSprinkles);