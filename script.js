document.getElementById('add-col').addEventListener('click', addCol);
document.getElementById('remove-col').addEventListener('click', removeCol);
document.getElementById('add-row').addEventListener('click', addRow);
document.getElementById('remove-row').addEventListener('click', removeRow);
document.getElementById('difficulty').addEventListener('change', changeDifficulty);


let playfield = document.getElementById('playfield');

// Game settings
const BORDER_THICKNESS = 10;
let colCount = 3;
let rowCount = 3;
let difficulty = 3;

/**
 *** BOARD DRAWING AND ADJUSTMENT FUNCTIONS
 **/
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
      const indices = Object.values(getBorderIndices(i, j))
      const col = document.createElement('td');
      for (index in indices) {
        col.classList.add(indices[index])
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
    playAgent()
  }
}

function playAgent() {
  if (game.getPossibleMoves().length === 0) return;
  setTimeout(() => {
    console.log('GAME STATE BEFORE AGENT: ', game.board)
    const move = game.minimaxRoot(difficulty);
    game.colorBorders(move);
    game.playMove(move);
    console.log('GAME STATE AFTER AGENT: ', game.board)
    console.log(move)
    console.log(game.currentPlayer)
    if (game.currentPlayer === 1) {
      playAgent()
    }
  }, 500)
}

/**
 *** BOARD INDEXING FUNCTIONS
 **/

function getBorderIndices(row, col) {
  let indices = {};

  indices.top = +((colCount * 2 + 1) * row + col);
  indices.left = indices.top + colCount;
  indices.right = indices.left + 1;
  indices.bottom = indices.right + colCount;

  return indices;
}

/**
 *** GAME CLASS
 **/

class Game {
  rows = 0;
  cols = 0;
  indices = [];
  board = [];
  excludeTop = [];
  excludeBottom = [];
  excludeLeft = [];
  excludeRight = [];
  borderDirections = [];

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
      (this.borderDirections = this.initBoard()),
      this.createIndices(),
      this.getExcludedPositions(),
      this.defineBorderDirections();
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


  getExcludedPositions() {
    this.excludeTop = this.indices.slice(0, this.cols);
    this.excludeBottom = this.indices.slice(this.indices.length - this.cols);
    for (
      let i = this.cols;
      i < this.indices.length;
      i = i + this.cols * 2 + 1
    ) {
      this.excludeLeft.push(i);
    }
    for (
      let i = this.cols * 2;
      i < this.indices.length;
      i = i + this.cols * 2 + 1
    ) {
      this.excludeRight.push(i);
    }
  }

  defineBorderDirections() {
    for (let i = 0; i < this.borderDirections.length; i++) {
      this.borderDirections[i] = 1;
      if ((i - 2) % (this.cols * 2 + 1) === 0) {
        i = i + this.cols + 1;
      }
    }
  }

  checkHorizontalTiles(border) {
    let horizontalTiles = {};

    if (this.excludeLeft.includes(border)) {
      horizontalTiles.right = [
        border,
        border - this.cols,
        border + 1,
        border + 1 + this.cols
      ];
    } else if (this.excludeRight.includes(border)) {
      horizontalTiles.left = [
        border,
        border + this.cols,
        border - 1,
        border - 1 - this.cols
      ];
    } else {
      horizontalTiles.right = [
        border,
        border - this.cols,
        border + 1,
        border + 1 + this.cols
      ];
      horizontalTiles.left = [
        border,
        border + this.cols,
        border - 1,
        border - 1 - this.cols
      ];
    }
    return horizontalTiles;
  }

