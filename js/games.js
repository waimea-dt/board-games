const games = {
    "pinned" : {
        "name": "Pinned",
        "icon": "📌",
        "instructions": `
            <h4>Game Setup</h4>
            <ul>
                <li>A row of 16 squares, numbered 1 to 16 from left to right</li>
                <li>5 counters (total) are placed randomly on the board - 4 white and 1 black</li>
                <li>Decide who goes first</li>
            </ul>

            <h4>Gameplay</h4>
            <ul>
                <li>Players take turns - You may not skip your turn</li>
                <li>
                    On your turn you must do exactly one of the following:
                    <ul>
                        <li>Slide any counter (black or white) any number of squares to the left, as long as no other counter is in the way and the destination square is empty, or...</li>
                        <li>Remove the counter on square 1 (only if a counter is there)</li>
                    </ul>
                </li>
            </ul>

            <h4>Win Condition</h4>
            <p>The player who removes the black counter from square 1 wins</p>
        `,
        "boardSize": 16,
        "whiteTokens": 6,
        "blackTokens": 1,
    },
    "squeeze" : {
        "name": "The Squeeze",
        "icon": "🗜️",
        "instructions": "Pinned instructions",
        "boardSize": 12,
        "whiteTokens": 6,
        "blackTokens": 1,
    },
    "leapfrog" : {
        "name": "Leap Frog",
        "icon": "🐸",
        "instructions": "Pinned instructions",
        "boardSize": 12,
        "whiteTokens": 6,
        "blackTokens": 1,
    },
    "chain" : {
        "name": "Chain Reaction",
        "icon": "💣",
        "instructions": "Pinned instructions",
        "boardSize": 12,
        "whiteTokens": 6,
        "blackTokens": 1,
    },
}

const white = 'white'
const black = 'black'
const empty = 'empty'

const game = {
    "config": null,

    "players": ['Player 1', 'Player 2'],
    "scores": [0, 0],
    "moves": [0, 0],

    "board": [],

    "inProgress": false,
    "turn": 0,

    "isSelecting": false,
    "canSelect": [],
    "selection": null,

    "isPlacing": false,
    "canPlace": [],
    "placement": null,
}

let selectEl, nameEl, statusEl, infoEl, instructEl, boardEl = null


document.addEventListener("DOMContentLoaded", initialise)


function initialise() {
    selectEl = document.getElementById("game-select")
    nameEl = document.getElementById('game-name')
    statusEl = document.getElementById('game-status')
    infoEl = document.getElementById('game-info')
    instructEl = document.getElementById('game-instructions')
    boardEl = document.querySelector('board')

    let options = ""
    for (const [id, game] of Object.entries(games)) {
        options += `<option value="${id}">${game.name}</option>`
    }
    selectEl.innerHTML = options
    selectEl.addEventListener("change", setupGame)

    setupGame()
    showBoard()
    getNames()
}

function setupGame() {
    game.config = games[selectEl.value]
    console.log("Selected", game.config.name)
    if (!game.config) throw new Error("No selected game")

    nameEl.innerText = `${game.config.name} ${game.config.icon}`

    const gameInstructions = document.getElementById("game-instructions")
    gameInstructions.innerHTML = `
        <summary>Instructions for ${game.config.name}</summary>
        <h3>How to Play ${game.config.name} ${game.config.icon}</h3>
        ${game.config.instructions}
    `
    initialiseBoard()
}

