<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function Cell({ value, onClick, className }) {
  return (
    <div onClick={onClick} className={`${className} text-black`}> {/* Added text-black to set text color */}
      {value}
    </div>
  );
}

export default function Tictactoe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [role, setRole] = useState(null);
  const [isMatched, setIsMatched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Add a new state variable for processing popup
  const wsRef = useRef(null);

  useEffect(() => {
    const tokenData = JSON.parse(localStorage.getItem('authtoken'));
    const accessToken = tokenData && tokenData.access;
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/tictactoe/?token=${accessToken}`);
    wsRef.current.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === 'match_found') {
        setRole(data.role);
        setIsMatched(true);
      }
      if (data.type === 'game_state') {
        setBoard(data.game_state.board);
        setCurrentPlayer(data.game_state.currentPlayer);
        setWinner(data.game_state.winner);
      }
      if (data.type === 'game_end') {
        setIsProcessing(false);
        handleGameEnd(data.game_state.winner);
      }
      if (data.type === 'processing') {
        setIsProcessing(true);
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
    if (!winner && !board[index] && role === currentPlayer) {
      wsRef.current.send(JSON.stringify({
        type: 'game_event',
        event: 'move',
        position: index,
        player_id: role,
      }));
    }
  }

  function handleGameEnd(winner) {
    if (winner && winner !== "Draw") {
      setPopupMessage(`${winner} Wins!`);
    } else if (winner === "Draw") {
      setPopupMessage("It's a Draw!");
    }
    setShowPopup(true);
  }

  function handlePlayAgain() {
    navigate(0);
  }

  function handleQuit() {
    navigate('/dashboard');
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">TicTacToe</h1>
      {!isMatched && <div className="text-lg">Waiting for opponent...</div>} {/* Display waiting message */}
      {isMatched && (
        <>
          <div className="mb-2">Your Role: {role}</div>
          {winner && winner !== "Draw" && (
            <div className="mb-2 text-black">
              {winner} Wins!
              <button onClick={resetGame} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                Play Again
              </button>
            </div>
          )}
          {winner === "Draw" && (
            <div className="mb-2 text-black">
              It's a Draw!
              <button onClick={resetGame} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                Play Again
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {board.map((cell, idx) => (
              <Cell
                key={idx}
                value={cell}
                onClick={() => handleCellClick(idx)}
                className="w-20 h-20 flex justify-center items-center bg-gray-200 border-2 border-gray-800 text-2xl cursor-pointer transition-colors duration-300 hover:bg-gray-300 sm:w-16 sm:h-16 sm:text-xl"
              />
            ))}
          </div>
          {role !== currentPlayer && !winner && <div className="mt-4 text-lg">Waiting for opponent's move...</div>}
        </>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4 text-black text-center">{popupMessage}</h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handlePlayAgain}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Play Again
              </button>
              <button
                onClick={handleQuit}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl text-black text-center">Processing game results</h2>
          </div>
        </div>
      )}
    </div>
  );
}
=======
import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

function Cell({ value, onClick, className }) {
  return (
    <div onClick={onClick} className={`${className} text-black`}> {/* Added text-black to set text color */}
      {value}
    </div>
  );
}

export default function Tictactoe() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [role, setRole] = useState(null);
  const [isMatched, setIsMatched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Add a new state variable for processing popup
  const wsRef = useRef(null);

  useEffect(() => {
    const tokenData = JSON.parse(localStorage.getItem('authtoken'));
    const accessToken = tokenData && tokenData.access;
    wsRef.current = new WebSocket(`ws://localhost/api/game/ws/tictactoe/?token=${accessToken}`);
    wsRef.current.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === 'match_found') {
        setRole(data.role);
        setIsMatched(true);
      }
      if (data.type === 'game_state') {
        setBoard(data.game_state.board);
        setCurrentPlayer(data.game_state.currentPlayer);
        setWinner(data.game_state.winner);
      }
      if (data.type === 'game_end') {
        setIsProcessing(false);
        handleGameEnd(data.game_state.winner);
      }
      if (data.type === 'processing') {
        setIsProcessing(true);
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
    if (!winner && !board[index] && role === currentPlayer) {
      wsRef.current.send(JSON.stringify({
        type: 'game_event',
        event: 'move',
        position: index,
        player_id: role,
      }));
    }
  }

  function handleGameEnd(winner) {
    if (winner && winner !== "Draw") {
      setPopupMessage(`${winner} Wins!`);
    } else if (winner === "Draw") {
      setPopupMessage("It's a Draw!");
    }
    setShowPopup(true);
  }

  function handlePlayAgain() {
    navigate(0);
  }

  function handleQuit() {
    navigate('/dashboard');
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">TicTacToe</h1>
      {!isMatched && <div className="text-lg">Waiting for opponent...</div>} {/* Display waiting message */}
      {isMatched && (
        <>
          <div className="mb-2">Your Role: {role}</div>
          {winner && winner !== "Draw" && (
            <div className="mb-2 text-black">
              {winner} Wins!
              <button onClick={resetGame} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                Play Again
              </button>
            </div>
          )}
          {winner === "Draw" && (
            <div className="mb-2 text-black">
              It's a Draw!
              <button onClick={resetGame} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                Play Again
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {board.map((cell, idx) => (
              <Cell
                key={idx}
                value={cell}
                onClick={() => handleCellClick(idx)}
                className="w-20 h-20 flex justify-center items-center bg-gray-200 border-2 border-gray-800 text-2xl cursor-pointer transition-colors duration-300 hover:bg-gray-300 sm:w-16 sm:h-16 sm:text-xl"
              />
            ))}
          </div>
          {role !== currentPlayer && !winner && <div className="mt-4 text-lg">Waiting for opponent's move...</div>}
        </>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4 text-black text-center">{popupMessage}</h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handlePlayAgain}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Play Again
              </button>
              <button
                onClick={handleQuit}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl text-black text-center">Processing game results</h2>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> master
