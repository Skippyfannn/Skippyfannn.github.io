"use strict";

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");
const goPageButtons = document.querySelectorAll(".go-page");
const mainNav = document.querySelector("#mainNav");
const menuBtn = document.querySelector("#menuBtn");

function showPage(pageId) {
  pages.forEach(function (page) {
    page.classList.toggle("active-page", page.id === pageId);
  });

  navButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  mainNav.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

mainNav.addEventListener("click", function (event) {
  const button = event.target.closest(".nav-btn");
  if (button) {
    showPage(button.dataset.page);
  }
});

goPageButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showPage(button.dataset.page);
  });
});

menuBtn.addEventListener("click", function () {
  mainNav.classList.toggle("open");
});

// Form data
const nameInput = document.querySelector("#nameInput");
const goalSelect = document.querySelector("#goalSelect");
const saveGoalBtn = document.querySelector("#saveGoalBtn");
const goalMessage = document.querySelector("#goalMessage");

saveGoalBtn.addEventListener("click", function () {
  const userName = nameInput.value.trim();
  const goalText = goalSelect.options[goalSelect.selectedIndex].text;

  goalMessage.classList.remove("success", "error");
  if (userName.length < 2) {
    goalMessage.textContent = "Please enter at least 2 letters for your name.";
    goalMessage.classList.add("error");
    return;
  }

  goalMessage.textContent = "Hello " + userName + "! Your goal is: " + goalText + ".";
  goalMessage.classList.add("success");
});

//History timeline
const historyFacts = {
  "1895": {
    title: "Volleyball is created",
    text: "William G. Morgan created the sport in Holyoke, Massachusetts. It was first called Mintonette and was designed as a less physical alternative to basketball."
  },
  "1896": {
    title: "The name becomes volleyball",
    text: "During an early demonstration, people noticed that players volleyed the ball back and forth. The sport became known as volley ball, later written as volleyball."
  },
  "1947": {
    title: "The FIVB is formed",
    text: "The Fédération Internationale de Volleyball was formed to organise and develop international volleyball competitions."
  },
  "1964": {
    title: "Olympic debut",
    text: "Indoor volleyball became an official Olympic sport at the Tokyo Olympic Games."
  }
};

const timeline = document.querySelector("#timeline");
const historyDetail = document.querySelector("#historyDetail");

timeline.addEventListener("click", function (event) {
  const item = event.target.closest(".timeline-item");
  if (!item) return;

  document.querySelectorAll(".timeline-item").forEach(function (button) {
    button.classList.remove("selected");
  });
  item.classList.add("selected");

  const fact = historyFacts[item.dataset.year];
  historyDetail.innerHTML = "<h3>" + item.dataset.year + ": " + fact.title + "</h3><p>" + fact.text + "</p>";
});

// Quiz
const quizOptions = document.querySelector("#quizOptions");
const quizFeedback = document.querySelector("#quizFeedback");

quizOptions.addEventListener("click", function (event) {
  const option = event.target.closest("button");
  if (!option) return;

  quizFeedback.classList.remove("success", "error");
  if (option.dataset.answer === "correct") {
    quizFeedback.textContent = "Correct! William G. Morgan created volleyball in 1895.";
    quizFeedback.classList.add("success");
  } else {
    quizFeedback.textContent = "Not quite. Try another answer.";
    quizFeedback.classList.add("error");
  }
});

// Mini-game
const gameArea = document.querySelector("#gameArea");
const ball = document.querySelector("#ball");
const hand = document.querySelector("#hand");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const soundBtn = document.querySelector("#soundBtn");
const fullscreenBtn = document.querySelector("#fullscreenBtn");
const scoreText = document.querySelector("#score");
const missesText = document.querySelector("#misses");
const timeText = document.querySelector("#time");
const gameMessage = document.querySelector("#gameMessage");
const difficultyRange = document.querySelector("#difficultyRange");
const difficultyLabel = document.querySelector("#difficultyLabel");
const catchAudio = document.querySelector("#catchAudio");

let score = 0;
let misses = 0;
let timeLeft = 30;
let ballY = -80;
let ballX = 0;
let gameRunning = false;
let soundOn = true;
let animationId = null;
let timerId = null;
let lastFrameTime = 0;

