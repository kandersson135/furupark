// Global variables
const teacherSelectScreen = document.querySelector('.teacher-select');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const gameControls = document.getElementById('gameControls');
const dUp = document.getElementById('dUp');
const dLeft = document.getElementById('dLeft');
const dDown = document.getElementById('dDown');
const dright = document.getElementById('dRight');
const actionButton = document.getElementById('actionButton');
const moneyDisplay = document.getElementById('money-display');
const livesDisplay = document.getElementById('lives-display');
const speechBubble = document.getElementById('speech-bubble');
const highScoresList = document.getElementById('highScoresList');
const highScoresTitle = document.getElementById('highScoresTitle');
const gameInfo = document.getElementById('game-info');
const gameTitle = document.getElementById('game-title');
const teacher = document.querySelector('.teacher');
const characters = [];
const audio = new Audio('audio/hehe.mp3');
const bgAudio = new Audio('audio/bg1.mp3');
const popAudio = new Audio('audio/pop.mp3');
const failAudio = new Audio('audio/fail.mp3');
const toinkAudio = new Audio('audio/toink.mp3');
bgAudio.volume = 0.3;
bgAudio.loop = true;
audio.volume = 0.1;
toinkAudio.volume = 0.1;
failAudio.volume = 0.1;
popAudio.volume = 0.3;

let activeTeacher;
let money = 0;
let lives = 5; // Initial number of lives
let zombieSpawnInterval;
let highScores = [
];

// Character class
class Character {
  constructor(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.element = document.createElement('div');
    this.element.className = 'character';
    gameContainer.appendChild(this.element);
  }

  setPosition() {
    this.element.style.left = this.x + 105 + 'px';
    this.element.style.top = this.y + 45 + 'px';
  }

  moveUp() {
    if (this.y > 0) {
      this.y -= activeTeacher.speed;
      this.setPosition();
    }
  }

  moveDown() {
    if (this.y < gameContainer.clientHeight - 50) {
      this.y += activeTeacher.speed;
      this.setPosition();
    }
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= activeTeacher.speed;
      this.setPosition();
    }
  }

  moveRight() {
    if (this.x < gameContainer.clientWidth - 50) {
      this.x += activeTeacher.speed;
      this.setPosition();
    }
  }
}

// Zombie class (inherits from Character)
class Zombie extends Character {
  constructor(x, y) {
    super('Zombie', x, y);
    this.element.classList.add('zombie');
    this.startTime = Date.now(); // Time when the zombie is spawned
    this.timerElement = document.createElement('div');
    this.timerElement.className = 'timer';
    this.element.appendChild(this.timerElement);
    this.timerInterval = setInterval(this.updateTimer.bind(this), 1000);
    this.updateTimer();
  }

  updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const timeLimit = 8000; // Time limit in milliseconds (adjust as needed)
    const remainingTime = Math.max(0, timeLimit - elapsedTime);
    const seconds = Math.ceil(remainingTime / 1000);
    //this.timerElement.textContent = seconds;

    if (remainingTime === 0) {
      lives--; // Subtract one life when the time limit is reached
      //livesDisplay.textContent = lives;
      livesDisplay.textContent = activeTeacher.name + ': ' + lives;
      if (lives === 0) {
        endGame();
      }
      this.element.remove();
      clearInterval(this.timerInterval);
      toinkAudio.play();
    }
  }
}

// Teacher class (inherits from Character)
class Teacher extends Character {
  constructor(name, x, y, ability, speed, points) {
    super(name, x, y);
    this.element.classList.add('teacher');
    this.ability = ability;
    this.speed = speed;
    this.points = points
    this.abilityCooldown = 0;
  }

  useAbility() {
    if (this.abilityCooldown === 0) {
      const zombies = characters.filter(character => character instanceof Zombie);
      zombies.forEach(zombie => {
        if (this.checkCollision(this, zombie)) {
          zombie.element.remove();
          clearInterval(zombie.timerInterval);
          //money += activeTeacher.points;
          //updateMoneyDisplay();
          increasePoints();
          popAudio.play();
        }
      });

      // Set the cooldown duration in milliseconds
      const abilityCooldownDuration = 1000; // 1 second

      // Disable ability usage for the cooldown duration
      this.abilityCooldown = abilityCooldownDuration;
      setTimeout(() => {
        this.abilityCooldown = 0;
      }, abilityCooldownDuration);
    }
  }

  checkCollision(character1, character2) {
    const tolerance = 25; // Adjust this value as needed
    return (
      Math.abs(character1.x - character2.x) <= tolerance &&
      Math.abs(character1.y - character2.y) <= tolerance
    );
  }
}

