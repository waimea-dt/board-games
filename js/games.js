const gameConfigs = {
    pinned: {
        name: 'Pinned',
        icon: '📌',
        instructions: `
            <h4>Setup</h4>
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
        markIcon: 'arrow',
        blockSquares: [],
    },
    squeeze: {
        name: 'The Squeeze',
        icon: '🗜️',
        instructions: `
            <h4>Setup</h4>
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
        markIcon: 'skull',
        blockSquares: [],
    },
    leapfrog: {
        name: 'Leap Frog',
        icon: '🐸',
        instructions: `
            <h4>Setup</h4>
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
        markIcon: null,
        blockSquares: [],
    },
    chain: {
        name: 'Chain Reaction',
        icon: '💣',
        instructions: `
            <h4>Setup</h4>
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
        markIcon: null,
        blockSquares: [],
    },
}

const TOKENS = Object.freeze({
    white: 'white',
    black: 'black',
    empty: null,
})



//===============================================================================================
class BaseGame extends EventTarget {
    constructor(config) {
        super()

        this.config = config

        this.STATES = this.defineStates()
        this.EVENTS = this.defineEvents()
        this.TRANSITIONS = this.defineTransitions()

        this.players = ['', '']
        this.scores = [0, 0]
        this.moves = [0, 0]

        this.board = []

        this.currentPlayer = 0
        this.state = this.STATES.GETTING_NAMES
        this.debug = true

        this.selectedCell = null
        this.selectedToken = null
        this.canSelect = [TOKENS.white, TOKENS.black]
        this.canPlace = [TOKENS.empty]
        this.validSelectableCells = []
        this.validPlacementCells = []
    }

    logFsm(stage, payload) {
        if (!this.debug) return
        console.log('[FSM]', stage, payload)
    }

    defineStates() {
        return Object.freeze({
            GETTING_NAMES:   'GETTING_NAMES',
            SELECTING_TOKEN: 'SELECTING_TOKEN',
            PLACING_TOKEN:   'PLACING_TOKEN',
        })
    }

    defineEvents() {
        return Object.freeze({
            NAMES_ENTERED: 'NAMES_ENTERED',
            TOKEN_CLICKED: 'TOKEN_CLICKED',
            PLACE_CLICKED: 'PLACE_CLICKED',
            INVALID:       'INVALID',
        })
    }

    defineTransitions() {
        return Object.freeze({
            [this.STATES.GETTING_NAMES]: {
                [this.EVENTS.NAMES_ENTERED]: { to: this.STATES.GETTING_NAMES, action: 'getNames', },
            },
        })
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
            this.board.push(TOKENS.empty)
        }
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    placeTokenRandomly(token, count, minPos, maxPos) {
        let remaining = count
        while (remaining > 0) {
            const position = this.randInt(minPos, maxPos)
            if (this.board[position] === TOKENS.empty) {
                this.board[position] = token
                remaining--
            }
        }
    }

    placeTokens(token) {
        const placements = token === TOKENS.white ? this.config.whitePlacements : this.config.blackPlacements
        for (let i = 0; i < placements.length; i++) {
            const boardIndex = placements[i]
            if (boardIndex >= 0 && boardIndex < this.board.length) {
                this.board[boardIndex] = token
            }
        }
    }

    pickPlayer() {
        this.currentPlayer = Math.floor(Math.random() * 2)
    }

    switchPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % 2
    }

    handleEvent(detail) {
        const event = this.classifyEvent(detail)
        const transition = this.TRANSITIONS[this.state]?.[event]

        this.logFsm('event', {
            state: this.state,
            event,
            detail,
            transition: transition ? { to: transition.to, action: transition.action } : null,
        })

        if (!transition) return

        this[transition.action](detail)

        if (this.state !== this.STATES.GAME_OVER) {
            this.setState(transition.to)
        }
    }

    classifyEvent(detail) {
        return this.EVENTS.INVALID
    }

    setState(newState) {
        const fromState = this.state
        this.state = newState
        this.logFsm('state', { from: fromState, to: newState })
        this.dispatchEvent(new CustomEvent('stateChanged', { detail: { state: newState } }))
    }

    startGame({ p1, p2 }) {
        this.players[0] = p1
        this.players[1] = p2
        this.pickPlayer()
        this.clearSelection()
    }

    selectToken({ cell }) {
        this.selectedCell = cell
        this.selectedToken = this.board[cell]
        this.validPlacementCells = this.validPlacements(cell)
        this.dispatchEvent(new CustomEvent('tokenSelected', { detail: { cell, token: this.selectedToken } }))
    }

    clearSelection() {
        this.selectedCell = null
        this.selectedToken = null
        this.validPlacementCells = []
        this.validSelectableCells = this.validSelections()
    }

    moveToken({ cell }) {
        const fromCell = this.selectedCell
        const token = this.selectedToken ?? this.board[fromCell]

        this.board[fromCell] = TOKENS.empty
        this.board[cell] = token

        this.clearSelection()
        this.dispatchEvent(new CustomEvent('tokenMoved', { detail: { fromCell, toCell: cell, token } }))
    }

    removeToken({ cell }) {
        const targetCell = cell ?? this.selectedCell
        if (targetCell == null) return TOKENS.empty

        const token = this.selectedToken ?? this.board[targetCell]
        this.board[targetCell] = TOKENS.empty

        this.clearSelection()
        this.dispatchEvent(new CustomEvent('tokenRemoved', { detail: { fromCell: targetCell, token } }))

        return token
    }

    selectTokenAndConfirmRemoval({ cell }) {
        this.selectToken({ cell })
        this.confirmRemoval()
    }

    confirmRemoval() {
        this.dispatchEvent(new CustomEvent('confirmAction', { detail: { action: 'Remove token?', confirm: 'Remove' } }))
    }

    cancelSelection() {
        this.clearSelection()
        this.dispatchEvent(new CustomEvent('selectionCancelled'))
    }

    validSelections() {
        return this.board.reduce((acc, e, i) => {
            if (this.canSelect.includes(e)) acc.push(i)
            return acc
        }, [])
    }

    validPlacements(cell) {
        return this.board.reduce((acc, e, i) => {
            if (this.canPlace.includes(e)) acc.push(i)
            return acc
        }, [])
    }

    hasWon() {
        return false
    }
}

//===============================================================================================
class PinnedGame extends BaseGame {

    constructor(config) {
        super(config)
    }

    defineStates() {
        return Object.freeze({
            GETTING_NAMES:   'GETTING_NAMES',
            SELECTING_TOKEN: 'SELECTING_TOKEN',
            PLACING_TOKEN:   'PLACING_TOKEN',
            REMOVING_TOKEN:  'REMOVING_TOKEN',
        })
    }

    defineEvents() {
        return Object.freeze({
            NAMES_ENTERED:        'NAMES_ENTERED',
            TOKEN_CLICKED:        'TOKEN_CLICKED',
            TOKEN_CLICKED_CELL_1: 'TOKEN_CLICKED_CELL_1',
            PLACE_CLICKED:        'PLACE_CLICKED',
            REMOVAL_CONFIRMED:    'REMOVAL_CONFIRMED',
            INVALID:              'INVALID',
        })
    }

