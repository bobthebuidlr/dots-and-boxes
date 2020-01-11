document.getElementById('add-col').addEventListener('click', addCol);
document.getElementById('remove-col').addEventListener('click', removeCol);
document.getElementById('add-row').addEventListener('click', addRow);
document.getElementById('remove-row').addEventListener('click', removeRow);
document.getElementById('reset').addEventListener('click', drawPlayfield);
document
  .getElementById('difficulty')
  .addEventListener('change', changeDifficulty);

let playfield = document.getElementById('playfield');

// Game settings
const BORDER_THICKNESS = 10;
let colCount = 3;
let rowCount = 3;
let difficulty = 3;

function addCol() {
  if (colCount === 6) {
    return;
  }
  colCount += 1;
  drawPlayfield();
}

function removeCol() {
  if (colCount === 2) {
    return;
  }
  colCount -= 1;
  drawPlayfield();
}

function addRow() {
  if (rowCount === 6) {
    return;
  }
  rowCount += 1;
  drawPlayfield();
}

function removeRow() {
  if (rowCount === 2) {
    return;
  }
  rowCount -= 1;
  drawPlayfield();
}

function drawPlayfield() {
  var element = document.getElementById('playfield');
  if (element != null) {
    element.parentNode.removeChild(element);
  }

  var container = document.getElementById('playfieldContainer');
  playfield = document.createElement('table');
  playfield.id = 'playfield';

  for (let i = 0; i < rowCount; i++) {
    let row = document.createElement('tr');
    row.id = i;

    for (let j = 0; j < colCount; j++) {
      const indices = Object.values(getBorderIndices(i, j));
      const col = document.createElement('td');
      for (index in indices) {
        col.classList.add(indices[index]);
      }
      col.id = j;
      col.addEventListener('click', tileClicked);
      row.appendChild(col);
    }

    playfield.appendChild(row);
  }
  container.appendChild(playfield);

  game = new Game(rowCount, colCount);
}

function changeDifficulty(event) {
  difficulty = event.currentTarget.value;
}

function tileClicked(event) {
  if (game.getPossibleMoves().length === 0) return;
  game.tileClicked(event.currentTarget);
  if (game.currentPlayer === 1) {
    playAgent();
  }
}

function playAgent() {
  if (game.getPossibleMoves().length === 0) return;
  setTimeout(() => {
    const moves = game.minimaxRoot(difficulty);
    const move = moves[Math.floor(Math.random()*moves.length)]
    game.playMove(move, true);
    if (game.currentPlayer === 1) {
      playAgent();
    }
  }, 500);
}

function getBorderIndices(row, col) {
  let indices = {};

  indices.top = +((colCount * 2 + 1) * row + col);
  indices.left = indices.top + colCount;
  indices.right = indices.left + 1;
  indices.bottom = indices.right + colCount;

  return indices;
}

class Game {
  rows = 0;
  cols = 0;
  indices = [];
  board = [];
  excludeTop = [];
  excludeBottom = [];
  excludeLeft = [];
  excludeRight = [];

  currentPlayer = -1;
  currentPlayerColor = 'blue';
  playerScores = {
    '1': 0,
    '-1': 0
  };

  constructor(rows, cols) {
    (this.rows = rows),
      (this.cols = cols),
      (this.board = this.initBoard()),
      this.createIndices()
  }

  initBoard() {
    const length = (this.rows * 2 + 1) * this.cols + this.rows;
    return Array.from({ length: length }, () => {
      return 0;
    });
  }

  createIndices() {
    for (let i = 0; i < this.board.length; i++) {
      this.indices.push(i);
    }
  }