// Increase points
/*
function increasePoints() {
  //var basePoints = 10;  // Base points earned per ghost
  var basePoints = activeTeacher.points;
  var multiplier = Math.floor(money / 1000) + 1;  // Multiplier based on current points divided by 100, plus 1
  var pointsEarned = basePoints * multiplier;
  money += pointsEarned;
  updateMoneyDisplay();
}
*/

// Increase points
function increasePoints() {
  var basePoints = activeTeacher.points;  // Base points earned per ghost
  var multiplier = Math.floor(money / 100) + 1;  // Multiplier based on current points divided by 100, plus 1

  // Add additional factors for difficulty scaling
  var difficultyFactor = 1.0;  // Adjust this factor based on desired difficulty
  var maxMultiplier = 5;  // Maximum multiplier value to limit point growth

  // Apply difficulty scaling and limit the multiplier
  multiplier = Math.min(multiplier * difficultyFactor, maxMultiplier);

  var pointsEarned = basePoints * multiplier;
  money += pointsEarned;
  updateMoneyDisplay();
}

// Create characters
/*
function createCharacters(teacherType) {
  if (teacherType === 'fredrik') {
    characters.push(new Teacher('Fredrik', 100, 100, 'Rektor'));
  } else if (teacherType === 'brittmarie') {
    characters.push(new Teacher('Britt-Marie', 100, 100, 'Spökjägare'));
  }
}
*/

// Name, x, y, ability, speed, points
function createCharacters(teacherType) {
  if (teacherType === 'fredrik') {
    const fredrik = new Teacher('Fredrik', 100, 100, 'Rektor', 5, 20);
    fredrik.element.style.backgroundImage = "url(img/teacher.png)";
    characters.push(fredrik);
  } else if (teacherType === 'renee') {
    const renee = new Teacher('Renée', 100, 100, 'Skolhandläggare', 7, 10);
    renee.element.style.backgroundImage = "url(img/teacher2.png)";
    characters.push(renee);
  }
}

// Set initial positions
function setInitialPositions() {
  characters.forEach(character => character.setPosition());
}

// Spawn a zombie
function spawnZombie() {
  const x = getRandomPosition(gameContainer.clientWidth - 50);
  const y = getRandomPosition(gameContainer.clientHeight - 50);
  characters.push(new Zombie(x, y));
  setInitialPositions();
  audio.play();
}

// Generate a random position
function getRandomPosition(max) {
  return Math.floor(Math.random() * max) / 50 * 50;
}

// Update money display
function updateMoneyDisplay() {
  const scoreStr = money.toString().padStart(6, '0');
  moneyDisplay.textContent = scoreStr;
  //moneyDisplay.textContent = shortenNumber(money, 2);
}

// Update lives display
function updateLivesDisplay() {
  //livesDisplay.textContent = lives;
  //livesDisplay.textContent = `Fredrik: ${lives}`;
  livesDisplay.textContent = activeTeacher.name + ': ' + lives;
}


// Key event listener
document.addEventListener('keydown', (event) => {
  if (activeTeacher) {
    const key = event.key;

    switch (key) {
      case 'w':
        activeTeacher.moveUp();
        break;
      case 's':
        activeTeacher.moveDown();
        break;
      case 'a':
        activeTeacher.moveLeft();
        break;
      case 'd':
        activeTeacher.moveRight();
        break;
      case 'Enter':
        activeTeacher.useAbility();
        break;
    }
  }
});


let timerValue = 0
let interval;

const pressUp = () => {
  interval = setInterval(() => {
    timerValue++
    activeTeacher.moveUp();
    document.body.style.webkitUserSelect = "none";
  }, 30)
}

const pressDown = () => {
  interval = setInterval(() => {
    timerValue++
    activeTeacher.moveDown();
    document.body.style.webkitUserSelect = "none";
  }, 30)
}

const pressRight = () => {
  interval = setInterval(() => {
    timerValue++
    activeTeacher.moveRight();
    document.body.style.webkitUserSelect = "none";
  }, 30)
}

const pressLeft = () => {
  interval = setInterval(() => {
    timerValue++
    activeTeacher.moveLeft();
    document.body.style.webkitUserSelect = "none";
  }, 30)
}

const buttonRelease = () => {
  clearInterval(interval)
  timerValue = 0
  document.body.style.webkitUserSelect = null;
}

dUp.addEventListener("touchstart", pressUp);
dUp.addEventListener("touchend", buttonRelease);

