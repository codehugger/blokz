Array.prototype.sample = function() {
    return this[Math.floor(Math.random()*this.length)];
}

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

// Classic tetris shapes that are anchored around a single point
// according to http://tetris.wikia.com/wiki/SRS
// All shapes are anchored at a center point of 0,0
let shapes = {
    "T": [[ 0, 0], [-1, 0], [ 1, 0], [ 0,-1]],
    "J": [[ 0, 0], [-1, 0], [ 0,-1], [ 0,-2]],
    "L": [[ 0, 0], [ 1, 0], [ 0,-1], [ 0,-2]],
    "Z": [[ 0, 0], [-1, 0], [ 0,-1], [ 1,-1]],
    "S": [[ 0, 0], [-1,-1], [ 0,-1], [ 1, 0]],
    "I": [[ 0, 0], [ 0,-1], [ 0,-2], [ 0,-3]],
    "O": [[ 0, 0], [ 0,-1], [-1, 0], [-1,-1]],
}

// Shapes extracted for convenience
let shapeLetters = Object.keys(shapes)

// Rotates the shape right
function rotated(shape) {
    return shape.map(s=>[s[1], -s[0]])
}

// Check to see if current shape is out of bounds or trying to occupy
// something that is already occupied
function isOccupied(shape, anchor, board) {
    for (let s = 0; s < shape.length; s++) {
        let x = (anchor[0] + shape[s][0])
        let y = (anchor[1] + shape[s][1])
        if (x < 0 || x >= board[0].length ||
            y < 0 || y >= board.length ||
            board[y][x] == 1) {
            return true
        }
    }
    return false
}

function move(shape, anchor, board, x, y) {
    let anchorNew = [anchor[0] + x, anchor[1] + y]
    if (isOccupied(shape, anchorNew, board)) {
        return [shape, anchor]
    }
    return [shape, anchorNew]
}

function left(shape, anchor, board) {
    return move(shape, anchor, board, -1, 0)
}

function right(shape, anchor, board) {
    return move(shape, anchor, board, +1, 0)
}

function softDrop(shape, anchor, board) {
    return move(shape, anchor, board, 0, +1)
}

function hardDrop(shape, anchor, board) {
    while (true) {
        let [_, anchorNew] = softDrop(shape, anchor, board)
        if (anchorNew == anchor) {
            return [shape, anchorNew]
        }
        anchor = anchorNew
    }
}

function rotate(shape, anchor, board) {
    let shapeNew = rotated(shape)
    if (isOccupied(shapeNew, anchor, board)) {
        return [shape, anchor]
    }
    return [shapeNew, anchor]
}

function idle(shape, anchor, board) {
    return [shape, anchor]
}

//
// A representation of a tetris board that looks like this
//
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
// | 0 | 0 | 0 | 0 | 0 |
//
// The pieces start at the top (index 0) and move down (y + 1)
//
class TetrisEngine {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.board = Array(height).fill().map(() => Array(width).fill(0));

        this.valueActionMap = {
            0: left,
            1: right,
            2: hardDrop,
            3: softDrop,
            4: rotate,
            6: idle
        }

        this.actionValueMap = {}
        for (const [i,j] of Object.entries(this.valueActionMap)) {
            this.actionValueMap[i] = j
        }

        this.time = -1
        this.score = -1
        this.anchor = null
        this.shape = null
        this.deaths = 0

        this.shapeCounts = new Array(shapeLetters).fill(0);
    }

    newPiece() {
        this.anchor = [this.width / 2, 1]
        this.shape = shapes[shapeLetters.sample()]
    }

    hasDropped() {
        return isOccupied(this.shape, [this.anchor[0], this.anchor[1] + 1], this.board)
    }

    clearLines() {
        // get a representation of the rows of the board that can be cleared
        let canClear = this.board.map(row=>row.every(c=>c>0))
        let boardNew = Array(this.height).fill().map(() => Array(this.width).fill(0));

        // starting from the bottom and go through every line with dual counters
        let j = this.height - 1
        for (let i = this.height - 1; i >= 0; i--) {
            if (canClear[i]) { continue }
            boardNew[j] = this.board[i].slice()
            j -= 1
        }
        let clearedLines = canClear.reduce((x,y)=>y+x)
        this.score += clearedLines
        this.board = boardNew

        return this.clearLines
    }

    validActionCount() {
        let validActionSum = 0

        for (const [_, fn] of Object.entries(this.valueActionMap)) {
            // if calling the action has no effect on the shape it is not a valid action
            if (fn(this.shape, this.anchor, this.board) != [this.shape, this.anchor]) {
                validActionSum += 1
            }
        }

        return validActionSum
    }

    step(action) {
        // perform the given action and record the results (shape and anchor)
        let actionResult = this.valueActionMap[action](this.shape, this.anchor, this.board)
        this.shape = actionResult[0]
        this.anchor = actionResult[1]

        let dropResult = softDrop(this.shape, this.anchor, this.board)
        this.shape = dropResult[0]
        this.anchor = dropResult[1]

        // update time and reward
        this.time += 1
        let reward = this.validActionCount()

        let done = false
        if (this.hasDropped()) {
            this.solidifyPiece(1)
            reward += 10 * this.clearLines()

            // if there is anything in the top row
            // die, clear and award a reward -10
            if (this.board[0].some(c=>c>0)) {
                console.log(this.toString())
                this.clear()
                this.deathCount += 1
                done = true
                reward = -10
            } else {
                this.newPiece()
            }
        }

        this.solidifyPiece(1)
        let state = this.board.slice()
        this.solidifyPiece(0)
        return [state, reward, done]
    }

    clear() {
        this.time = 0
        this.score = 0
        this.newPiece()
        this.board = Array(this.height).fill().map(() => Array(this.width).fill(0));
        return this.board
    }

    // make the current piece solid
    solidifyPiece(state) {
        if (this.shape) {
            for (let s = 0; s < this.shape.length; s++) {
                let x = (this.anchor[0] + this.shape[s][0]).clamp(0, this.width)
                let y = (this.anchor[1] + this.shape[s][1]).clamp(0, this.height)
                this.board[y][x] = state
            }
        }
    }

    toString() {
        this.solidifyPiece(1)
        let s = '+' + '-'.repeat(this.width) + '+\n'
        for (let r = 0; r < this.board.length; r++) {
            let row = this.board[r]
            s += '|' + row.map((x)=>(x ? 'X' : ' ')).join('') + '|\n'
        }
        s += '+' + '-'.repeat(this.width) + '+\n'
        this.solidifyPiece(0)
        return s
    }
}

var engine = new TetrisEngine(10, 20)
engine.newPiece()
console.log(engine.toString())