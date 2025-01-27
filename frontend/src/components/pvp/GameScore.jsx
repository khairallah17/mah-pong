import { Avatar } from './Avatar'

export default function GameScore({ player1, player2 }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg">
      <div className="flex items-center gap-8 p-4">
        <div className="flex items-center gap-3">
          <Avatar 
            src={player1.avatar}
            alt={player1.username}
            fallback={player1.username[0]}
          />
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">{player1.username}</span>
            <span className="text-2xl font-bold tabular-nums text-white">{player1.score}</span>
          </div>
        </div>
        
        <div className="h-10 w-px bg-gray-800" />
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400">{player2.username}</span>
            <span className="text-2xl font-bold tabular-nums text-white">{player2.score}</span>
          </div>
          <Avatar 
            src={player2.avatar}
            alt={player2.username}
            fallback={player2.username[0]}
          />
        </div>
      </div>
    </div>
  )
}

