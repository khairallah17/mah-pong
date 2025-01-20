import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import './App.css';
import './i18n';
import { useTranslation } from 'react-i18next';
import ButtonLng from "./components/ButtonLng";

import aub from './assets/aub.jpeg';
import khr from './assets/khr.jpg';
import hdl from './assets/headline.png';
import agm from './assets/agm.jpg';
import zou from './assets/Zou.jpg';
import hmz from './assets/hasalam.jpg';

const totalFrames = 130;

const NAV_LINKS = [
  { label: 'About', refKey: 'aboutRef' },
  { label: 'Team', refKey: 'teamRef' },
  { label: 'Contact Us', refKey: 'contactUsRef' },
];

const TEAM_MEMBERS = [
  { name: 'Ayoub Lemsafi', position: 'Position @ School', image: aub, description: 'Worked on feature X' },
  { name: 'Mohammed Khairallah', position: 'Position @ School', image: khr, description: 'Focused on Y' },
  { name: 'Hamza', position: 'Position @ School', image: hmz, description: 'Specialized in Z' },
  { name: 'Zouhair', position: 'Position @ School', image: zou, description: 'Handled task A' },
  { name: 'Elmehdi Agoumi', position: 'Position @ School', image: agm, description: 'Oversaw task B' },
];

const HomePage = () => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [slides, setSlides] = useState(3);
  const frameRequestRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const slideWidth = 250;
      const containerWidth = window.innerWidth * 0.75;
      let newSlides = Math.max(2, Math.round(containerWidth / slideWidth));
      newSlides = Math.min(newSlides, TEAM_MEMBERS.length - 1);
      console.log(slides, containerWidth / slideWidth);

      setSlides(newSlides);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slides]);
  const navigate = useNavigate();

  // Refs for scrolling
  const headlineRef = useRef(null);
  const teamRef = useRef(null);
  const contactUsRef = useRef(null);
  const aboutRef = useRef(null);
  const mountRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!frameRequestRef.current) {
        frameRequestRef.current = requestAnimationFrame(updateAnimationFrame);
      }
    };

    const updateAnimationFrame = () => {
      const scene = mountRef.current;
      if (!scene) return;

      const { offsetTop, offsetHeight } = scene;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const progress = Math.min(
        Math.max((scrollY - offsetTop) / (offsetHeight - viewportHeight), 0),
        1
      );

      const frame = Math.round(progress * (totalFrames - 1)) + 1;
      if (frame !== currentFrame) {
        setCurrentFrame(frame);
      }
      frameRequestRef.current = null;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [currentFrame]);

  const scrollToSection = (ref) => {
    if (ref?.current) {
      window.scrollTo({
        top: ref.current.offsetTop - window.innerHeight / 2,
        behavior: 'smooth',
      });
    }
  };

  const getFrameSource = (frame) => `/landingAnimation/${frame}.png`;
  const { t } = useTranslation();

  return (
    <div className="homepage">
      {/* Navbar */}
      <header>
        <nav className="fixed top-0 left-0 flex items-center justify-between w-full h-16 bg-gradient-to-r from-[#0908304A] to-[#1A195B4A] backdrop-blur-md z-50">
          <img className="h-12 mx-8" src="Logo" alt="Logo" />
          <div className="flex gap-4 mx-8">
            {NAV_LINKS.map(({ label, refKey }) => (
              <button
                key={label}
                className="px-4 py-2 text-white bg-transparent hover:underline"
                onClick={() => scrollToSection({ aboutRef, teamRef, contactUsRef }[refKey])}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-white bg-blue-500 rounded-md"
            >
              Play now
            </button>
            <ButtonLng />
          </div>
        </nav>
      </header>

      {/* Scene */}
      <div className="scene" ref={mountRef}>
        <img src={getFrameSource(currentFrame)} alt={`Frame ${currentFrame}`} />
      </div>

      {/* Headline */}
      <div className="headline" ref={headlineRef}>
        <div className="headline-content" >
          <h1>“Title - Headline”</h1>
          <p style={{margin: "20px"}}>{t("This section is about the game, what it is, what the goal is, and how to play it.")}</p>
          <button style={{margin: "10px"}} onClick={() => navigate('/dashboard')}>Play now</button>
        </div>
        <img src={hdl} alt="Game" />
      </div>

      {/* Team Section */}
      <div className="team-container" ref={teamRef}>
        <h1 className="team-title">Meet the Team</h1>
        <Swiper
          spaceBetween={15}
          slidesPerView={slides}
          pagination={{ clickable: true }}
          navigation
          modules={[Pagination, Navigation]}
          style={{ height: '40vh', width: '100%' }}
        >
          <div className="fadein"></div>
          {TEAM_MEMBERS.map(({ name, position, image, description }, index) => (
            <SwiperSlide key={index} style={{ paddingTop: '6vh' }}>
              <div className="team-member">
                <img src={image} alt={`${name}`} />
                <h2>{name}</h2>
                <p>{position}</p>
                <p>{description}</p>
              </div>
            </SwiperSlide>
          ))}
          <div className="fadeout"></div>
        </Swiper>
      </div>

      <div className="space"></div>
    </div>
  );
};

export default HomePage;
