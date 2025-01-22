import React, { useEffect, useState, useRef } from 'react';

export default function Tictactoe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [role, setRole] = useState(null);
  const [isMatched, setIsMatched] = useState(false); // New state
  const wsRef = useRef(null);

  useEffect(() => {
    const tokenData = JSON.parse(localStorage.getItem('authtoken'));
    const accessToken = tokenData && tokenData.access;
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/tictactoe/?token=${accessToken}`);
    wsRef.current.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === 'match_found') {
        setRole(data.role);
        setIsMatched(true); // Set matched to true
      }
      if (data.type === 'game_state') { // Changed from 'move' to 'game_state'
        setBoard(data.game_state.board);
        setCurrentPlayer(data.game_state.currentPlayer); // Update currentPlayer from game_state
        setWinner(data.game_state.winner);
      }
      if (data.type === 'game_end') { // Added handling for 'game_end'
        if (data.game_state.winner && data.game_state.winner !== "Draw") {
          alert(`${data.game_state.winner} Wins!`);
        } else if (data.game_state.winner === "Draw") {
          alert("It's a Draw!");
        }
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
        setIsMatched(false);
      }
      if (data.type === 'error') {
        alert(data.message);
      }
    };

    return () => {
      wsRef.current.close();
    };
  }, [winner]);

  function handleCellClick(index) {
    if (!winner && !board[index] && role === currentPlayer) { // Check if it's player's turn
      wsRef.current.send(JSON.stringify({
        type: 'game_event',
        event: 'move',
        position: index, // Changed from 'index' to 'position'
        player_id: role, // Send player's role as player_id
      }));
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    wsRef.current.send(JSON.stringify({
      type: 'game_event',
      event: 'reset_game',
    }));
  }

  return (
    <div>
      <h1>TicTacToe</h1>
      {!isMatched && <div>Waiting for opponent...</div>} {/* Display waiting message */}
      {isMatched && (
        <>
          <div>Your Role: {role}</div>
          {winner && winner !== "Draw" && (
            <div>
              {winner} Wins!
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          {winner === "Draw" && (
            <div>
              It's a Draw!
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)' }}>
            {board.map((cell, idx) => (
              <div key={idx} onClick={() => handleCellClick(idx)}
                   style={{ border: '1px solid black', width: 50, height: 50, textAlign: 'center' }}>
                {cell}
              </div>
            ))}
          </div>
          {role !== currentPlayer && !winner && <div>Waiting for opponent's move...</div>}
        </>
      )}
    </div>
  );
}