    defineTransitions() {
        return Object.freeze({
            [this.STATES.GETTING_NAMES]: {
                [this.EVENTS.NAMES_ENTERED]:        { to: this.STATES.SELECTING_TOKEN, action: 'startGame', },
            },
            [this.STATES.SELECTING_TOKEN]: {
                [this.EVENTS.TOKEN_CLICKED]:        { to: this.STATES.PLACING_TOKEN,   action: 'selectToken', },
                [this.EVENTS.TOKEN_CLICKED_CELL_1]: { to: this.STATES.REMOVING_TOKEN,  action: 'selectTokenAndConfirmRemoval', },
            },
            [this.STATES.REMOVING_TOKEN]: {
                [this.EVENTS.REMOVAL_CONFIRMED]:    { to: this.STATES.SELECTING_TOKEN, action: 'removeToken', },
                [this.EVENTS.INVALID]:              { to: this.STATES.SELECTING_TOKEN, action: 'cancelSelection', },
            },
            [this.STATES.PLACING_TOKEN]: {
                [this.EVENTS.PLACE_CLICKED]:        { to: this.STATES.SELECTING_TOKEN, action: 'moveToken', },
                [this.EVENTS.INVALID]:              { to: this.STATES.SELECTING_TOKEN, action: 'cancelSelection', },
            },
        })
    }

    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokenRandomly(
            TOKENS.white,
            this.config.whiteTokens,
            1,
            this.config.boardSize - 1
        )
        this.placeTokenRandomly(
            TOKENS.black,
            this.config.blackTokens,
            Math.floor(this.config.boardSize / 3),
            this.config.boardSize - 1
        )
    }

    classifyEvent(detail) {
        const isEnteringNames       = this.state === this.STATES.GETTING_NAMES
        const isChoosingToken       = this.state === this.STATES.SELECTING_TOKEN
        const isChoosingDestination = this.state === this.STATES.PLACING_TOKEN
        const isRemovingToken       = this.state === this.STATES.REMOVING_TOKEN

        if (isEnteringNames && detail.p1 && detail.p2) return this.EVENTS.NAMES_ENTERED

        if (isRemovingToken) {
            if (detail.result === 'confirm') return this.EVENTS.REMOVAL_CONFIRMED
            else                             return this.EVENTS.INVALID
        }

        if (detail.cell == null) return this.EVENTS.INVALID

        const isValidToken = this.validSelectableCells.includes(detail.cell)
        const isValidPlace = this.validPlacementCells.includes(detail.cell)
        const isFirstCell = detail.cell === 0

        if (isChoosingToken && isValidToken) {
            if (isFirstCell) return this.EVENTS.TOKEN_CLICKED_CELL_1
            else             return this.EVENTS.TOKEN_CLICKED
        }

        if (isChoosingDestination && isValidPlace) return this.EVENTS.PLACE_CLICKED

        return this.EVENTS.INVALID
    }

    moveToken({ cell }) {
        super.moveToken({ cell })
        this.switchPlayer()
    }

    removeToken({ cell }) {
        const removedCell = cell ?? this.selectedCell
        const token = super.removeToken({ cell: removedCell })

        if (this.hasWon(removedCell, token)) {
            this.setState(this.STATES.GAME_OVER)
            this.dispatchEvent(new CustomEvent('gameWon', { detail: { winner: this.currentPlayer } }))
            return
        }

        this.switchPlayer()
    }

    validSelections() {
        let valid = []
        for (let i = 0; i < this.board.length; i++) {
            const token = this.board[i]
            const validToken = this.canSelect.includes(token)
            const canBeMoved = i === 0 || (i > 0 && this.board[i - 1] === TOKENS.empty)
            if (validToken && canBeMoved) valid.push(i)
        }
        return valid
    }

    validPlacements(cell) {
        let valid = []
        for (let i = cell - 1; i >= 0; i--) {
            if (this.board[i] !== TOKENS.empty) break
            valid.push(i)
        }
        return valid
    }

    hasWon(cell, token) {
        return (cell === 0) && (token === TOKENS.black)
    }
}

//===============================================================================================
class SqueezeGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokens(TOKENS.white)
        this.placeTokens(TOKENS.black)
    }
}

//===============================================================================================
class LeapfrogGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
        this.placeTokens(TOKENS.white)
        this.placeTokens(TOKENS.black)
    }
}