function initialiseBoard() {
    createEmptyBoard(game.config.boardSize)
    placeCounterRandomly(
        white,
        game.config.whiteTokens,
        1,
        game.config.boardSize - 1
    )
    placeCounterRandomly(
        black,
        game.config.blackTokens,
        Math.floor(game.config.boardSize / 3),
        game.config.boardSize - 1
    )
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function createEmptyBoard(size) {
    game.board.size = 0
    let count = size
    while (count > 0) {
        game.board.push(empty)
        count--
    }
}

function placeCounterRandomly(counter, num, minPos, maxPos) {
    let count = num
    while (count > 0) {
        const position = randInt(minPos, maxPos)
        if (game.board[position] === empty) {
            game.board[position] = counter
            count--
        }
    }
}

function showBoard() {
    boardEl.replaceChildren()

    squares = []
    for (let i = 0; i < game.board.length; i++) {
        const cellEl = document.createElement('cell')
        const squareEl = document.createElement('square')
        const labelEl = document.createElement('label')

        squareEl.className = game.board[i]
        labelEl.innerText = i + 1

        squares.push(squareEl)
        cellEl.appendChild(squareEl)
        cellEl.appendChild(labelEl)
        boardEl.appendChild(cellEl)

        squareEl.addEventListener('click', (e) => {
            const square = e.currentTarget

            if (game.inProgress && game.isSelecting) {
                if ((game.canSelect.includes(white) && square.classList.contains(white)) ||
                    (game.canSelect.includes(black) && square.classList.contains(black)) ||
                    (game.canSelect.includes(empty) && square.classList.contains(empty))) {
                    square.classList.remove('selecting')
                    square.classList.add('selected')
                    game.selection = i
                    playerPlace()
                }
            }
            else if (game.inProgress && game.isPlacing) {
                if ((game.canPlace.includes(white) && square.classList.contains(white)) ||
                    (game.canPlace.includes(black) && square.classList.contains(black)) ||
                    (game.canPlace.includes(empty) && square.classList.contains(empty))) {
                    square.classList.remove('placing')
                    square.classList.add('placed')
                    game.placement = i
                    moveToken()
                    switchPlayer()
                    playerSelect()
                }
                else if (square.classList.contains('selected')) {
                    square.classList.remove('selected')
                    square.classList.add('selecting')
                    playerSelect()
                }
            }
        })
        squareEl.addEventListener('mouseover', (e) => {
            const square = e.currentTarget
            if (game.inProgress && game.isSelecting) {
                if ((game.canSelect.includes(white) && square.classList.contains(white)) ||
                    (game.canSelect.includes(black) && square.classList.contains(black)) ||
                    (game.canSelect.includes(empty) && square.classList.contains(empty))) {
                    square.classList.add('selecting')
                }
            }
            else if (game.inProgress && game.isPlacing) {
                if ((game.canPlace.includes(white) && square.classList.contains(white)) ||
                    (game.canPlace.includes(black) && square.classList.contains(black)) ||
                    (game.canPlace.includes(empty) && square.classList.contains(empty))) {
                    square.classList.add('placing')
                }
            }
        })
        squareEl.addEventListener('mouseout', (e) => {
            const square = e.currentTarget
            if (game.inProgress && game.isSelecting) {
                square.classList.remove('selecting')
            }
            else if (game.inProgress && game.isPlacing) {
                square.classList.remove('placing')
            }
        })
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (game.inProgress && game.isPlacing) {
                game.isPlacing = false
                game.isSelecting = true

                for (let i = 0; i < squares.length; i++) {
                    squares[i].classList.remove('selected')
                    squares[i].classList.remove('placing')
                    playerSelect()
                }
            }

        }
    })
}

function getNames() {
    const namesForm = document.createElement('form')
    namesForm.innerHTML = `
        <input
            type="text"
            name="p1"
            placeholder="Player 1 name"
            aria-label="Player 1 name"
            required
        >
        <input
            type="text"
            name="p2"
            placeholder="Player 2 name"
            aria-label="Player 2 name"
            required
        >
        <button>Begin</button>
    `
    statusEl.replaceChildren(namesForm)
    namesForm.classList.add('names-form')
    namesForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData.entries())
        console.log(data)

        if (data.p1 && data.p2) {
            game.players[0] = data.p1
            game.players[1] = data.p2
            game.inProgress = true

            statusEl.replaceChildren()

            showNames()
            pickTurn()
            playerSelect()
        }
    })
}

function showNames() {
    infoEl.innerHTML = `
        ${game.players[0]} vs ${game.players[1]}
    `
}

function pickTurn() {
    game.turn = Math.floor(Math.random() * 2)
}

function switchPlayer() {
    game.turn = (game.turn + 1) % 2
}

function playerSelect() {
    statusEl.innerHTML = `
        <h3>${game.players[game.turn]}, your turn</h3>
        <p>Select a token to move...</p>
    `
    game.isPlacing = false
    game.isSelecting = true
    game.canSelect = [black, white]
    game.selection = null
}

function playerPlace() {
    statusEl.innerHTML = `
        <h3>${game.players[game.turn]}, your turn</h3>
        <p>Select where to place the token...</p>
    `
    game.isSelecting = false
    game.isPlacing = true
    game.canPlace = [empty]
    game.placement = null
}

function moveToken() {
    const temp = game.board[game.placement]
    game.board[game.placement] = game.board[game.selection]
    game.board[game.selection] = temp

    showBoard()
}