  checkVerticalTiles(border) {
    let verticalTiles = {};

    console.log('vertical tiles',document.getElementsByClassName(border))

    if (this.excludeTop.includes(border)) {
      verticalTiles.bottom = [
        border,
        border + this.cols,
        border + this.cols + 1,
        border + this.cols * 2 + 1
      ];
    } else if (this.excludeBottom.includes(border)) {
      verticalTiles.top = [
        border,
        border - this.cols,
        border - this.cols - 1,
        border - this.cols * 2 - 1
      ];
    } else {
      verticalTiles.top = [
        border,
        border - this.cols,
        border - this.cols - 1,
        border - this.cols * 2 - 1
      ];
      verticalTiles.bottom = [
        border,
        border + this.cols,
        border + this.cols + 1,
        border + this.cols * 2 + 1
      ];
    }
    return verticalTiles;
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
    let score = this.playerScores[1] - this.playerScores[-1]
    if (score < 0) {
      score = score ** 2 * -1
    } else {
      score = score ** 2
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
    };

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

  // TODO: simplify
  colorBorders(move) {
    const tiles = document.getElementsByTagName('td');
    for (let tile of tiles) {
      const indices = tile.classList
      if (indices.contains(move)) {
        for (let i = 0; i < indices.length; i++) {
          if (indices[i] == move) {
            switch(i) {
              case 0:
                tile.classList.add(`${this.currentPlayerColor}-top`);
                if (tile.classList.length === 8) {
                  tile.classList.add(`${this.currentPlayerColor}`)
                }
                break;
              case 1:
                tile.classList.add(`${this.currentPlayerColor}-left`);
                if (tile.classList.length === 8) {
                  tile.classList.add(`${this.currentPlayerColor}`)
                }
                break;
              case 2:
                tile.classList.add(`${this.currentPlayerColor}-right`);
                if (tile.classList.length === 8) {
                  tile.classList.add(`${this.currentPlayerColor}`)
                }
                break;
              case 3:
                tile.classList.add(`${this.currentPlayerColor}-bottom`);
                if (tile.classList.length === 8) {
                  tile.classList.add(`${this.currentPlayerColor}`)
                }
                break;
              default:
                break
            }
          }
        }
      }
    }
  }

  playMove(move) {
    this.board[move] = this.currentPlayer;

    const direction = this.borderDirections[move];

    // The border is horizontal, so check vertically aligned tiles
    if (direction === 1) {
      const top = this.checkVerticalTiles(move).top;
      const bottom = this.checkVerticalTiles(move).bottom;
      let availableTopBorders = 4;
      let availableBottomBorders = 4;

      // Check all the borders of the top cell
      if (top) {
        top.forEach(border => {
          if (this.board[border] !== 0) {
            availableTopBorders -= 1;
          }
        });
      }

      // Check all the borders of the bottom cell
      if (bottom) {
        bottom.forEach(border => {
          if (this.board[border] !== 0) {
            availableBottomBorders -= 1;
          }
        });
      }

      // If any of the tiles is captured, add a score to the player
      availableTopBorders === 0
        ? (this.playerScores[this.currentPlayer] += 1)
        : null;
      availableBottomBorders === 0
        ? (this.playerScores[this.currentPlayer] += 1)
        : null;
      if (availableBottomBorders === 0 || availableTopBorders === 0) return;

      // If no tiles were captured, change player
      this.changePlayer();
    } else {
      // The border is vertical, so check horizontal tiles

      const right = this.checkHorizontalTiles(move).right;
      const left = this.checkHorizontalTiles(move).left;
      let availableRightBorders = 4;
      let availableLeftBorders = 4;

      // Check all the borders of the right cell
      if (right) {
        right.forEach(border => {
          if (this.board[border] !== 0) {
            availableRightBorders -= 1;
          }
        });
      }

      // Check all the borders of the left cell
      if (left) {
        left.forEach(border => {
          if (this.board[border] !== 0) {
            availableLeftBorders -= 1;
          }
        });
      }

      // If any of the tiles is captured, add a score to the player
      availableRightBorders === 0
        ? (this.playerScores[this.currentPlayer] += 1)
        : null;
      availableLeftBorders === 0
        ? (this.playerScores[this.currentPlayer] += 1)
        : null;
      if (availableRightBorders === 0 || availableLeftBorders === 0) return;

      // If no tiles were captured, change player
      this.changePlayer();
    }
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
        const currentPlayerColor = JSON.parse(JSON.stringify(this.currentPlayerColor));
        const board = JSON.parse(JSON.stringify(this.board));

        this.playMove(moves[i]);

        let value = 0

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
        const currentPlayerColor = JSON.parse(JSON.stringify(this.currentPlayerColor));
        const board = JSON.parse(JSON.stringify(this.board));

        this.playMove(moves[i]);

        let value = 0

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

  minimaxRoot(depth, player) {
    const moves = this.getPossibleMoves();
    let bestMove = 0;
    this.currentPlayer === 1 ? bestMove = -999 : bestMove = 999;
    let bestMoveFound = null;

    moves.forEach(move => {
      // Save the current game state by copying the variables into placeholders
      const playerScores = JSON.parse(JSON.stringify(this.playerScores));
      const currentPlayer = JSON.parse(JSON.stringify(this.currentPlayer));
      const currentPlayerColor = JSON.parse(JSON.stringify(this.currentPlayerColor));
      const board = JSON.parse(JSON.stringify(this.board));
      let value = 0;

      this.playMove(move);

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

      if (value >= bestMove) {
        bestMove = value
        bestMoveFound = move
      }
      // if (this.currentPlayer === -1 && value <= bestMove) {
      //   bestMove = value;
      //   bestMoveFound = move;
      // } else if (this.currentPlayer === 1 && value >= bestMove) {
      //   bestMove = value;
      //   bestMoveFound = move;
      // }
    });
    return bestMoveFound;
  }
}

// Initialize the board
game = new Game(rowCount, colCount);
drawPlayfield();