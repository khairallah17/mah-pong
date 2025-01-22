import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TournamentCard = ({ title, description, accentColor, buttonColor, image, path }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <div
      className={`
        relative p-6 rounded-xl border-2 ${accentColor}
        bg-gradient-to-br from-sky-900 to-sky-800
        flex flex-col items-center
        transition-all duration-300 ease-in-out
        transform ${isHovered ? 'scale-105' : ''}
        hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]
        cursor-pointer
        max-w-sm mx-auto w-full
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        absolute -top-5 left-1/2 transform -translate-x-1/2
        w-12 h-12 rounded-full ${buttonColor}
        flex items-center justify-center
        border-4 border-sky-800
        shadow-lg
      `}>
        <Trophy className="w-6 h-6 text-white" />
      </div>
      <div className="w-full aspect-video mb-6 rounded-lg overflow-hidden shadow-md">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
        />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3 text-center uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-sky-300 text-center mb-6 text-sm leading-relaxed">
        {description}
      </p>
      <button
        className={`
          ${buttonColor} text-white px-8 py-3 rounded-full
          transition-all duration-300
          hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-800
          uppercase font-bold tracking-wide text-sm
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
        `}
      >
        {t('PLAY NOW')}
      </button>
    </div>
  );
};

const tournamentPage = () => {
  const { t } = useTranslation();

  const tournamentCards = [
    {
      title: t('Online Tournament'),
      description: t('Compete in classic Online tournament brackets.'),
      accentColor: "border-yellow-500",
      buttonColor: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      image: "/play-Tournaments.jpg",
      path: "/dashboard/tournament"
    },
    {
      title: t('Local Tournament'),
      description: t('Join elite Local tournament competitions.'),
      accentColor: "border-orange-500",
      buttonColor: "bg-gradient-to-r from-orange-600 to-orange-400",
      image: "/play-Tournaments.jpg",
      path: "/dashboard/tournament/local"
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="m-4 sm:m-8 p-20 rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-900 shadow-2xl border-4 border-indigo-900">
        <h2 className="text-4xl font-bold text-white mb-12 text-center uppercase tracking-wide">
          {t('Tournaments')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {tournamentCards.map((card, index) => (
            <TournamentCard key={index} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default tournamentPage;