dDown.addEventListener("touchstart", pressDown);
dDown.addEventListener("touchend", buttonRelease);

dLeft.addEventListener("touchstart", pressLeft);
dLeft.addEventListener("touchend", buttonRelease);

dRight.addEventListener("touchstart", pressRight);
dRight.addEventListener("touchend", buttonRelease);

actionButton.addEventListener('touchstart', () => {
  activeTeacher.useAbility();
});



/*
// Key event listener
const keysPressed = {};

document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
  handleKeyPress();
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});

function handleKeyPress() {
  if (activeTeacher) {
    if (keysPressed['w'] || keysPressed['ArrowUp']) {
      activeTeacher.moveUp();
    }

    if (keysPressed['s'] || keysPressed['ArrowDown']) {
      activeTeacher.moveDown();
    }

    if (keysPressed['a'] || keysPressed['ArrowLeft']) {
      activeTeacher.moveLeft();
    }

    if (keysPressed['d'] || keysPressed['ArrowRight']) {
      activeTeacher.moveRight();
    }

    if (keysPressed[' '] || keysPressed['Space']) {
      activeTeacher.useAbility();
    }
  }
}
*/

function getRandomInterval(min, max) {
  return Math.random() * (max - min) + min;
}

// Start game
startButton.addEventListener('click', () => {
  const selectedTeacher = document.querySelector('input[name="teacher"]:checked');
  if (selectedTeacher) {
    teacherSelectScreen.style.display = 'none';
    gameInfo.style.display = 'none';
    gameTitle.style.display = 'none';
    speechBubble.style.display = 'none';
    highScoresList.style.display = 'none';
    highScoreTitle.style.display = 'none';
    gameContainer.style.display = 'block';
    //gameControls.style.display = 'block';
    //actionButton.style.display = 'block';
    createCharacters(selectedTeacher.value);
    activeTeacher = characters[0];
    setInitialPositions();
    spawnZombie();
    updateMoneyDisplay();
    updateLivesDisplay();
    //zombieSpawnInterval = setInterval(spawnZombie, 3500);
    zombieSpawnInterval = setInterval(spawnZombie, getRandomInterval(2500, 3500));
    bgAudio.play();
    playbackRate();
  }
});

// CHange playback rate
function playbackRate() {
  window.setInterval( function(){
    if (lives === 1) {
      bgAudio.playbackRate = 1.2;
    }
  },10);
}

// End game
function endGame() {
	clearInterval(zombieSpawnInterval);
	//gameContainer.style.display = 'none';
	//ateacherSelectScreen.style.display = 'block';
	//gameInfo.style.display = 'block';
	//gameTitle.style.display = 'block';
	//money = 0;
	//lives = 5;
  bgAudio.pause();
	failAudio.play();

  /*
	setTimeout(function(){
		window.location.reload();
	}, 2500);
  */
  setTimeout(function(){
    // Prompt the player to enter their name
    const playerName = prompt('Skriv in ditt namn:');

    // Only proceed if the player entered a name
    if (playerName) {
      // Create a new object with the player's name and score
      const playerScore = { name: playerName, score: money };

      // Add the player's score to the high scores array
      highScores.push(playerScore);

      // Sort the high scores array
      highScores.sort((a, b) => b.score - a.score);

      // Limit the number of high scores
      const maxHighScores = 10;
      highScores = highScores.slice(0, maxHighScores);

      // Save the updated high scores
      localStorage.setItem('highScores', JSON.stringify(highScores));

      // Display the high scores
      //displayHighScores();

      window.location.reload();
    } else {
      window.location.reload();
    }
  }, 800);
}

// Function to display high scores in a list
function displayHighScores() {
  const list = document.getElementById('highScoresList');

  // Clear existing list items
  while (list.firstChild) {
    list.firstChild.remove();
  }

  // Retrieve high scores from local storage
  const savedHighScores = JSON.parse(localStorage.getItem('highScores'));

  if (savedHighScores) {
    highScores = savedHighScores;

    // Iterate through high scores and create list items
    highScores.forEach((score, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${index + 1}. ${score.name} - ${score.score}`;
      list.appendChild(listItem);
    });
  }
}

// Initialize the game
function initGame() {
  teacherSelectScreen.style.display = 'block';
  //gameControls.style.display = 'none';
  //actionButton.style.display = 'none';
  displayHighScores();
}

// Run the game
initGame();


//Disable right click
document.addEventListener("contextmenu", function (e) {
	e.preventDefault();
}, false);
