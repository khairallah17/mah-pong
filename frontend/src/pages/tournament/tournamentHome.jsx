import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "../../hooks/useSidebar";
import '../../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from "../../hooks/useAuthContext";

const TournamentHome = () => {
    const { t } = useTranslation();
    const { setActiveLink } = useSidebarContext()
    const { user } = useAuthContext()

    const navigate = useNavigate();
    const [tournamentCode, setTournamentCode] = useState("");
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTournament, setCurrentTournament] = useState(null);

    useEffect(() => {
    
        setActiveLink("tournament");
    
        const fetchTournaments = async () => {
            try {
                const response = await fetch("/api/game/api/tournaments");
                const data = await response.json();
                setCurrentTournament(data.filter(tournament => tournament.players.includes(user.username) && tournament.status !== 'completed'));
                const waitingTournaments = data.filter(tournament => tournament.status === 'waiting');
                setTournaments(waitingTournaments);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        }

        fetchTournaments();

        const interval = setInterval(fetchTournaments, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex">
            <div className="p-8 w-full">
                <h1 className="text-4xl font-bold mb-8 animate-fade-in-down zen-dots ">
                    {t('Tournament Home')}
                </h1>
                <div className="mb-8 bg-black/50 rounded-xl border border-gray-800 overflow-hidden backdrop-blur-sm p-6 animate-fade-in w-[250px]">
                    <div className="flex space-x-4">
                        <button
                            className="flex-1 p-3 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 transform hover:scale-105"
                            onClick={() => navigate("/dashboard/tournament/live?code=" + tournamentCode)}
                        >
                            {currentTournament && currentTournament.length > 0 ? t('Join back ongoing Tournament') : t('Create')}
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="mt-2">{t('Loading tournaments...')}</p>
                    </div>
                ) : (
                    <ul className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols w-full gap-4">
                        {tournaments.map((tournament, index) => (
                            <li 
                                key={tournament.id} 
                                className="border border-blue-300 rounded-lg shadow-lg p-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition duration-300 transform hover:scale-102 animate-fade-in-up w-full"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <button
                                    className="w-full text-left"
                                    onClick={() => navigate(`/dashboard/tournament/live?code=${tournament.code}`)}
                                >
                                    <div className="flex flex-col">
                                        <p className="text-lg font-semibold mb-2">{tournament.name || t(`Tournament ${index}`)}</p>
                                        <p><span className="font-medium">{t('Date:')}</span> {new Date(tournament.created_at).toLocaleDateString()}</p>
                                        <p><span className="font-medium">Code:</span> {tournament.code}</p>
                                        <p><span className="font-medium">Status:</span> {tournament.status}</p>
                                        <p><span className="font-medium">{t('Players:')}</span> {tournament.players.length}</p>
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