//===============================================================================================
class ChainReactionGame extends BaseGame {
    setupBoard() {
        this.createEmptyBoard(this.config.boardSize)
    }
}



//===============================================================================================

const gameVariants = {
    pinned: PinnedGame,
    squeeze: SqueezeGame,
    leapfrog: LeapfrogGame,
    chain: ChainReactionGame,
}

let currentGame = null
let selectEl, nameEl, statusEl, infoEl, boardEl, instructEl = null
let boardSquares = []

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseGame)
} else {
    initialiseGame()
}

function initialiseGame() {
    const selectEl = document.getElementById('game-select')
    const restartEl = document.getElementById('game-restart')
    const nameEl = document.getElementById('game-name')
    const statusEl = document.getElementById('game-status')
    const infoEl = document.getElementById('game-info')
    const instructEl = document.getElementById('game-instructions')
    const boardEl = document.querySelector('board')
    const dialogEl = document.getElementById('confirm-dialog')

    if (!selectEl || !restartEl || !nameEl || !statusEl || !infoEl || !instructEl || !dialogEl || !boardEl) return

    let options = ''
    for (const [id, config] of Object.entries(gameConfigs)) {
        options += `<option value="${id}">${config.name}</option>`
    }
    selectEl.innerHTML = options
    selectEl.addEventListener('change', setupGame)

    restartEl.addEventListener('click', setupGame)

    function setupGame() {
        const previousPlayerNames = currentGame ? [...currentGame.players] : null

        if (currentGame) {
            unbindGameEvents(currentGame)
        }

        const selectedGameId = selectEl.value
        const config = gameConfigs[selectedGameId]
        const GameVariant = gameVariants[selectedGameId]
        if (!config || !GameVariant) throw new Error('No selected game')

        currentGame = new GameVariant(config)

        if (previousPlayerNames) {
            currentGame.players[0] = previousPlayerNames[0]
            currentGame.players[1] = previousPlayerNames[1]
        }

        nameEl.innerText = `${currentGame.config.icon} ${currentGame.config.name} ${currentGame.config.icon}`
        instructEl.innerHTML = `
            <summary>ⓘ Instructions for ${currentGame.config.name}</summary>
            <h3>${currentGame.config.name} ${currentGame.config.icon}</h3>
            ${currentGame.config.instructions}
        `

        currentGame.initialiseBoard()
        bindGameEvents(currentGame)
        renderBoard()
        renderStatus()
    }

    function bindGameEvents(game) {
        game.addEventListener('stateChanged',  renderBoard)
        game.addEventListener('stateChanged',  renderStatus)
        game.addEventListener('tokenSelected', renderBoard)
        game.addEventListener('placeSelected', renderBoard)
        game.addEventListener('tokenMoved',    renderBoard)
        game.addEventListener('tokenRemoved',  renderBoard)
        game.addEventListener('confirmAction', showConfirmDialog)
        game.addEventListener('gameWon',       onGameWon)
    }

    function unbindGameEvents(game) {
        game.removeEventListener('stateChanged',  renderBoard)
        game.removeEventListener('stateChanged',  renderStatus)
        game.removeEventListener('tokenSelected', renderBoard)
        game.removeEventListener('placeSelected', renderBoard)
        game.removeEventListener('tokenMoved',    renderBoard)
        game.removeEventListener('tokenRemoved',  renderBoard)
        game.removeEventListener('confirmAction', showConfirmDialog)
        game.removeEventListener('gameWon',       onGameWon)
    }

    function onGameWon(event) {
        const game = event.currentTarget
        const winnerLabel = game.players[event.detail.winner]

        const headingEl = document.createElement('h1')
        headingEl.textContent = `${winnerLabel} Wins!`

        const restartButtonEl = document.createElement('button')
        restartButtonEl.type = 'button'
        restartButtonEl.textContent = 'Restart'
        restartButtonEl.addEventListener('click', setupGame)

        statusEl.replaceChildren(headingEl, restartButtonEl)
    }

    setupGame()

    function renderBoard() {
        boardEl.replaceChildren()
        boardSquares = []

        for (let i = 0; i < currentGame.board.length; i++) {
            const cellEl = document.createElement('cell')
            const squareEl = document.createElement('square')
            const labelEl = document.createElement('label')

            squareEl.className = currentGame.board[i]

            if (currentGame.config.markSquares.includes(i)) {
                squareEl.classList.add('marked')
                squareEl.classList.add(currentGame.config.markIcon)
            }

            if (currentGame.config.blockSquares.includes(i)) {
                squareEl.classList.add('blocked')
            }

            if (currentGame.selectedCell == i) {
                squareEl.classList.add('selected')
            }

            if (currentGame.state === currentGame.STATES.SELECTING_TOKEN) {
                if (currentGame.validSelectableCells.includes(i)) {
                    squareEl.classList.add('valid')
                }
            }

            if (currentGame.state === currentGame.STATES.PLACING_TOKEN) {
                if (currentGame.validPlacementCells.includes(i)) {
                    squareEl.classList.add('valid')
                }
            }

            labelEl.innerText = i + 1

            boardSquares.push(squareEl)
            cellEl.appendChild(squareEl)
            cellEl.appendChild(labelEl)
            boardEl.appendChild(cellEl)

            squareEl.addEventListener('click', () => currentGame.handleEvent({ cell: i }))
        }
    }

    function renderStatus() {
        if (currentGame.state === currentGame.STATES.GAME_OVER) return

        if (currentGame.state === currentGame.STATES.GETTING_NAMES) {
            statusEl.innerHTML = `<h3>Welcome!</h3> <p>Enter your names and press 'Begin' to play...</p>`
            getNames()
            return
        }

        infoEl.innerHTML = `<h2>${currentGame.players[0]} vs ${currentGame.players[1]}</h2>`

        const playerTurn = `<h3><strong>${currentGame.players[currentGame.currentPlayer]}</strong>, it's your turn</h3>`

        if (currentGame.state === currentGame.STATES.SELECTING_TOKEN) {
            statusEl.innerHTML = `${playerTurn} <p>Select a token to move...</p>`
        }

        if (currentGame.state === currentGame.STATES.PLACING_TOKEN) {
            statusEl.innerHTML = `${playerTurn} <p>Select where to place the token...</p>`
        }

    }

    function showConfirmDialog(event) {
        const action = event.detail.action
        const confirm = event.detail.confirm

        const actionEl = dialogEl.querySelector('p')
        const buttonEl = dialogEl.querySelector('button[value="confirm"]')
        if (!actionEl || !buttonEl) return

        actionEl.innerText = action
        buttonEl.innerText = confirm

        dialogEl.returnValue = 'cancel'
        dialogEl.showModal()
        dialogEl.onclose = () => {
            const result = dialogEl.returnValue
            currentGame.handleEvent({ result })
        }
    }

    function getNames() {
        const namesForm = document.createElement('form')
        namesForm.innerHTML = `
            <input type="text" name="p1" placeholder="Player 1 name" required>
            <button>Begin</button>
            <input type="text" name="p2" placeholder="Player 2 name" required>
        `

        const playerOneInput = namesForm.elements.namedItem('p1')
        const playerTwoInput = namesForm.elements.namedItem('p2')

        if (playerOneInput) playerOneInput.value = currentGame.players[0]
        if (playerTwoInput) playerTwoInput.value = currentGame.players[1]

        infoEl.replaceChildren(namesForm)
        namesForm.id = 'names-form'

        namesForm.addEventListener('submit', (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            const data = Object.fromEntries(formData.entries())

            if (!data.p1 || !data.p2) return

            currentGame.handleEvent({ p1: data.p1, p2: data.p2 })
        })
    }

}

