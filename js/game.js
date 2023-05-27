// Global variables
const teacherSelectScreen = document.querySelector('.teacher-select');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const moneyDisplay = document.getElementById('money-display');
const livesDisplay = document.getElementById('lives-display');
const gameInfo = document.getElementById('game-info');
const gameTitle = document.getElementById('game-title');
const characters = [];
const audio = new Audio('audio/hehe.mp3');
const bgAudio = new Audio('audio/bg.mp3');
const popAudio = new Audio('audio/pop.mp3');
const failAudio = new Audio('audio/fail.mp3');
const toinkAudio = new Audio('audio/toink.mp3');
bgAudio.volume = 0.3;
bgAudio.loop = true;
audio.volume = 0.3;
toinkAudio.volume = 0.3;
failAudio.volume = 0.3;

let activeTeacher;
let money = 0;
let lives = 5; // Initial number of lives
let zombieSpawnInterval;

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
      this.y -= 5;
      this.setPosition();
    }
  }

  moveDown() {
    if (this.y < gameContainer.clientHeight - 50) {
      this.y += 5;
      this.setPosition();
    }
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= 5;
      this.setPosition();
    }
  }

  moveRight() {
    if (this.x < gameContainer.clientWidth - 50) {
      this.x += 5;
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
      livesDisplay.textContent = `Antal liv: ${lives}`;
      if (lives === 0) {
        endGame();
      }
      this.element.remove();
      clearInterval(this.timerInterval);
      toinkAudio.play();
    }

    if (lives === 1) {
      bgAudio.playbackRate = 3;
    }
  }
}

// Teacher class (inherits from Character)
class Teacher extends Character {
  constructor(name, x, y, ability) {
    super(name, x, y);
    this.element.classList.add('teacher');
    this.ability = ability;
  }

  useAbility() {
    //console.log(`${this.name} uses ${this.ability} ability!`);
    // Implement the ability logic here
    // For now, we remove the zombie when the ability is used
    const zombies = characters.filter(character => character instanceof Zombie);
    zombies.forEach(zombie => {
      if (this.checkCollision(this, zombie)) {
        zombie.element.remove();
        clearInterval(zombie.timerInterval);
        //money += 10; // Earn money for killing zombies
        increasePoints();
        popAudio.play();
      }
    });
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
function increasePoints() {
  var basePoints = 10;  // Base points earned per ghost
  var multiplier = Math.floor(money / 100) + 1;  // Multiplier based on current points divided by 100, plus 1
  var pointsEarned = basePoints * multiplier;
  money += pointsEarned;
  updateMoneyDisplay();
}

// Create characters
function createCharacters(teacherType) {
  if (teacherType === 'fredrik') {
    characters.push(new Teacher('Fredrik', 100, 100, 'Rektor'));
  } else if (teacherType === 'brittmarie') {
    characters.push(new Teacher('Britt-Marie', 100, 100, 'Spökjägare'));
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
  moneyDisplay.textContent = `Poäng: ${money}`;
}

// Update lives display
function updateLivesDisplay() {
  livesDisplay.textContent = `Antal liv: ${lives}`;
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

// Start game
startButton.addEventListener('click', () => {
  const selectedTeacher = document.querySelector('input[name="teacher"]:checked');
  if (selectedTeacher) {
    teacherSelectScreen.style.display = 'none';
    gameInfo.style.display = 'none';
    gameTitle.style.display = 'none';
    gameContainer.style.display = 'block';
    createCharacters(selectedTeacher.value);
    activeTeacher = characters[0];
    setInitialPositions();
    spawnZombie();
    updateMoneyDisplay();
    updateLivesDisplay();
    zombieSpawnInterval = setInterval(spawnZombie, 3500); // Adjust the zombie spawn interval as needed
    bgAudio.play();
  }
});

// Add event listener for key press
document.addEventListener("keypress", function(event) {
  // Check if the pressed key is Space (key code 32)
  if (event.keyCode === 32 || event.which === 32) {
    // Trigger the button click event
    startButton.click();
  }
});

// End game
function endGame() {
	clearInterval(zombieSpawnInterval);
	gameContainer.style.display = 'none';
	teacherSelectScreen.style.display = 'block';
	gameInfo.style.display = 'block';
	gameTitle.style.display = 'block';
	money = 0;
	lives = 3;
	failAudio.play();

	setTimeout(function(){
		window.location.reload();
	}, 1200);
}

// Initialize the game
function initGame() {
  teacherSelectScreen.style.display = 'block';
}

// Run the game
initGame();
