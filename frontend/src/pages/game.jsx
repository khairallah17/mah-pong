// Games.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebarContext } from '../hooks/useSidebar';
import { Gamepad2, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import '../i18n';
import { useTranslation } from 'react-i18next';

const GameCard = ({ title, description, accentColor, buttonColor, image, icon: Icon, path }) => {
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
        <Icon className="w-6 h-6 text-white" />
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

const GameSlide = ({ title, cards }) => (
  <div className="min-w-full px-4">
    <h3 className="text-3xl font-bold text-white mb-8 text-center">
      {title}
    </h3>
    <div className={`grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-12 max-w-6xl mx-auto ${cards.length === 1 ? 'justify-center' : ''}`}>
      {cards.map((card, index) => (
        <GameCard key={index} {...card} />
      ))}
    </div>
  </div>
);

const Games = () => {
  const { t } = useTranslation();
  const { setActiveLink } = useSidebarContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  
  useEffect(() => {
    setActiveLink("game");
    
    // Set initial slide based on navigation state
    if (location.state?.initialSlide !== undefined) {
      setCurrentSlide(location.state.initialSlide);
    }
  }, [location.state?.initialSlide, setActiveLink]);

  const slides = [
    {
      title: t('2D Games'),
      cards: [
        {
          title: t('PvE Classic'),
          description: t('Challenge AI opponents in classic 2D pong gameplay.'),
          accentColor: "border-green-500",
          buttonColor: "bg-gradient-to-r from-green-600 to-green-400",
          image: "/play-bot.jpg",
          icon: Gamepad2,
          path: "/dashboard/game/pve2d"
        },
        {
          title: "PvP 2D",
          description: t('Challenge other players in classic 2D matches.'),
          accentColor: "border-blue-500",
          buttonColor: "bg-gradient-to-r from-blue-600 to-blue-400",
          image: "/play-1vs1.jpg",
          icon: Users,
          path: "/dashboard/game/pvp2d"
        }
      ]
    },
    {
      title: t('Other Games'),
      cards: [
        {
          title: "PvE 3D",
          description: t('Experience next-gen 3D gameplay against AI.'),
          accentColor: "border-purple-500",
          buttonColor: "bg-gradient-to-r from-purple-600 to-purple-400",
          image: "/play-bot.jpg",
          icon: Gamepad2,
          path: "/dashboard/game/pve3d"
        },
        {
          title: "TicTacToe",
          description: t('Play the classic TicTacToe game against other players.'),
          accentColor: "border-indigo-500",
          buttonColor: "bg-gradient-to-r from-indigo-600 to-indigo-400",
          image: "/play-1vs1.jpg",
          icon: Users,
          path: "/dashboard/game/tictactoe"
        }
      ]
    },
    {
      title: t('Local Multiplayer'),
      cards: [
        {
          title: t("Local 2D"),
          description: t('Play with friends in local 2D multiplayer matches.'),
          accentColor: "border-blue-500",
          buttonColor: "bg-gradient-to-r from-blue-600 to-blue-400",
          image: "/play-1vs1.jpg",
          icon: Users,
          path: "/dashboard/game/local2d"
        }
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="m-4 sm:m-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-900 shadow-2xl border-4 border-indigo-900">
        <h2 className="text-4xl font-bold text-white mb-12 text-center uppercase tracking-wide">
          {t('Select Your Battleground')}
        </h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <GameSlide key={index} {...slide} />
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex justify-center mt-8 gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-6 h-3 rounded-full transition-colors duration-300 ${
                currentSlide === index ? 'bg-white scale-125' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;