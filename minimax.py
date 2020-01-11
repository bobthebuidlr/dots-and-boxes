########################################################################################################################
# WELCOME TO THE DOTS AND SQUARES PLAYING ARTIFICIAL INTELLIGENCE
#
# THE RULES:
#   - 2 player game.
#   - Game is initialized in a x by x grid.
#   - The goal is to capture as many squares on the grid as possible.
#   - Player -1 (human) starts by marking one border.
#   - The player with the most captured squares wins.
#   - You capture a square when you mark the last border of the square.
#   - When you capture a square, you get to go again. Other player has to wait.
#
########################################################################################################################
import time
import math
import random


class Game:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.board = [0] * ((self.rows * 2 + 1) * self.cols + self.rows)
        self.gameEnded = False
        self.currentPlayer = -1
        self.positions = [i for i, n in enumerate(self.board)]
        self.players = {
            1: 0,
            -1: 0
        }

        # Define the excluded cells and directions.
        self.exclude_top = None
        self.exclude_bottom = None
        self.exclude_left = None
        self.exclude_right = None
        self.border_directions = None

        self.get_excluded_positions()
        self.define_border_directions()

    def initialize_game(self):
        self.board = [0] * ((self.rows * 2 + 1) * self.cols + self.rows)
        self.currentPlayer = 1
        self.positions = [i for i, n in enumerate(self.board)]
        self.gameEnded = False

    def changePlayer(self):
        self.currentPlayer *= -1

    def get_excluded_positions(self):
        self.exclude_top = self.positions[0:self.cols]
        self.exclude_bottom = self.positions[-self.cols:]
        self.exclude_left = [i for i in range(self.cols, len(self.board), self.cols * 2 + 1)]
        self.exclude_right = [i for i in range(self.cols * 2, len(self.board), self.cols * 2 + 1)]

    def define_border_directions(self):
        self.border_directions = [0] * ((self.rows * 2 + 1) * self.cols + self.rows)
        for i in range(0, len(self.board), self.cols * 2 + 1):
            self.border_directions[i:i + self.cols] = [1] * self.cols

    def check_horizontal_tiles(self, border):
        if border in self.exclude_left:
            right = [border, border - self.cols, border + 1, border + 1 + self.cols]
            left = None
        elif border in self.exclude_right:
            left = [border, border + self.cols, border - 1, border - 1 - self.cols]
            right = None
        else:
            right = [border, border - self.cols, border + 1, border + 1 + self.cols]
            left = [border, border + self.cols, border - 1, border - 1 - self.cols]

        return left, right

    def check_vertical_tiles(self, border):
        """
        If the input border is a horizontal border, the tiles to the top and bottom need to be checked.
        If the border is at the top or bottom of the playing field, either the top or bottom has to be exluded.
        :param border: The index of the border played
        :return: A list with the indices of the surrounding tiles
        """
        if border in self.exclude_top:
            top = None
            bottom = [border, border + self.cols, border + self.cols + 1, border + self.cols * 2 + 1]
        elif border in self.exclude_bottom:
            top = [border, border - self.cols, border - self.cols - 1, border - self.cols * 2 - 1]
            bottom = None
        else:
            top = [border, border - self.cols, border - self.cols - 1, border - self.cols * 2 - 1]
            bottom = [border, border + self.cols, border + self.cols + 1, border + self.cols * 2 + 1]
        return top, bottom

    def getPossibleActions(self):
        return [i for i, n in enumerate(self.board) if n == 0]

    def print_board(self):
        """
        Print the current boards state. A 1 indicates player 1, a 0 indicated player 2.
        :return:
        """
        idx = 0
        for i in range(self.rows * 2 + 1):

            # row number is even:
            if i % 2 == 0:
                out = ''
                for j in range(self.cols):
                    if self.board[idx] == 0:
                        out += '-----'
                    elif self.board[idx] == 1:
                        out += 'AAAAA'
                    elif self.board[idx] == -1:
                        out += 'HHHHH'
                    idx += 1
                print(out)

            # row number is uneven
            else:
                out = ''
                for j in range(self.cols + 1):

                    if self.board[idx] == 0:
                        out += '|    '
                    elif self.board[idx] == 1:
                        out += 'A    '
                    elif self.board[idx] == -1:
                        out += 'H    '
                    idx += 1
                print(out)

    # Determines if the made move is a legal move
    def is_valid(self, action, possibleActions):
        print(action, possibleActions)
        if action in possibleActions:
            return True
        else:
            return False

    # Checks if the game has ended and returns the winner in each case
    def is_end(self):
        if len(self.getPossibleActions()) == 0:
            print('Current endgame state: ', self.players)
            return 1 if self.players[1] > self.players[-1] else -1 if self.players[-1] > self.players[1] else 0
        else:
            return None

    def evaluateScores(self):
        """
        Get the current value of the game state. This is the number of squares captured. A negative number means that
        minimizing player is in favor, and vice versa.
        :return: the net squares captured, either positive or negative
        """
        # Square the score difference, to promote more square captures over fewer (as it could also mean tie)
        score = self.players[1] - self.players[-1]
        if score < 0:
            score = score ** 2 * -1
        else:
            score = score ** 2

        # if score is not 0:
        #     print(f'player 1: {self.players[1]} and player -1: {self.players[-1]}')
        #     print('board value: ', score)
        return score

    def play(self, action):

        # Update the board
        self.board[action] = self.currentPlayer

        # Check the direction of the border
        direction = self.border_directions[action]

        # Horizontal borders
        if direction == 1:
            top, bottom = self.check_vertical_tiles(action)

            available_top_borders = 4
            available_bottom_borders = 4

            if top is not None:
                for border in top:
                    if self.board[border] != 0:
                        available_top_borders -= 1
            if bottom is not None:
                for border in bottom:
                    if self.board[border] != 0:
                        available_bottom_borders -= 1

            if available_bottom_borders == 0:
                self.players[self.currentPlayer] += 1
            if available_top_borders == 0:
                self.players[self.currentPlayer] += 1

            if available_top_borders == 0 or available_bottom_borders == 0:
                return

            self.changePlayer()

        # Vertical borders
        elif direction == 0:
            left, right = self.check_horizontal_tiles(action)

            available_left_borders = 4
            available_right_borders = 4
            if left is not None:
                for border in left:
                    if self.board[border] != 0:
                        available_left_borders -= 1
            if right is not None:
                for border in right:
                    if self.board[border] != 0:
                        available_right_borders -= 1
            if available_left_borders == 0:
                self.players[self.currentPlayer] += 1
            if available_right_borders == 0:
                self.players[self.currentPlayer] += 1

            if available_right_borders == 0 or available_left_borders == 0:
                return

            self.changePlayer()

    def minimax(self, depth, alpha, beta, player):
        if depth == 0 or len(self.getPossibleActions()) == 0:
            # TODO: Maybe need to use a - sign?
            return self.evaluateScores()

        moves = self.getPossibleActions()

        # AI is the maximizing (player 1)
        if player == 1:
            highestValue = -999
            for move in moves:

                # Save current game state
                currentScore = self.players.copy()
                currentPlayer = self.currentPlayer
                currentBoard = self.board.copy()

                # Play move, and move down the tree and retrieve the
                self.play(move)
                if self.currentPlayer == 1:
                    value = self.minimax(depth - 1, alpha, beta, 1)
                else:
                    value = self.minimax(depth - 1, alpha, beta, -1)

                highestValue = max(highestValue, value)
                alpha = max(alpha, value)

                # Undo the move
                self.players = currentScore
                self.currentPlayer = currentPlayer
                self.board = currentBoard

                if alpha >= beta:
                    break

            return highestValue

        # Human is minimizing (player -1)
        else:
            lowestValue = 999
            for move in moves:

                # Save current game state
                currentScore = self.players.copy()
                currentPlayer = self.currentPlayer
                currentBoard = self.board.copy()

                # Play the move, and move down the tree
                self.play(move)
                if self.currentPlayer == 1:
                    value = self.minimax(depth-1, alpha, beta, 1)
                else:
                    value = self.minimax(depth-1, alpha, beta, -1)

                lowestValue = min(lowestValue, value)
                beta = min(beta, value)

                # Undo the move
                self.players = currentScore
                self.currentPlayer = currentPlayer
                self.board = currentBoard

                if alpha >= beta:
                    break

            return lowestValue

    # TODO: check why the player is passed in this function. Maybe this root can be skipped
    def minimaxRoot(self, depth, player):
        moves = self.getPossibleActions()
        bestMove = -999
        bestMovesFound = None

        for move in moves:

            # Save current game state
            currentScore = self.players.copy()
            currentPlayer = self.currentPlayer
            currentBoard = self.board.copy()

            # Play the move
            self.play(move)
            if self.currentPlayer == -1:
                value = self.minimax(depth - 1, -999, 999, -1)
            else:
                value = self.minimax(depth - 1, -999, 999, 1)

            # Undo the move, and restore to saved game state
            self.players = currentScore
            self.currentPlayer = currentPlayer
            self.board = currentBoard

            if value >= bestMove:
                bestMove = value
                bestMovesFound = move
            # else:
            #     bestMovesFound.append(move)

        return bestMovesFound, bestMove


def main():
    g = Game(3, 3)

    while True:
        print(f'Current score: {g.players}')
        g.print_board()
        g.result = g.is_end()

        if g.result is not None:
            if g.result == -1:
                print('Human wins!')
            elif g.result == 1:
                print('AI wins!')
            elif g.result == 0:
                print("It's a tie!")

            g.initialize_game()
            return

        if g.currentPlayer == -1:

            while True:
                action = int(input('Insert the X coordinate: '))

                if g.is_valid(action, g.getPossibleActions()):
                    g.play(action)
                    break
                else:
                    print('The move is not valid! Try again.')

        else:
            # Run the minimax algorithm to look ahead, and return a list of moves with the best value
            print('Computer is thinking...')
            move, value = g.minimaxRoot(6, 1)


            # Pick a random choice of the available moves and play
            # move = random.choice(moves)
            g.play(move)


if __name__ == "__main__":
    main()
