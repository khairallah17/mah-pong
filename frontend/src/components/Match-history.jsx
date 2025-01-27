import React, { useState, useEffect } from 'react';
import '../i18n';
import { useTranslation } from 'react-i18next';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { useAuthContext } from '../hooks/useAuthContext';

export const MatchHistory = () => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const matchesPerPage = 6;

  const { user } = useAuthContext()
  const { username } = user

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Fetch all matches first
        const response = await fetch(`http://localhost:8000/api/match-history/${username}/`);
        const allMatches = await response.json();
        
        // Calculate total pages based on all matches
        const total = Math.ceil(allMatches.length / matchesPerPage);
        setTotalPages(total);

        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * matchesPerPage;
        const endIndex = startIndex + matchesPerPage;
        
        // Slice the matches array for current page
        const paginatedMatches = allMatches.slice(startIndex, endIndex);
        setMatches(paginatedMatches);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [currentPage, username]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        // Loading skeletons
        [...Array(matchesPerPage)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded mt-2" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/10 rounded mt-2" />
            </div>
          </div>
        ))
      ) : (
        <>
          {matches.length > 0 ? (
            <>
              <div className="grid gap-3">
                {matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                        match.result === 'win' ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500'
                      } flex items-center justify-center`}>
                        <Activity size={20} />
                      </div>
                      <div>
                        <div className="font-medium">Match #{match.id}</div>
                        <div className="text-sm text-gray-400">{match.player} vs {match.opponent}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {match.score_player1} - {match.score_player2}
                      </div>
                      <div className="text-sm text-gray-400">{match.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Simple Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 border-t border-white/10 pt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === idx + 1
                            ? 'bg-white/20 text-white'
                            : 'hover:bg-white/10 text-gray-400'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">{t('No matches found')}</div>
          )}
        </>
      )}
    </div>
  );
};