  getPossibleMoves() {
    const possibleMoves = [];
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === 0) {
        possibleMoves.push(i);
      }
    }
    return possibleMoves;
  }

  changePlayer() {
    this.currentPlayer *= -1;
    this.currentPlayer === 1
      ? (this.currentPlayerColor = 'red')
      : (this.currentPlayerColor = 'blue');
  }

  isMoveValid(move) {
    if (this.getPossibleMoves().includes(move)) {
      return true;
    } else {
      return false;
    }
  }

  isGameOver() {
    if (this.getPossibleMoves().length === 0) {
      if (this.playerScores[1] === this.playerScores[-1]) {
        return 0;
      }
      return this.playerScores[1] > this.playerScores[-1] ? 1 : -1;
    } else {
      return false;
    }
  }

  evaluateBoardState() {
    let score = this.playerScores[1] - this.playerScores[-1];
    if (score < 0) {
      score = score ** 2 * -1;
    } else {
      score = score ** 2;
    }
    return score;
  }

  tileClicked(elem) {
    const col = +elem.id;
    const row = +elem.parentNode.id;
    const borderIndices = getBorderIndices(row, col);

    let border_top = BORDER_THICKNESS;
    let border_right = BORDER_THICKNESS;
    let border_bottom = BORDER_THICKNESS;
    let border_left = BORDER_THICKNESS;

    if (row == 0) {
      border_top = 20;
    } else if (row == rowCount) {
      border_bottom = 20;
    }

    if (col == 0) {
      border_left = 20;
    } else if (col == colCount) {
      border_right = 20;
    }
    const x = event.pageX;
    const y = event.pageY;

    const top = event.currentTarget.getBoundingClientRect().top;
    const right = event.currentTarget.getBoundingClientRect().right;
    const bottom = event.currentTarget.getBoundingClientRect().bottom - 10;
    const left = event.currentTarget.getBoundingClientRect().left + 10;

    let tileTaken = false;
    let borderTaken = false;

    if (x < left + border_left) {
      console.log('left border is clicked');

      // Check if border is already taken.
      if (event.currentTarget.classList.value.indexOf('left') !== -1) {
        return;
      }
      borderTaken = true;
      event.currentTarget.classList.add(`${this.currentPlayerColor}-left`);
      this.board[borderIndices.left] = this.currentPlayer;
      if (col > 0) {
        const sibling = playfield.children[row].children[col - 1];
        sibling.classList.add(`${this.currentPlayerColor}-right`);
        if (sibling.classList.length === 8) {
          sibling.classList.add(`${this.currentPlayerColor}`);
          this.currentPlayer === 1
            ? (this.playerScores[1] += 1)
            : (this.playerScores[-1] += 1);
          tileTaken = true;
        }
      }
    } else if (x > right - border_right) {
      console.log('right border is clicked');
      // Check if border is already taken.
      if (event.currentTarget.classList.value.indexOf('right') !== -1) {
        return;
      }
      borderTaken = true;
      event.currentTarget.classList.add(`${this.currentPlayerColor}-right`);
      this.board[borderIndices.right] = this.currentPlayer;
      if (col < this.cols - 1) {
        const sibling = event.currentTarget.nextSibling;
        sibling.classList.add(`${this.currentPlayerColor}-left`);
        if (sibling.classList.length === 8) {
          sibling.classList.add(`${this.currentPlayerColor}`);
          this.currentPlayer === 1
            ? (this.playerScores[1] += 1)
            : (this.playerScores[-1] += 1);
          tileTaken = true;
        }
      }
    } else if (y < top + border_top) {
      console.log('top border is clicked');
      // Check if border is already taken.
      if (event.currentTarget.classList.value.indexOf('top') !== -1) {
        return;
      }
      borderTaken = true;
      event.currentTarget.classList.add(`${this.currentPlayerColor}-top`);
      this.board[borderIndices.top] = this.currentPlayer;
      if (row > 0) {
        const sibling = playfield.children[row - 1].children[col];
        sibling.classList.add(`${this.currentPlayerColor}-bottom`);
        if (sibling.classList.length === 8) {
          sibling.classList.add(`${this.currentPlayerColor}`);
          this.currentPlayer === 1
            ? (this.playerScores[1] += 1)
            : (this.playerScores[-1] += 1);
          tileTaken = true;
        }
      }
    } else if (y > bottom - border_bottom) {
      console.log('bottom border is clicked');
      // Check if border is already taken.
      if (event.currentTarget.classList.value.indexOf('bottom') !== -1) {
        return;
      }
      borderTaken = true;
      event.currentTarget.classList.add(`${this.currentPlayerColor}-bottom`);
      this.board[borderIndices.bottom] = this.currentPlayer;
      if (row < this.rows - 1) {
        const sibling =
          event.currentTarget.parentNode.nextSibling.childNodes[col];
        sibling.classList.add(`${this.currentPlayerColor}-top`);
        if (sibling.classList.length === 8) {
          sibling.classList.add(`${this.currentPlayerColor}`);
          this.currentPlayer === 1
            ? (this.playerScores[1] += 1)
            : (this.playerScores[-1] += 1);
          tileTaken = true;
        }
      }
    }

    const totalBordersTaken = event.currentTarget.classList.length;
    if (totalBordersTaken === 8) {
      event.currentTarget.classList.add(`${this.currentPlayerColor}`);
      this.currentPlayer === 1
        ? (this.playerScores[1] += 1)
        : (this.playerScores[-1] += 1);
      tileTaken = true;
      return;
    } else if (tileTaken === true) {
      return;
    }

    if (borderTaken) {
      this.changePlayer();
    }
  }

  colorBorders(move) {
    let tiles = document.getElementsByClassName(move);

    for (let tile of tiles) {
      for (let i = 0; i < 4; i++) {
        if (tile.classList.item(i) == move) {
          switch (i) {
            case 0:
              tile.classList.add(`${this.currentPlayerColor}-top`);
              if (tile.classList.length === 8) {
                tile.classList.add(`${this.currentPlayerColor}`);
              }
              break;
            case 1:
              tile.classList.add(`${this.currentPlayerColor}-left`);
              if (tile.classList.length === 8) {
                tile.classList.add(`${this.currentPlayerColor}`);
              }
              break;
            case 2:
              tile.classList.add(`${this.currentPlayerColor}-right`);
              if (tile.classList.length === 8) {
                tile.classList.add(`${this.currentPlayerColor}`);
              }
              break;
            case 3:
              tile.classList.add(`${this.currentPlayerColor}-bottom`);
              if (tile.classList.length === 8) {
                tile.classList.add(`${this.currentPlayerColor}`);
              }
              break;
            default:
              break;
          }
        }
      }
    }
  }

  playMove(move, color) {
    if (color) this.colorBorders(move);

    this.board[move] = this.currentPlayer;
    let tiles = document.getElementsByClassName(move);
    let tileCaptured = false;

    for (let tile of tiles) {
      let availableBorders = 4
      for (let i = 0; i < 4; i++) {
        const index = tile.classList.item(i);
        if (this.board[index] !== 0) {
          availableBorders -= 1;
        }
      }
      if (availableBorders === 0) {
        this.playerScores[this.currentPlayer] += 1;
        tileCaptured = true;
      }
    }

    if (!tileCaptured) this.changePlayer();
  }

  minimax(depth, alpha, beta, player) {
    // If end of tree is reached, or no more moves available, return the board evaluation
    if (depth === 0 || this.getPossibleMoves().length === 0)
      return this.evaluateBoardState();

    const moves = this.getPossibleMoves();

    // AI plays (maximizing player 1)
    if (player == 1) {
      let highestValue = -999;

      for (let i = 0; i < moves.length; i++) {
        // Save the current game state
        const playerScores = JSON.parse(JSON.stringify(this.playerScores));
        const currentPlayer = JSON.parse(JSON.stringify(this.currentPlayer));
        const currentPlayerColor = JSON.parse(
          JSON.stringify(this.currentPlayerColor)
        );
        const board = JSON.parse(JSON.stringify(this.board));

        this.playMove(moves[i], false);

        let value = 0;

        // Check who's turn it is after the played move
        if (this.currentPlayer === 1) {
          value = this.minimax(depth - 1, alpha, beta, 1);
        } else {
          value = this.minimax(depth - 1, alpha, beta, -1);
        }

        highestValue = Math.max(highestValue, value);
        alpha = Math.max(alpha, value);

        // Undo the move
        this.playerScores = playerScores;
        this.currentPlayer = currentPlayer;
        this.currentPlayerColor = currentPlayerColor;
        this.board = board;

        // Stop searching
        if (alpha >= beta) {
          break;
        }
      }

      return highestValue;
    } else {
      // Human plays (minimizing player -1)
      let lowestValue = 999;

      for (let i = 0; i < moves.length; i++) {
        // Save the current game state
        const playerScores = JSON.parse(JSON.stringify(this.playerScores));
        const currentPlayer = JSON.parse(JSON.stringify(this.currentPlayer));
        const currentPlayerColor = JSON.parse(
          JSON.stringify(this.currentPlayerColor)
        );
        const board = JSON.parse(JSON.stringify(this.board));

        this.playMove(moves[i], false);

        let value = 0;

        // Check who's turn it is after the played move
        if (this.currentPlayer === 1) {
          value = this.minimax(depth - 1, alpha, beta, 1);
        } else {
          value = this.minimax(depth - 1, alpha, beta, -1);
        }

        lowestValue = Math.min(lowestValue, value);
        beta = Math.min(beta, value);

        // Undo the move
        this.playerScores = playerScores;
        this.currentPlayer = currentPlayer;
        this.currentPlayerColor = currentPlayerColor;
        this.board = board;

        // Stop searching
        if (alpha >= beta) {
          break;
        }
      }
      return lowestValue;
    }
  }

  minimaxRoot(depth) {
    const moves = this.getPossibleMoves();
    let bestMove = 0;
    this.currentPlayer === 1 ? (bestMove = -999) : (bestMove = 999);
    let bestMovesFound = [];
    let movesAndValues = []

    moves.forEach(move => {
      // Save the current game state by copying the variables into placeholders
      const playerScores = JSON.parse(JSON.stringify(this.playerScores));
      const currentPlayer = JSON.parse(JSON.stringify(this.currentPlayer));
      const currentPlayerColor = JSON.parse(
        JSON.stringify(this.currentPlayerColor)
      );
      const board = JSON.parse(JSON.stringify(this.board));
      let value = 0;

      this.playMove(move, false);

      // Check who's turn it is after the played move
      if (this.currentPlayer == 1) {
        value = this.minimax(depth - 1, -999, 999, 1);
      } else {
        value = this.minimax(depth - 1, -999, 999, -1);
      }

      // Undo the move
      this.playerScores = playerScores;
      this.currentPlayer = currentPlayer;
      this.currentPlayerColor = currentPlayerColor;
      this.board = board;

      movesAndValues.push({move, value})

      if (value >= bestMove) {
        bestMove = value;
        bestMovesFound = [move]
      }
    });

    for (let pair of movesAndValues) {
      if (pair.value === bestMove) {
        bestMovesFound.push(pair.move)
      }
    }
    return bestMovesFound;
  }
}

// Initialize the board
game = new Game(rowCount, colCount);
drawPlayfield();
