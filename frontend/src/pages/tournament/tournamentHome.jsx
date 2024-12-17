import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TournamentHome = () => {
    const navigate = useNavigate();
    const [tournamentCode, setTournamentCode] = useState("");
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/tournaments");
                const data = await response.json();
                setTournaments(data);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        }

        fetchTournaments();

        const interval = setInterval(fetchTournaments, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center animate-fade-in-down">
                    Tournament Home
                </h1>
                <div className="mb-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm animate-fade-in">
                    <input
                        className="w-full p-3 border border-blue-300 rounded mb-4 bg-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                        placeholder="Tournament code"
                        value={tournamentCode}
                        onChange={(e) => setTournamentCode(e.target.value)}
                    />
                    <div className="flex space-x-4">
                        <button
                            className="flex-1 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 transform hover:scale-105"
                            onClick={() => navigate(`/tournament?code=${tournamentCode}`)}
                        >
                            Join
                        </button>
                        <button
                            className="flex-1 p-3 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 transform hover:scale-105"
                            onClick={() => navigate("/tournament")}
                        >
                            Create
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="mt-2">Loading tournaments...</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {tournaments.map((tournament, index) => (
                            <li 
                                key={tournament.id} 
                                className="border border-blue-300 rounded-lg shadow-lg p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition duration-300 transform hover:scale-102 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <button
                                    className="w-full text-left"
                                    onClick={() => navigate(`/tournament?code=${tournament.code}`)}
                                >
                                    <div className="flex flex-col">
                                        <p className="text-lg font-semibold mb-2">{tournament.name || 'Unnamed Tournament'}</p>
                                        <p><span className="font-medium">Date:</span> {new Date(tournament.created_at).toLocaleDateString()}</p>
                                        <p><span className="font-medium">Code:</span> {tournament.code}</p>
                                        <p><span className="font-medium">Status:</span> {tournament.status}</p>
                                        <p><span className="font-medium">Players:</span> {tournament.players.length}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TournamentHome;

