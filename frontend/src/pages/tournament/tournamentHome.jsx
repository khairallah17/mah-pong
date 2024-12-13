import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TournamentHome = () => {
    const navigate = useNavigate();
    const [tournamentCode, setTournamentCode] = useState("");
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/tournaments");
                const data = await response.json();
                setTournaments(data);
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTournaments();
    }, []);
    return (
        <div className="p-6 max-w-4xl mx-auto bg-[#1a1464]">
            <div className="mb-4">
                <input
                    className="p-2 border border-gray-300 rounded mr-2"
                    placeholder="Tournament code"
                    value={tournamentCode}
                    onChange={(e) => setTournamentCode(e.target.value)}
                />
                <button
                    className="p-2 bg-blue-500 text-white rounded mr-2"
                    onClick={() => navigate(`/tournament?code=${tournamentCode}`)}
                >
                    Join
                </button>
                <button
                    className="p-2 bg-green-500 text-white rounded"
                    onClick={() => navigate("/tournament")}
                >
                    Create
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-4">Tournament Home</h1>
            <ul className="space-y-4">
                {tournaments.map((tournament) => (
                    <li key={tournament.id} className="border border-gray-300 rounded shadow p-4">
                        <button
                            className="w-full text-left"
                            onClick={() => navigate(`/tournament?code=${tournament.code}`)}
                        >
                            <div className="flex flex-col">
                                <p><strong>Date:</strong> {tournament.created_at}</p>
                                <p><strong>Code:</strong> {tournament.code}</p>
                                <p><strong>Status:</strong> {tournament.status}</p>
                                <p><strong>Players:</strong> {tournament.players.length}</p>
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TournamentHome;