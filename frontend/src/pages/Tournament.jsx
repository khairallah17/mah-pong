import { React, useState } from 'react'
import { Trophy } from 'lucide-react'

export default function Tournament() {
  const [matches, setMatches] = useState([
    // Round 1 (Quarter-finals)
    { id: 1, round: 1, position: 1, participant1: { id: 1, name: 'Team 1' }, participant2: { id: 2, name: 'Team 2' } },
    { id: 2, round: 1, position: 2, participant1: { id: 3, name: 'Team 3' }, participant2: { id: 4, name: 'Team 4' } },
    { id: 3, round: 1, position: 3, participant1: { id: 5, name: 'Team 5' }, participant2: { id: 6, name: 'Team 6' } },
    { id: 4, round: 1, position: 4, participant1: { id: 7, name: 'Team 7' }, participant2: { id: 8, name: 'Team 8' } },
    // Round 2 (Semi-finals)
    { id: 5, round: 2, position: 1 },
    { id: 6, round: 2, position: 2 },
    // Round 3 (Final)
    { id: 7, round: 3, position: 1 },
  ])

  const handleWinnerSelection = (matchId, participant) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches]
      const currentMatch = newMatches.find(m => m.id === matchId)
      if (currentMatch) {
        currentMatch.winner = participant

        // Find and update next match
        const nextRoundMatch = newMatches.find(m =>
          m.round === currentMatch.round + 1 &&
          Math.ceil(currentMatch.position / 2) === m.position
        )

        if (nextRoundMatch) {
          if (currentMatch.position % 2 === 1) {
            nextRoundMatch.participant1 = participant
          } else {
            nextRoundMatch.participant2 = participant
          }
        }
      }
      return newMatches
    })
  }

  return (
    <div className="min-h-screen bg-[#1a1464] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tournament Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            TOURNAMENT
          </h1>
          <div className="w-48 h-1 bg-white mx-auto mt-2"></div>
        </div>

        {/* Tournament Bracket */}
        <div className="flex justify-between items-center text-black" >
          <div className="flex-1">
          <div className="grid grid-cols-2 gap-24">
            {/* <div className="grid grid-cols-3 gap-8"> */}
              {/* Round 1 */}
              {/* <div className="space-y-8">
                {matches.filter(m => m.round === 1).map((match) => (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => match.participant1 && handleWinnerSelection(match.id, match.participant1)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant1?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[2%] z-[1] w-[60px] h-[90px] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[300px] h-[100px] flex items-center clip-card">
                        <span className="pl-12">{match.participant1?.name || 'TBD'}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => match.participant2 && handleWinnerSelection(match.id, match.participant2)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant2?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[2%] z-[1] w-[60px] h-[90px] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[300px] h-[100px] flex items-center clip-card">
                        <span className="pl-12">{match.participant2?.name || 'TBD'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div> */}

              {/* Round 2 */}
              <div className="space-y-16 mt-16">
                {matches.filter(m => m.round === 2).map((match) => (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-4">
                    <button
                        onClick={() => match.participant1 && handleWinnerSelection(match.id, match.participant1)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant1?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[7%] z-[1] w-[17%] h-[75%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                        <span className="absolute left-[20%] pl-12">{match.participant1?.name || 'TBD'}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => match.participant2 && handleWinnerSelection(match.id, match.participant2)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant2?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[7%] z-[1] w-[17%] h-[75%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                        <span className="absolute left-[20%] pl-12">{match.participant2?.name || 'TBD'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Round */}
              <div className="mt-52">
                {matches.filter(m => m.round === 3).map((match) => (
                  <div key={match.id} className="relative">
                    <div className="flex flex-col gap-4">
                    <button
                        onClick={() => match.participant1 && handleWinnerSelection(match.id, match.participant1)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant1?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[7%] z-[1] w-[17%] h-[75%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                        <span className="absolute left-[20%] pl-12">{match.participant1?.name || 'TBD'}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => match.participant2 && handleWinnerSelection(match.id, match.participant2)}
                        className={`bg-transparent relative flex items-center overflow-visible transition-all duration-300 ${match.winner?.id === match.participant2?.id ? 'ring-2 ring-yellow-400' : ''
                          }`}
                      >
                        <div class="absolute left-[7%] z-[1] w-[17%] h-[75%] bg-[#9a77ff] rounded-tr-[15px] rounded-bl-[15px]"></div>

                        <div class="relative bg-white w-[100%] h-[100px] flex items-center clip-card">
                        <span className="absolute left-[20%] pl-12">{match.participant2?.name || 'TBD'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Champion Section */}
          <div className="w-[30%] flex flex-col items-center">
            <div className="mb-4">
              <Trophy className="w-24 h-24 text-yellow-400" />
              <div className="text-yellow-400 text-2xl font-bold text-center mt-2">CHAMPION</div>
            </div>
            <div className="w-[80%] h-12 bg-white rounded-md relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-violet-400"></div>
              <span className="pl-12">
                {matches[6].winner?.name || 'TBD'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
