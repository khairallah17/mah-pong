import React , { useState } from "react";
import { useNavigate } from "react-router-dom";

const TournamentHome = () => {
    const navigate = useNavigate();
    const [tournamentCode, setTournamentCode] = useState("");

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
        </div>
    );
    }

export default TournamentHome;