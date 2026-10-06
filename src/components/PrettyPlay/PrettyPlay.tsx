import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Gift, RotateCcw, Copy, Check, Trophy, Users, Bot, ArrowRight } from 'lucide-react'
import { claimGameRewardApi, type GameRewardResponse } from '../../services/gameService'
import './PrettyPlay.css'

type Player = '🎀' | '✧'
type Board = (Player | null)[]
type Difficulty = 'easy' | 'medium' | 'hard'
type Mode = 'vs-computer' | 'vs-friend'

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
]

export const PrettyPlay: React.FC = () => {
  // Game start state - initial render shows only intro card
  const [isPlaying, setIsPlaying] = useState(false)

  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('🎀')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [mode, setMode] = useState<Mode>('vs-computer')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [movesCount, setMovesCount] = useState(0)

  // Reward state
  const [claiming, setClaiming] = useState(false)
  const [rewardData, setRewardData] = useState<GameRewardResponse['reward'] | null>(null)
  const [rewardMsg, setRewardMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Check winner
  const checkWinner = useCallback((b: Board) => {
    for (const combo of WINNING_COMBOS) {
      const [a, c, d] = combo
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a] as Player, line: combo }
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null }
    }
    return null
  }, [])

  // Minimax algorithm for Hard difficulty
  const minimax = useCallback(function runMinimax(newBoard: Board, player: Player): { score: number; index?: number } {
    const availSpots = newBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null)

    const res = checkWinner(newBoard)
    if (res?.winner === '✧') return { score: 10 }
    if (res?.winner === '🎀') return { score: -10 }
    if (availSpots.length === 0) return { score: 0 }

    const moves: { index: number; score: number }[] = []

    for (let i = 0; i < availSpots.length; i++) {
      const move = { index: availSpots[i], score: 0 }
      newBoard[availSpots[i]] = player

      if (player === '✧') {
        const result = runMinimax(newBoard, '🎀')
        move.score = result.score
      } else {
        const result = runMinimax(newBoard, '✧')
        move.score = result.score
      }

      newBoard[availSpots[i]] = null
      moves.push(move)
    }

    let bestMove = 0
    if (player === '✧') {
      let bestScore = -10000
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    } else {
      let bestScore = 10000
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    }

    return moves[bestMove]
  }, [checkWinner])

  // Computer Move
  const makeComputerMove = useCallback(
    (currentBoard: Board) => {
      const emptyIndices = currentBoard
        .map((cell, idx) => (cell === null ? idx : null))
        .filter((val): val is number => val !== null)

      if (emptyIndices.length === 0) return

      let chosenIndex: number

      if (difficulty === 'easy') {
        // Random
        chosenIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
      } else if (difficulty === 'medium') {
        // Medium: Check if computer can win, or block player, else random
        let blockingIndex: number | null = null
        let winningIndex: number | null = null

        for (const idx of emptyIndices) {
          const testBoard = [...currentBoard]
          testBoard[idx] = '✧'
          if (checkWinner(testBoard)?.winner === '✧') {
            winningIndex = idx
            break
          }
        }

        if (winningIndex !== null) {
          chosenIndex = winningIndex
        } else {
          for (const idx of emptyIndices) {
            const testBoard = [...currentBoard]
            testBoard[idx] = '🎀'
            if (checkWinner(testBoard)?.winner === '🎀') {
              blockingIndex = idx
              break
            }
          }
          chosenIndex =
            blockingIndex !== null
              ? blockingIndex
              : emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        }
      } else {
        // Hard: Minimax
        const best = minimax([...currentBoard], '✧')
        chosenIndex = best.index !== undefined ? best.index : emptyIndices[0]
      }

      const nextBoard = [...currentBoard]
      nextBoard[chosenIndex] = '✧'
      setBoard(nextBoard)
      setMovesCount((prev) => prev + 1)

      const winResult = checkWinner(nextBoard)
      if (winResult) {
        setWinner(winResult.winner)
        setWinningLine(winResult.line)
      } else {
        setCurrentPlayer('🎀')
      }
    },
    [difficulty, checkWinner, minimax]
  )

  // Call backend to verify and claim reward
  const claimReward = useCallback(async (finalBoard: Board, count: number) => {
    try {
      setClaiming(true)
      const sessionId = localStorage.getItem('hpt_session_id') || undefined
      const userJson = localStorage.getItem('hpt_customer_user')
      const userId = userJson ? JSON.parse(userJson).id : undefined

      const res = await claimGameRewardApi({
        sessionId,
        userId,
        boardState: finalBoard.map((c) => c || ''),
        winner: '🎀',
        difficulty,
        movesCount: count,
      })

      if (res.reward) {
        setRewardData(res.reward)
        setRewardMsg(res.message)
      } else if (res.message) {
        setRewardMsg(res.message)
      }
    } catch (err) {
      console.error('Reward claim error:', err)
    } finally {
      setClaiming(false)
    }
  }, [difficulty])

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] || winner || claiming) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    const newCount = movesCount + 1
    setMovesCount(newCount)

    const winResult = checkWinner(newBoard)
    if (winResult) {
      setWinner(winResult.winner)
      setWinningLine(winResult.line)
      if (winResult.winner === '🎀') {
        claimReward(newBoard, newCount)
      }
    } else {
      if (mode === 'vs-computer') {
        setCurrentPlayer('✧')
      } else {
        setCurrentPlayer(currentPlayer === '🎀' ? '✧' : '🎀')
      }
    }
  }

  // Trigger computer move when it's computer's turn
  useEffect(() => {
    if (isPlaying && mode === 'vs-computer' && currentPlayer === '✧' && !winner) {
      const timer = setTimeout(() => {
        makeComputerMove(board)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentPlayer, mode, winner, board, makeComputerMove])

  // Reset Game
  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('🎀')
    setWinner(null)
    setWinningLine(null)
    setMovesCount(0)
    setRewardData(null)
    setRewardMsg('')
    setCopied(false)
  }

  const handleCopyCode = () => {
    if (rewardData?.code) {
      navigator.clipboard.writeText(rewardData.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStartGame = () => {
    setIsPlaying(true)
  }

  return (
    <section className="pretty-play-card" aria-label="Pretty Play Tic-Tac-Toe Game">
      {!isPlaying ? (
        /* INITIAL COMPACT INTRO CARD */
        <div className="play-intro-view">
          <div className="play-badge">
            <Sparkles size={13} aria-hidden="true" />
            <span>PRETTY PLAY</span>
          </div>

          {/* Obvious Decorative Mini XO Preview */}
          <div className="play-intro-xo-preview" aria-hidden="true">
            <span className="xo-symbol xo-symbol-bow">🎀</span>
            <span className="xo-symbol xo-symbol-star">✧</span>
            <span className="xo-symbol xo-symbol-bow">🎀</span>
          </div>

          <div className="play-intro-content">
            <h2 className="play-intro-title">XO · Tic-Tac-Toe</h2>
            <p className="play-intro-subtitle">A Tiny Game for a Tiny Break</p>

            <div className="play-intro-reward-banner">
              <Gift size={15} className="play-gift-icon" aria-hidden="true" />
              <span>
                Win a match to unlock <strong>ONE CUTE PEN AS A FREE GIFT</strong> 🎁
              </span>
            </div>
          </div>

          <button
            type="button"
            className="play-now-cta"
            onClick={handleStartGame}
            aria-label="Play Now - Start a game of Tic-Tac-Toe"
          >
            <span>PLAY NOW</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        /* REVEALED COMPACT GAME BOARD */
        <div className="play-game-view">
          <div className="play-header-compact">
            <div className="play-badge">
              <Sparkles size={12} aria-hidden="true" />
              <span>PRETTY PLAY · XO</span>
            </div>
            <p className="play-reward-micro">
              Win a match to unlock a <strong>Free Cute Pen</strong> 🎁
            </p>
          </div>

          {/* Mode & Difficulty Selector */}
          <div className="play-controls-bar">
            <div className="mode-toggle">
              <button
                type="button"
                className={mode === 'vs-computer' ? 'active' : ''}
                onClick={() => {
                  setMode('vs-computer')
                  resetGame()
                }}
              >
                <Bot size={13} /> vs Computer
              </button>
              <button
                type="button"
                className={mode === 'vs-friend' ? 'active' : ''}
                onClick={() => {
                  setMode('vs-friend')
                  resetGame()
                }}
              >
                <Users size={13} /> vs Friend
              </button>
            </div>

            {mode === 'vs-computer' && (
              <div className="difficulty-pills">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                    onClick={() => {
                      setDifficulty(d)
                      resetGame()
                    }}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Turn indicator */}
          <div className="play-turn-indicator">
            {!winner ? (
              <span>
                Current Turn: <strong>{currentPlayer} {currentPlayer === '🎀' ? 'You (Bow)' : mode === 'vs-computer' ? 'Computer (Star)' : 'Friend (Star)'}</strong>
              </span>
            ) : winner === 'draw' ? (
              <span className="game-status draw">It’s a lovely tie! Try again 🌸</span>
            ) : (
              <span className="game-status win">
                <Trophy size={15} /> Winner: {winner} {winner === '🎀' ? 'You Won!' : 'Computer Won!'}
              </span>
            )}
          </div>

          {/* Compact 3x3 Grid */}
          <div className="tic-tac-grid" role="grid" aria-label="Tic-tac-toe board">
            {board.map((cell, idx) => {
              const isWinningCell = winningLine?.includes(idx)
              return (
                <button
                  key={idx}
                  type="button"
                  className={`grid-cell ${cell ? 'filled' : ''} ${isWinningCell ? 'win-cell' : ''}`}
                  onClick={() => handleCellClick(idx)}
                  disabled={Boolean(cell || winner || (mode === 'vs-computer' && currentPlayer === '✧'))}
                  aria-label={`Cell ${idx + 1}, ${cell || 'empty'}`}
                >
                  <span className={`cell-symbol ${cell === '🎀' ? 'bow' : 'star'}`}>
                    {cell}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Reward Unlock Modal / Banner */}
          {rewardData && (
            <div className="reward-unlocked-card">
              <div className="reward-icon-wrap">
                <Gift size={22} color="#db2777" />
              </div>
              <div className="reward-content">
                <h3>🎉 You Won a Free Cute Pen!</h3>
                <p>{rewardData.rewardDescription || 'One Cute Pen added as a free gift with your next order.'}</p>
                <div className="reward-code-box">
                  <code>{rewardData.code}</code>
                  <button type="button" onClick={handleCopyCode} className="copy-code-btn">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <small>Apply this promo code at checkout to claim your gift!</small>
              </div>
            </div>
          )}

          {rewardMsg && !rewardData && (
            <div className="reward-info-msg">
              <p>{rewardMsg}</p>
            </div>
          )}

          {/* Reset button & back to intro */}
          <div className="play-footer-actions">
            <button type="button" className="play-reset-btn" onClick={resetGame}>
              <RotateCcw size={14} /> Play Again
            </button>
            <Link to="/byob" className="play-shop-link">
              Explore BYOB Box →
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

export default PrettyPlay
