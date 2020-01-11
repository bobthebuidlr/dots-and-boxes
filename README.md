# Dots-and-boxes
In this project I created an Agent that is able to play the game Dots and Boxes. It uses a minimax algorithm with alpha-bet pruning.

## Game rules:
You play on a grid and take a border by clicking on it. When you close a 1x1 tile, you capture the tile and score a point. The players move in turn, but when you capture a tile you must play again. The player with the most captured tiles wins.

## Game options
- Add/remove columns and rows (between 2-6)
- Change the difficulty of the Agent
  - Beginner: Agent looks 1 step ahead
  - Intermediate: Agent looks 2 steps ahead
  - Expert: Agent looks 3 steps ahead
  - A.I.: Agent looks 4 steps ahead

## :bug: Known issues
- Clicking on the edge (corner) of a border sometimes takes a wrong tile.
