import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { RotateCcw, Trophy, Gamepad2 } from 'lucide-react'

export interface GameState {
  board: (string | null)[]
  currentPlayer: 'X' | 'O'
  winner: string | null
  gameOver: boolean
  score: { player: number; albert: number; draws: number }
}

interface TicTacToeProps {
  onMove: (gameState: GameState) => void
  onGameEnd: (result: 'win' | 'lose' | 'draw') => void
  albertMove?: number
}

export function TicTacToe({ onMove, onGameEnd, albertMove }: TicTacToeProps) {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    gameOver: false,
    score: { player: 0, albert: 0, draws: 0 }
  })

  const checkWinner = (board: (string | null)[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  const makeMove = (index: number) => {
    if (gameState.board[index] || gameState.gameOver) return

    const newBoard = [...gameState.board]
    newBoard[index] = gameState.currentPlayer

    const winner = checkWinner(newBoard)
    const isDraw = !winner && newBoard.every(cell => cell !== null)
    const gameOver = winner !== null || isDraw

    const newScore = { ...gameState.score }
    if (gameOver) {
      if (winner === 'X') {
        newScore.player += 1
        onGameEnd('win')
      } else if (winner === 'O') {
        newScore.albert += 1
        onGameEnd('lose')
      } else {
        newScore.draws += 1
        onGameEnd('draw')
      }
    }

    const newState = {
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' as const : 'X' as const,
      winner,
      gameOver,
      score: newScore
    }

    setGameState(newState)
    onMove(newState)
  }

  const resetGame = () => {
    const newState = {
      board: Array(9).fill(null),
      currentPlayer: 'X' as const,
      winner: null,
      gameOver: false,
      score: gameState.score
    }
    setGameState(newState)
    onMove(newState)
  }

  const resetScore = () => {
    const newState = {
      ...gameState,
      score: { player: 0, albert: 0, draws: 0 }
    }
    setGameState(newState)
    onMove(newState)
  }

  // Handle Albert's move
  useEffect(() => {
    if (albertMove !== undefined && gameState.currentPlayer === 'O' && !gameState.gameOver) {
      makeMove(albertMove)
    }
  }, [albertMove, gameState.currentPlayer, gameState.gameOver])

  const getCellClass = (index: number) => {
    const value = gameState.board[index]
    let baseClass = "h-20 w-20 text-3xl font-bold rounded-xl border-2 transition-all duration-200 hover:scale-105 focus:scale-105"
    
    if (value === 'X') {
      baseClass += " bg-blue-100 text-blue-600 border-blue-300"
    } else if (value === 'O') {
      baseClass += " bg-red-100 text-red-600 border-red-300"
    } else {
      baseClass += " bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
    }
    
    return baseClass
  }

  const getStatusMessage = () => {
    if (gameState.gameOver) {
      if (gameState.winner === 'X') {
        return { text: "🎉 You Won!", color: "text-blue-600" }
      } else if (gameState.winner === 'O') {
        return { text: "🤖 Albert Won!", color: "text-red-600" }
      } else {
        return { text: "🤝 It's a Draw!", color: "text-gray-600" }
      }
    } else {
      return gameState.currentPlayer === 'X' 
        ? { text: "Your Turn (X)", color: "text-blue-600" }
        : { text: "Albert's Turn (O)", color: "text-red-600" }
    }
  }

  const status = getStatusMessage()

  return (
    <Card className="p-6 max-w-sm mx-auto bg-white/95 backdrop-blur-sm">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <Gamepad2 className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Tic Tac Toe</h3>
        </div>
        <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
      </div>

      {/* Score Board */}
      <div className="flex justify-center space-x-2 mb-4">
        <Badge variant="outline" className="text-blue-600">
          <Trophy className="h-3 w-3 mr-1" />
          You: {gameState.score.player}
        </Badge>
        <Badge variant="outline" className="text-red-600">
          <Trophy className="h-3 w-3 mr-1" />
          Albert: {gameState.score.albert}
        </Badge>
        <Badge variant="outline" className="text-gray-600">
          Draws: {gameState.score.draws}
        </Badge>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {gameState.board.map((cell, index) => (
          <Button
            key={index}
            className={getCellClass(index)}
            onClick={() => makeMove(index)}
            disabled={gameState.gameOver || gameState.currentPlayer === 'O' || !!cell}
            variant="outline"
          >
            {cell}
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-2">
        <Button
          onClick={resetGame}
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          New Game
        </Button>
        <Button
          onClick={resetScore}
          variant="outline"
          size="sm"
          className="text-gray-600"
        >
          Reset Score
        </Button>
      </div>
    </Card>
  )
}