const white = 'white'
const black = 'black'
const empty = 'empty'

const gameConfigs = {
    pinned: {
        name: 'Pinned',
        icon: '📌',
        instructions: `
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
        boardSize: 16,
        whiteTokens: 4,
        blackTokens: 1,
        whitePlacements: [],
        blackPlacements: [],
        markSquares: [0],
    },
    squeeze: {
        name: 'The Squeeze',
        icon: '🗜️',
        instructions: `
            <h4>Game Setup</h4>
            <ul>
                <li>A row of 15 squares, numbered 1 to 15 from left to right</li>
                <li>Player 1 places 3 counters at squares 5, 7, and 9</li>
                <li>Player 2 places 3 counters at squares 6, 8, and 10</li>
                <li>Decide who goes first</li>
            </ul>

            <h4>Gameplay</h4>
            <ul>
                <li>Players take turns. You may not skip your turn</li>
                <li>
                    On your turn you must do exactly one of the following:
                    <ul>
                        <li>Move one of your counters exactly one square left or right into an empty square</li>
                        <li>Swap one of your counters with an adjacent opponent counter, moving your counter into their square and their counter into yours, but...</li>
                        <li>You may not swap an opponent counter into a danger zone square (the end squares)</li>
                    </ul>
                </li>
                <li>After both players have taken their turn, the board shrinks. The square at each end is removed. Any counter on a removed square is crushed and eliminated</li>
            </ul>

            <h4>Win Condition</h4>
            <p>The last player with at least one counter remaining on the board wins</p>
        `,
        boardSize: 15,
        whiteTokens: 3,
        blackTokens: 3,
        whitePlacements: [4, 6, 8],
        blackPlacements: [5, 7, 9],
        markSquares: [0, 14],
    },
    leapfrog: {
        name: 'Leap Frog',
        icon: '🐸',
        instructions: `
            <h4>Game Setup</h4>
            <ul>
                <li>A row of 11 squares, numbered 1 to 11 from left to right</li>
                <li>Player 1 places 2 frogs (counters) at squares 1 and 2. They only ever move right</li>
                <li>Player 2 places 2 frogs (counters) at squares 10 and 11. They only ever move left</li>
                <li>Decide who goes first</li>
            </ul>

            <h4>Gameplay</h4>
            <ul>
                <li>Players take turns. You may not skip your turn</li>
                <li>
                    On your turn you must move one of your frogs using exactly one of the following moves:
                    <ul>
                        <li>Hop: move one square forward into the empty square directly ahead</li>
                        <li>Jump: leap over exactly one opponent frog directly in front of you, landing in the empty square immediately beyond</li>
                    </ul>
                </li>
                <li>You may not move backward</li>
                <li>You may not jump over your own frogs</li>
                <li>You may not jump over more than one frog at a time</li>
            </ul>

            <h4>Win Condition</h4>
            <ul>
                <li>The first player to move one of their frogs past both opponent frogs wins</li>
                <li>If a player has no legal move on their turn, their opponent wins</li>
            </ul>
        `,
        boardSize: 11,
        whiteTokens: 2,
        blackTokens: 2,
        whitePlacements: [0, 1],
        blackPlacements: [9, 10],
        markSquares: [],
    },
    chain: {
        name: 'Chain Reaction',
        icon: '💣',
        instructions: `
            <h4>Game Setup</h4>
            <ul>
                <li>A row of 12 squares, numbered 1 to 12 from left to right</li>
                <li>The board starts empty</li>
                <li>Both players have a supply of bombs (counters) in their own colour</li>
                <li>Decide who goes first</li>
            </ul>

            <h4>Gameplay</h4>
            <ul>
                <li>Players take turns. You may not skip your turn</li>
                <li>On your turn you must place one of your bombs on an empty square, but ...</li>
                <li>You cannot place your bomb directly between two opponent bombs since it would immediately be defused (see rule below)</li>
                <li>
                    After placing, the following rules apply in order:
                    <ul>
                        <li>Defuse rule: if any opponent bomb now has one of your bombs on each side, it is defused and removed from the board. Two bombs can be defused in one go</li>
                        <li>Chain reaction rule: if your bomb creates an unbroken chain of 3 or more of your own bombs, the entire chain explodes. All bombs in the chain are removed and you score points equal to chain length</li>
                    </ul>
                </li>
            </ul>

            <h4>Win Condition</h4>
            <p>The first player to reach 10 points wins</p>
        `,
        boardSize: 12,
        whiteTokens: 0,
        blackTokens: 0,
        whitePlacements: [],
        blackPlacements: [],
        markSquares: [],
    },
}

class BaseGame {
    constructor(config) {
        this.config = config

        this.players = ['Player 1', 'Player 2']
        this.scores = [0, 0]
        this.moves = [0, 0]

        this.board = []

        this.inProgress = false
        this.turn = 0

        this.isSelecting = false
        this.canSelect = []
        this.selection = null

        this.isPlacing = false
        this.canPlace = []
        this.placement = null
    }

    initialiseBoard() {
        this.board.length = 0
        this.setupBoard()
    }

    setupBoard() {
        throw new Error('setupBoard must be implemented by a game variant')
    }

    createEmptyBoard(size) {
        this.board.length = 0
        for (let i = 0; i < size; i++) {
            this.board.push(empty)
        }
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    placeTokenRandomly(token, count, minPos, maxPos) {
        let remaining = count
        while (remaining > 0) {
            const position = this.randInt(minPos, maxPos)
            if (this.board[position] === empty) {
                this.board[position] = token
                remaining--
            }
        }
    }

    placeTokens(token) {
        const placements = token === white ? this.config.whitePlacements : this.config.blackPlacements
        for (let i = 0; i < placements.length; i++) {
            const boardIndex = placements[i]
            if (boardIndex >= 0 && boardIndex < this.board.length) {
                this.board[boardIndex] = token
            }
        }
    }

    pickTurn() {
        this.turn = Math.floor(Math.random() * 2)
    }

    switchPlayer() {
        this.turn = (this.turn + 1) % 2
    }

    beginPlayerSelection() {
        this.isPlacing = false
        this.isSelecting = true
        this.canSelect = this.getLegalSelections()
        this.selection = null
    }

    beginPlayerPlacement() {
        this.isSelecting = false
        this.isPlacing = true
        this.canPlace = this.getLegalPlacements(this.selection)
        this.placement = null
    }

    getLegalSelections() {
        return [black, white]
    }

    getLegalPlacements() {
        return [empty]
    }

    isValidSelection(squareClassList) {
        return this.canSelect.some((token) => squareClassList.contains(token))
    }

    isValidPlacement(squareClassList) {
        return this.canPlace.some((token) => squareClassList.contains(token))
    }

    applyMove() {
        const temp = this.board[this.placement]
        this.board[this.placement] = this.board[this.selection]
        this.board[this.selection] = temp
    }

    getWinState() {
        return null
    }
}

class PinnedGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokenRandomly(
            white,
            this.config.whiteTokens,
            1,
            this.config.boardSize - 1
        )
        this.placeTokenRandomly(
            black,
            this.config.blackTokens,
            Math.floor(this.config.boardSize / 3),
            this.config.boardSize - 1
        )
    }
}

class SqueezeGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokens(white)
        this.placeTokens(black)
    }
}

class LeapfrogGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokens(white)
        this.placeTokens(black)
    }
}

class ChainReactionGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
    }
}

const gameVariants = {
    pinned: PinnedGame,
    squeeze: SqueezeGame,
    leapfrog: LeapfrogGame,
    chain: ChainReactionGame,
}

let currentGame = null
let selectEl, nameEl, statusEl, infoEl, boardEl, instructEl = null
let boardSquares = []

document.addEventListener('DOMContentLoaded', initialise)

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (currentGame?.inProgress && currentGame?.isPlacing) {
            currentGame.isPlacing = false
            currentGame.isSelecting = true

            for (const square of boardSquares) {
                square.classList.remove('selected')
                square.classList.remove('placing')
            }
            playerSelect()
        }
    }
})

function initialise() {
    selectEl = document.getElementById('game-select')
    nameEl = document.getElementById('game-name')
    statusEl = document.getElementById('game-status')
    infoEl = document.getElementById('game-info')
    instructEl = document.getElementById('game-instructions')
    boardEl = document.querySelector('board')

    let options = ''
    for (const [id, config] of Object.entries(gameConfigs)) {
        options += `<option value="${id}">${config.name}</option>`
    }
    selectEl.innerHTML = options
    selectEl.addEventListener('change', setupGame)

    setupGame()
    showBoard()
    getNames()
}

function setupGame() {
    const selectedGameId = selectEl.value
    const config = gameConfigs[selectedGameId]
    const GameVariant = gameVariants[selectedGameId]
    if (!config || !GameVariant) throw new Error('No selected game')

    currentGame = new GameVariant(config)
    console.log('Selected', currentGame.config.name)

    nameEl.innerText = `${currentGame.config.name} ${currentGame.config.icon}`
    instructEl.innerHTML = `
        <summary>Instructions for ${currentGame.config.name}</summary>
        <h3>How to Play ${currentGame.config.name} ${currentGame.config.icon}</h3>
        ${currentGame.config.instructions}
    `

    currentGame.initialiseBoard()
    showBoard()
}

function showBoard() {
    boardEl.replaceChildren()
    boardSquares = []

    for (let i = 0; i < currentGame.board.length; i++) {
        const cellEl = document.createElement('cell')
        const squareEl = document.createElement('square')
        const labelEl = document.createElement('label')

        squareEl.className = currentGame.board[i]
        if (currentGame.config.markSquares.includes(i))
            squareEl.classList.add('marked')

        labelEl.innerText = i + 1

        boardSquares.push(squareEl)
        cellEl.appendChild(squareEl)
        cellEl.appendChild(labelEl)
        boardEl.appendChild(cellEl)

        squareEl.addEventListener('click', (e) => {
            const square = e.currentTarget

            if (currentGame.inProgress && currentGame.isSelecting) {
                if (currentGame.isValidSelection(square.classList)) {
                    square.classList.remove('selecting')
                    square.classList.add('selected')
                    currentGame.selection = i
                    playerPlace()
                }
            }
            else if (currentGame.inProgress && currentGame.isPlacing) {
                if (currentGame.isValidPlacement(square.classList)) {
                    square.classList.remove('placing')
                    square.classList.add('placed')
                    currentGame.placement = i
                    moveToken()
                    currentGame.switchPlayer()
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
            if (currentGame.inProgress && currentGame.isSelecting) {
                if (currentGame.isValidSelection(square.classList)) {
                    square.classList.add('selecting')
                }
            }
            else if (currentGame.inProgress && currentGame.isPlacing) {
                if (currentGame.isValidPlacement(square.classList)) {
                    square.classList.add('placing')
                }
            }
        })

        squareEl.addEventListener('mouseout', () => {
            if (currentGame.inProgress && currentGame.isSelecting) {
                squareEl.classList.remove('selecting')
            }
            else if (currentGame.inProgress && currentGame.isPlacing) {
                squareEl.classList.remove('placing')
            }
        })
    }
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

        if (data.p1 && data.p2) {
            currentGame.players[0] = data.p1
            currentGame.players[1] = data.p2
            currentGame.inProgress = true

            statusEl.replaceChildren()

            showNames()
            currentGame.pickTurn()
            playerSelect()
        }
    })
}

function showNames() {
    infoEl.innerHTML = `${currentGame.players[0]} vs ${currentGame.players[1]}`
}

function playerSelect() {
    statusEl.innerHTML = `
        <h3>${currentGame.players[currentGame.turn]}, your turn</h3>
        <p>Select a token to move...</p>
    `

    currentGame.beginPlayerSelection()
}

function playerPlace() {
    statusEl.innerHTML = `
        <h3>${currentGame.players[currentGame.turn]}, your turn</h3>
        <p>Select where to place the token...</p>
    `

    currentGame.beginPlayerPlacement()
}

function moveToken() {
    currentGame.applyMove()

    const winState = currentGame.getWinState()
    if (winState) {
        currentGame.inProgress = false
        statusEl.innerHTML = `<h3>${winState.message}</h3>`
    }

    showBoard()
}
