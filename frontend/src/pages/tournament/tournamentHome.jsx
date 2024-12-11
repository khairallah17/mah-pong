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
                const response = await fetch("/api/tournaments");
                const data = await response.json();
                setTournaments(data);
                console.log(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchTournaments();
    }, [tournaments]);
    return (
        // choose 2d or 3d then choose create or join with code

        // create with code
        <div>
            <input placeholder="Tournament code"
                value={tournamentCode}
                onChange={(e) => setTournamentCode(e.target.value)}>
            </input>
            <button onClick={() => navigate(`/tournament?code=${tournamentCode}`)}>Join</button>
            <button onClick={() => navigate("/tournament")}>Create</button>
            <h1>Tournament Home</h1>
            <ul>
                {tournaments.map((tournament) => (
                    <li key={tournament.code}>{tournament.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default TournamentHome;