//! Imports
import { englishDictionary } from "./assets/dictionary.js";
import { englishTargetWords } from "./assets/targetWords.js";
// import { spanishDictionary } from "./assets/dictionarySpanish";
// import { spanishTargetWords } from "./assets/targetWordsSpanish";

//! Constants
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = FLIP_ANIMATION_DURATION;
//! DOM elements
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
//! Variables

// old way of selecting word

// const offsetFromDate = new Date(2022, 0, 1);
// const msOffset = Date.now() - offsetFromDate;
// // every day
// const dayOffset = msOffset / 1000 / 60 / 60 / 24;
// let targetWord = englishTargetWords[Math.floor(dayOffset)]; // changes the target word every day
// let dictionary = englishDictionary;

// new way of selecting word
let randomIndex;
let targetWord;
let timeInterval = 8.64 * 10 ** 7;
let playerAttempts = 0;
let dictionary = englishDictionary;
let outOfScore = 4;
window.onGameLoaded();

window.parent.postMessage(JSON.stringify({ type: "REQUEST_OPTIONS" }), "*");

window.addEventListener("message", (e) => {
  try {
    const message = JSON.parse(e.data);
    if (message.type === "GAME_OPTIONS") {
      const gameOptions = message.data;

      //  be cautious when updating css style rules on styles.css page as we need to update indices below appropriately if new styles (class names) are added

      let numTilesToAdd;
      // keyobard property colors
      document.styleSheets[0].cssRules[4].style.setProperty(
        "background",
        gameOptions.emptyTileColor
      ); // empty keyboard
      document.styleSheets[0].cssRules[7].style.setProperty(
        "background",
        gameOptions.wrongTileColor
      ); // wrong keyboard
      document.styleSheets[0].cssRules[8].style.setProperty(
        "background",
        gameOptions.wrongLocationTileColor
      ); // wrong location keyboard
      document.styleSheets[0].cssRules[9].style.setProperty(
        "background",
        gameOptions.correctTileColor
      ); // correct keyboard

      // guess-grid property colors
      document.styleSheets[0].cssRules[11].style.setProperty(
        "background",
        gameOptions.emptyTileColor
      ); // empty guess-grid
      document.styleSheets[0].cssRules[12].style.setProperty(
        "background",
        gameOptions.activeTileColor
      ); // active guess-grid
      document.styleSheets[0].cssRules[14].style.setProperty(
        "background",
        gameOptions.wrongTileColor
      ); // wrong guess-grid
      document.styleSheets[0].cssRules[16].style.setProperty(
        "background",
        gameOptions.wrongLocationTileColor
      ); // wrong location guess-grid
      document.styleSheets[0].cssRules[17].style.setProperty(
        "background",
        gameOptions.correctTileColor
      ); // correct guess-grid
      document.getElementById("title").innerText = gameOptions.title;

      // if (gameOptions.language === "spanish") {
      //    targetWord = spanishTargetWords[Math.floor(dayOffset)]; // changes the target word every day
      //    dictionary = spanishDictionary;
      // }

      // timeInterval gameOPtions

      // 900000ms == 15 mins
      // 3.6e+6 == 1 hr
      // 1.08e+7 == 3hr
      // 2.88e+7 == 8hr
      // 8.64e+7 == 1 day

      if (gameOptions.timeInterval === "15 minutes") {
        timeInterval = 900000;
      } else if (gameOptions.timeInterval === "1 hour") {
        timeInterval = 3.6 * 10 ** 6;
      } else if (gameOptions.timeInterval === "3 hour") {
        timeInterval = 1.08 * 10 ** 7;
      } else if (gameOptions.timeInterval === "8 hour") {
        timeInterval = 2.88 * 10 ** 7;
      }

      // difficulty gameOptions
      if (gameOptions.difficulty === "normal") {
        numTilesToAdd = 10;
        outOfScore = 6;
      } else if (gameOptions.difficulty === "easy") {
        numTilesToAdd = 20;
        outOfScore = 8;
        // adjust tile size
        document.styleSheets[0].cssRules[10].style.setProperty(
          "grid-template-rows",
          "repeat(8, 3em)"
        );
        document.styleSheets[0].cssRules[10].style.setProperty(
          "grid-template-columns",
          "repeat(5, 3em)"
        );

        // adjusts tile size on easy mode since they're 8 rows taking up more space and being played on a mobile device
        // cssRules[27] is a media query selector and we're accessing the cssRules or that object and set the right property to make it look nice on mobile devices
        document.styleSheets[0].cssRules[27].cssRules[0].style.setProperty(
          "grid-template-rows",
          "repeat(8, 5em)"
        );
        document.styleSheets[0].cssRules[27].cssRules[0].style.setProperty(
          "grid-template-columns",
          "repeat(5, 5em)"
        );
      }
      const grid = document.getElementsByClassName("guess-grid")[0];

      for (var i = 0; i < numTilesToAdd; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        grid.appendChild(tile);
      }

      return;
    }
  } catch (error) {}
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if (getCookie("date") == "" && getCookie("index") == "") {
  document.cookie = "date=" + new Date().getTime();
  randomIndex = Math.floor(Math.random() * englishTargetWords.length);
  document.cookie = "index=" + randomIndex;
} else {
  if (new Date().getTime() > timeInterval + Number(getCookie("date"))) {
    document.cookie = "date=" + new Date().getTime();
    randomIndex = Math.floor(Math.random() * englishTargetWords.length);
    document.cookie = "index=" + randomIndex;
  } else {
    if (getCookie("index") == "") {
      randomIndex = Math.floor(Math.random() * englishTargetWords.length);
      document.cookie = "index=" + randomIndex;
    } else {
      randomIndex = Number(getCookie("index"));
    }
  }
}
targetWord = englishTargetWords[randomIndex];
console.log(targetWord);

window.setInterval(() => {
  randomIndex = Math.floor(Math.random() * englishTargetWords.length);
  targetWord = englishTargetWords[randomIndex];
}, timeInterval);

const getActiveTiles = () =>
  guessGrid.querySelectorAll('[data-state="active"]');

const danceTiles = async (tiles) =>
  await tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => tile.classList.remove("dance"),
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });

const shakeTiles = async (tiles) =>
  await tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => tile.classList.remove("shake"),
      { once: true }
    );
  });

const showAlert = (message, duration = 1000) => {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => alert.remove());
  }, duration);
};

const checkWinLose = (guess, tiles) => {
  if (guess === targetWord) {
    showAlert("You win!", 5000);
    window.onGameWon(playerAttempts + 1);
    document.cookie = "won=true";
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length !== 0) {
    playerAttempts += 1;
    return;
  }
  showAlert(targetWord.toUpperCase(), 10000);
  window.onGameLost();
  stopInteraction();
};

const pressKey = (key) => {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
};

const deleteKey = () => {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
};

document.getElementById("deleteKey").addEventListener("click", deleteKey, true);

const flipTile = async (tile, index, array, guess) => {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(
    () => tile.classList.add("flip"),
    (index * FLIP_ANIMATION_DURATION) / 2
  );

  await tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index !== array.length - 1) return;
      tile.addEventListener(
        "transitionend",
        () => {
          startInteraction();
          checkWinLose(guess, array);
        },
        { once: true }
      );
    },
    { once: true }
  );
};

const submitGuess = async () => {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    await shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce(
    (word, tile) => word + tile.dataset.letter,
    ""
  );

  if (!dictionary.includes(guess)) {
    showAlert("Word doesn't exist");
    await shakeTiles(activeTiles);
    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
};

function handleMouseClick({ target }) {
  target.matches("[data-key]")
    ? pressKey(target.dataset.key)
    : target.matches("[data-enter]")
    ? submitGuess()
    : null;
}

function handleKeyPress({ key }) {
  key === "Enter"
    ? submitGuess()
    : key === "Backspace"
    ? deleteKey()
    : key.match(/^[a-zA-Z]$/)
    ? pressKey(key)
    : null;
}

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

//! Starting the game
startInteraction();

// if (getCookie("won") === "true") {
//   console.log("tru");
//   stopInteraction();
//   var date = new Date(0);
//   date.setMilliseconds(
//     timeInterval + Number(getCookie("date")) - new Date().getTime()
//   ); // specify value for SECONDS here
//   console.log(date)
//   var timeString = date.toISOString().substring(11, 19);
//   console.log(timeString);
//   showAlert(
//     "You already won! Please come back in " + timeString + " to play again",
//     200000
//   );
// }
