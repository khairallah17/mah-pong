import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './App.css';
import aub from './assets/aub.jpeg';
import khr from "./assets/khr.jpg";
import hdl from './assets/headline.png';
import agm from './assets/agm.jpg';
import zou from './assets/Zou.jpg';
import hmz from './assets/hasalam.jpg';
import { Navigation, Pagination } from 'swiper/modules';


const HomePage = ({ onUsernameSubmit }) => {
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const headlineRef = useRef(null);
  const teamRef = useRef(null);
  const contactUsRef = useRef(null);
  const aboutRef = useRef(null);
  const mount = useRef(null);
  const totalFrames = 180; // Total number of frames in the animation
  const [currentFrame, setCurrentFrame] = useState(1);
  const frameRequestRef = useRef(null); // Ref to store the animation frame request ID

  useEffect(() => {
    const handleScroll = () => {
      if (!frameRequestRef.current) {
        frameRequestRef.current = requestAnimationFrame(updateAnimationFrame);
      }
    };

    const updateAnimationFrame = () => {
      if (!mount.current) return;

      const scene = mount.current;
      const sceneTop = scene.offsetTop;
      const sceneHeight = scene.offsetHeight;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const scrollProgress = Math.min(
        Math.max((scrollY - sceneTop) / (sceneHeight - viewportHeight), 0),
        1
      );

      const frame = Math.round(scrollProgress * (totalFrames - 1)) + 1;
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
  }, []);

  const getFrameSource = (frame) => `/landingAnimation/${frame}.png`;
  
  const calculateSlidesPerView = () => {
    const width = window.innerWidth;
  
    if (width <= 500)
      return 1;
    else if (width <= 750)
      return 2;
    else if (width <= 900)
      return 3;
    else 
      return 4;
  };

  const scrollToRef = (ref) => {
    console.log(document.body.scrollHeight);
    window.scrollTo({
      top: ref.current.offsetTop - window.innerHeight / 2,
      behavior: 'smooth'
    });
  }
  
  const handleSubmit = () => {
    onUsernameSubmit(username);
    setIsSubmitted(true);
  };

  return (
    <div className="homepage">
      <header>
        <nav className='navbar'>
          <img className='logo' src='Logo' alt='Logo'/>
          <button onClick={() => {scrollToRef(aboutRef)}}>About</button>
          <button onClick={() => {scrollToRef(teamRef)}}>Team</button>
          <button onClick={() => {scrollToRef(contactUsRef)}}>Contact Us</button>
          <button onClick={() => navigate('/dashboard')}>Play now</button>
        </nav>
      </header>
      <div className='scene' ref={mount}>
        <img src={getFrameSource(currentFrame)} alt={`Frame ${currentFrame}`}/>
      </div>
      <div className='headline' ref={headlineRef}>
        <div style={{paddingRight: "20%"}}>
          <h1>“Title - Headline”</h1>
          <p>“This section is about the game, what is it, what is the goal, and how to play it.”</p>
          <button onClick={() => navigate('/dashboard')}>Play now</button>
        </div>
        <img src={hdl} alt='Game'/>
      </div>
      <div className='team-container' ref={teamRef}>
      <h1 style={{position: 'absolute', top: "3vh", margin: "0"}}>Meet the team</h1>
      <Swiper spaceBetween={15}
      slidesPerView={calculateSlidesPerView()}
      pagination={{
        clickable: true,
      }}
      navigation={true}
      modules={[Pagination, Navigation]}
      loop={true}
      style={{height: "40vh", width: "100%"}}>
      <div className='fadein'></div>
        <SwiperSlide style={{paddingTop: "6vh"}}>
        <div className="team-member" >
          <img src={aub} alt='pfp' style={{zIndex: "100"}} />
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        </SwiperSlide>
        <SwiperSlide style={{paddingTop: "6vh"}}>
        <div className="team-member">
          <img src={khr} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        </SwiperSlide>
        <SwiperSlide style={{paddingTop: "6vh"}}>
        <div className="team-member">
          <img src={hmz} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        </SwiperSlide>
        <SwiperSlide style={{paddingTop: "6vh"}}>
        <div className="team-member">
          <img src={zou} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        </SwiperSlide>
        <SwiperSlide style={{paddingTop: "6vh"}}>
        <div className="team-member">
          <img src={agm} alt='pfp'/>
          <h2>Name</h2>
          <p>position @ School</p>
          <p>“This section is about the team member, what he knows, and the part on which he worked on.”</p>
        </div>
        </SwiperSlide>
        <div className='fadeout'></div>
      </Swiper>
      </div>

      <div className='space'>
      </div>
    </div>
  );
};

export default HomePage;