//! Imports
import { dictionary } from "./assets/dictionary.js"
import { targetWords } from "./assets/targetWords.js"

//! Constants
const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = FLIP_ANIMATION_DURATION
//! DOM elements
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")
//! Variables
const offsetFromDate = new Date(2022, 0, 1)
const msOffset = Date.now() - offsetFromDate
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const targetWord = targetWords[Math.floor(dayOffset)]

window.onGameLoaded();

window.parent.postMessage(JSON.stringify({ type: "REQUEST_OPTIONS" }), "*");

window.addEventListener("message", (e) => {
  try {
    const message = JSON.parse(e.data);
    if (message.type === "GAME_OPTIONS") {
      const gameOptions = message.data
      console.log(gameOptions)
      const isMobile = window?.innerHeight > window?.innerWidth;
      console.log(isMobile)
      let guessGrid = document.getElementById('guess-grid')
      let keyboard = document.getElementById('keyboard')
      if(isMobile){
        guessGrid.classList.add('mobile-guess-grid')
        keyboard.classList.add('mobile-keyboard')
      }else{
        guessGrid.classList.add('guess-grid')
        keyboard.classList.add('keyboard')
      }
      let numTilesToAdd
      // keyobard property colors 
      document.styleSheets[0].cssRules[4].style.setProperty('background', gameOptions.emptyTileColor) // empty keyboard
      document.styleSheets[0].cssRules[7].style.setProperty('background', gameOptions.wrongTileColor) // wrong keyboard
      document.styleSheets[0].cssRules[8].style.setProperty('background', gameOptions.wrongLocationTileColor) // wrong location keyboard
      document.styleSheets[0].cssRules[9].style.setProperty('background', gameOptions.correctTileColor) // correct keyboard

      // guess-grid property colors
      document.styleSheets[0].cssRules[11].style.setProperty('background', gameOptions.emptyTileColor) // empty guess-grid
      document.styleSheets[0].cssRules[12].style.setProperty('background', gameOptions.activeTiles) // active guess-grid
      document.styleSheets[0].cssRules[14].style.setProperty('background', gameOptions.wrongTileColor) // wrong guess-grid
      document.styleSheets[0].cssRules[16].style.setProperty('background', gameOptions.wrongLocationTileColor) // wrong location guess-grid
      document.styleSheets[0].cssRules[17].style.setProperty('background', gameOptions.correctTileColor) // correct guess-grid
      document.getElementById('title').innerText = gameOptions.title


      // if(gameOptions.difficulty === 'normal'){
      //   numTilesToAdd = 10
      // }else if(gameOptions.difficulty === 'easy'){
      //   numTilesToAdd = 20

      // }
      const grid = document.getElementsByClassName('guess-grid')[0]
      console.log(grid)
      for(var i = 0; i < numTilesToAdd; i++){
        const tile = document.createElement("div")
        tile.classList.add('tile')
        grid.appendChild(tile)
      }


      return;
    }
  } catch (error) {}
});

const getActiveTiles = () =>
  guessGrid.querySelectorAll('[data-state="active"]')

const danceTiles = async tiles =>
  await tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance")
      tile.addEventListener(
        "animationend",
        () => tile.classList.remove("dance"),
        { once: true }
      )
    }, (index * DANCE_ANIMATION_DURATION) / 5)
  })

const shakeTiles = async tiles =>
  await tiles.forEach(tile => {
    tile.classList.add("shake")
    tile.addEventListener(
      "animationend",
      () => tile.classList.remove("shake"),
      { once: true }
    )
  })

const showAlert = (message, duration = 1000) => {
  const alert = document.createElement("div")
  alert.textContent = message
  alert.classList.add("alert")
  alertContainer.prepend(alert)

  setTimeout(() => {
    alert.classList.add("hide")
    alert.addEventListener("transitionend", () => alert.remove())
  }, duration)
}

const checkWinLose = (guess, tiles) => {
  if (guess === targetWord) {
    showAlert("You win!", 5000)
    window.onGameWon()
    danceTiles(tiles)
    stopInteraction()
    return
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
  console.log(remainingTiles)
  if (remainingTiles.length !== 0) return
  showAlert(targetWord.toUpperCase(), 10000)
  window.onGameLost();
  stopInteraction()
}

const pressKey = key => {
  const activeTiles = getActiveTiles()
  if (activeTiles.length >= WORD_LENGTH) return
  const nextTile = guessGrid.querySelector(":not([data-letter])")
  nextTile.dataset.letter = key.toLowerCase()
  nextTile.textContent = key
  nextTile.dataset.state = "active"

  
}

const deleteKey = () => {
  const activeTiles = getActiveTiles()
  const lastTile = activeTiles[activeTiles.length - 1]
  if (lastTile == null) return
  lastTile.textContent = ""
  delete lastTile.dataset.state
  delete lastTile.dataset.letter
}


document.getElementById('deleteKey').addEventListener('click', deleteKey, true)

const flipTile = async (tile, index, array, guess) => {
  const letter = tile.dataset.letter
  const key = keyboard.querySelector(`[data-key="${letter}"i]`)
  setTimeout(
    () => tile.classList.add("flip"),
    (index * FLIP_ANIMATION_DURATION) / 2
  )

  await tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip")
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct"
        // tile.classList.add('active')
        // document.getElementsByClassName('active').style.backgroundColor = 'red'
        // console.log(tile)
        key.classList.add("correct")
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location"
        key.classList.add("wrong-location")
      } else {
        tile.dataset.state = "wrong"
        key.classList.add("wrong")
      }

      if (index !== array.length - 1) return
      tile.addEventListener(
        "transitionend",
        () => {
          startInteraction()
          checkWinLose(guess, array)
        },
        { once: true }
      )
    },
    { once: true }
  )
}

const submitGuess = async () => {
  const activeTiles = [...getActiveTiles()]
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters")
    await shakeTiles(activeTiles)
    return
  }

  const guess = activeTiles.reduce(
    (word, tile) => word + tile.dataset.letter,
    ""
  )

  if (!dictionary.includes(guess)) {
    showAlert("Word doesn't exist")
    await shakeTiles(activeTiles)
    return
  }

  stopInteraction()
  activeTiles.forEach((...params) => flipTile(...params, guess))
}

function handleMouseClick({ target }) {
  target.matches("[data-key]")
    ? pressKey(target.dataset.key)
    : target.matches("[data-enter]")
    ? submitGuess()
    : null
}

function handleKeyPress({ key }) {
  key === "Enter"
    ? submitGuess()
    : key === "Backspace"
    ? deleteKey()
    : key.match(/^[a-zA-Z]$/)
    ? pressKey(key)
    : null
}

function startInteraction() {
  document.addEventListener("click", handleMouseClick)
  document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick)
  document.removeEventListener("keydown", handleKeyPress)
}

//! Starting the game
startInteraction()