function getDifficultySpeed() {
  const level = Number(difficultyRange.value);
  if (level === 1) return 180;
  if (level === 3) return 330;
  return 250;
}

function updateDifficultyLabel() {
  const labels = ["", "Easy", "Normal", "Hard"];
  difficultyLabel.textContent = labels[Number(difficultyRange.value)];
}

difficultyRange.addEventListener("input", updateDifficultyLabel);

function updateScoreboard() {
  scoreText.textContent = score;
  missesText.textContent = misses;
  timeText.textContent = timeLeft;
}

function randomBallPosition() {
  const maxX = gameArea.clientWidth - ball.offsetWidth;
  ballX = Math.max(0, Math.random() * maxX);
  ballY = -ball.offsetHeight - 10;
  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
}

function playSound(audioElement) {
  if (!soundOn) return;
  audioElement.currentTime = 0;
  audioElement.play().catch(function () {
    // Audio may wait for a user interaction in some browsers.
  });
}

function checkCatch() {
  const ballRect = ball.getBoundingClientRect();
  const handRect = hand.getBoundingClientRect();

  return ballRect.bottom >= handRect.top + 20 &&
    ballRect.right >= handRect.left + 15 &&
    ballRect.left <= handRect.right - 15 &&
    ballRect.top <= handRect.bottom;
}

function endGame(message) {
  gameRunning = false;
  ball.classList.add("hidden");
  gameMessage.classList.remove("hidden");
  gameMessage.textContent = message + " Final score: " + score;
  clearInterval(timerId);
  cancelAnimationFrame(animationId);
  startBtn.textContent = "Play Again";
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = (timestamp - lastFrameTime) / 1000;
  lastFrameTime = timestamp;

  ballY += getDifficultySpeed() * deltaTime;
  ball.style.top = ballY + "px";
  ball.style.transform = "rotate(" + ballY * 0.6 + "deg)";

  if (checkCatch()) {
    score += 1;
    playSound(catchAudio);
    updateScoreboard();
    randomBallPosition();
  } else if (ballY > gameArea.clientHeight) {
    misses += 1;
    updateScoreboard();
    if (misses >= 3) {
      endGame("Game over!");
      return;
    }
    randomBallPosition();
  }

  animationId = requestAnimationFrame(gameLoop);
}

function moveHand(clientX) {
  const areaRect = gameArea.getBoundingClientRect();
  let newX = clientX - areaRect.left - hand.offsetWidth / 2;
  newX = Math.max(0, Math.min(newX, gameArea.clientWidth - hand.offsetWidth));
  hand.style.left = newX + "px";
}

gameArea.addEventListener("mousemove", function (event) {
  moveHand(event.clientX);
});

gameArea.addEventListener("pointermove", function (event) {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    moveHand(event.clientX);
  }
});

function resetGame() {
  gameRunning = false;
  clearInterval(timerId);
  cancelAnimationFrame(animationId);
  score = 0;
  misses = 0;
  timeLeft = 30;
  lastFrameTime = 0;
  ball.classList.add("hidden");
  gameMessage.classList.remove("hidden");
  gameMessage.textContent = "Press Start Game";
  hand.style.left = "calc(50% - 60px)";
  startBtn.textContent = "Start Game";
  updateScoreboard();
}

function startGame() {
  resetGame();
  gameRunning = true;
  gameMessage.classList.add("hidden");
  ball.classList.remove("hidden");
  startBtn.textContent = "Restart";
  randomBallPosition();

  timerId = setInterval(function () {
    timeLeft -= 1;
    updateScoreboard();
    if (timeLeft <= 0) {
      endGame("Time's up!");
    }
  }, 1000);

  animationId = requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

soundBtn.addEventListener("click", function () {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "Sound: On" : "Sound: Off";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
});

fullscreenBtn.addEventListener("click", function () {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(function () {
      gameMessage.textContent = "Full screen is not supported in this browser.";
      gameMessage.classList.remove("hidden");
    });
  } else {
    document.exitFullscreen();
  }
});

window.addEventListener("resize", function () {
  const currentLeft = parseFloat(hand.style.left) || 0;
  const maxLeft = gameArea.clientWidth - hand.offsetWidth;
  hand.style.left = Math.min(currentLeft, maxLeft) + "px";
});

updateDifficultyLabel();
resetGame();
