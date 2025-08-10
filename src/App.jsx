import React, { useState, useEffect, useRef } from 'react';
import "./App.css";
import lisaAvatar from "./assets/lisa-ai.png";

function App() {
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activePulse, setActivePulse] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [splashes, setSplashes] = useState([]);
  const [rotationValues, setRotationValues] = useState({ x: 0, y: 0, z: 0 });
  const [energyField, setEnergyField] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    power: 98,
    sync: 100,
    signal: 85
  });

  const avatarRef = useRef(null);
  const mainContainerRef = useRef(null);
  const cursorDotRef = useRef(null);
  const speakButtonRef = useRef(null);
  const hologramContainerRef = useRef(null);
  
  useEffect(() => {
    // Transitions between screens
    const timer1 = setTimeout(() => setLoading(false), 1800);
    const timer2 = setTimeout(() => setInitialized(true), 2300);
    const timer3 = setTimeout(() => setActivePulse(true), 2800);
    
    // Mouse move effect for hologram
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Touch events for mobile
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Device orientation for mobile devices
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    // Power-up animation
    if (initialized) {
      const powerUpLines = document.querySelectorAll('.power-line');
      powerUpLines.forEach((line, index) => {
        setTimeout(() => {
          line.classList.add('active');
        }, index * 200);
      });
      
      // Create 3D elements
      generateFloatingElements();
      
      // Update system metrics periodically
      const metricsInterval = setInterval(updateSystemMetrics, 5000);
      return () => clearInterval(metricsInterval);
    }
    
    // Create initial particles
    for (let i = 0; i < 15; i++) {
      createRandomParticle();
    }
    
    // Cleanup
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [initialized]);
  
  const updateSystemMetrics = () => {
    setSystemMetrics({
      power: 90 + Math.floor(Math.random() * 10),
      sync: 95 + Math.floor(Math.random() * 6),
      signal: 80 + Math.floor(Math.random() * 20)
    });
  };
  
  const generateFloatingElements = () => {
    if (!mainContainerRef.current) return;
    
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-elements';
    
    // Create cube
    const cube = document.createElement('div');
    cube.className = 'floating-element element-1';
    cube.innerHTML = `
      <div class="cube">
        <div class="cube-face face-front"><div class="face-design"></div></div>
        <div class="cube-face face-back"><div class="face-design"></div></div>
        <div class="cube-face face-top"><div class="face-design"></div></div>
        <div class="cube-face face-bottom"><div class="face-design"></div></div>
        <div class="cube-face face-left"><div class="face-design"></div></div>
        <div class="cube-face face-right"><div class="face-design"></div></div>
      </div>
    `;
    
    // Create pyramid
    const pyramid = document.createElement('div');
    pyramid.className = 'floating-element element-2';
    pyramid.innerHTML = `
      <div class="pyramid">
        <div class="pyramid-face pyramid-face-1"></div>
        <div class="pyramid-face pyramid-face-2"></div>
        <div class="pyramid-face pyramid-face-3"></div>
        <div class="pyramid-face pyramid-face-4"></div>
      </div>
    `;
    
    // Create ring
    const ring = document.createElement('div');
    ring.className = 'floating-element element-3';
    ring.innerHTML = `
      <div class="ring">
        <div class="ring-circle"></div>
        <div class="ring-inner"></div>
      </div>
    `;
    
    floatingContainer.appendChild(cube);
    floatingContainer.appendChild(pyramid);
    floatingContainer.appendChild(ring);
    
    mainContainerRef.current.appendChild(floatingContainer);
  };
  
  const handleMouseMove = (e) => {
    if (!avatarRef.current || !hologramContainerRef.current) return;
    
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Update cursor position
    setCursorPos({ x: clientX, y: clientY });
    
    // Calculate rotation based on mouse position
    const rotateX = (clientY / innerHeight - 0.5) * 20;
    const rotateY = (clientX / innerWidth - 0.5) * 20;
    const rotateZ = (clientX / innerWidth - 0.5) * 5;
    
    setRotationValues({ x: rotateX, y: rotateY, z: rotateZ });
    
    // Apply 3D transform to hologram
    avatarRef.current.style.transform = `
      perspective(1200px) 
      rotateX(${-rotateX}deg) 
      rotateY(${rotateY}deg)
      rotateZ(${rotateZ * 0.3}deg)
    `;
    
    // Apply parallax effect to hologram container
    hologramContainerRef.current.style.transform = `
      scale(1.02)
      translate(${rotateY * 0.15}px, ${-rotateX * 0.15}px)
    `;
    
    // Create particle occasionally
    if (!loading && Math.random() > 0.97) {
      createParticle(clientX, clientY);
    }
    
    // Handle magnetic button effect
    handleButtonMagneticEffect(e);
    
    // Handle symbol interaction
    handleSymbolInteraction(e);
    
    // Update floating elements
    updateFloatingElements(rotateX, rotateY);
  };
  
  const updateFloatingElements = (rotateX, rotateY) => {
    const elements = document.querySelectorAll('.floating-element');
    elements.forEach((element, index) => {
      const depthFactor = index + 1;
      element.style.transform = `translateX(${rotateY * depthFactor * 0.4}px) translateY(${-rotateX * depthFactor * 0.4}px)`;
    });
  };
  
  const handleTouchMove = (e) => {
    if (!avatarRef.current || !e.touches[0] || !hologramContainerRef.current) return;
    
    const touch = e.touches[0];
    const { clientX, clientY } = touch;
    const { innerWidth, innerHeight } = window;
    
    // Update cursor position
    setCursorPos({ x: clientX, y: clientY });
    
    // Calculate rotation based on touch position
    const rotateX = (clientY / innerHeight - 0.5) * 20;
    const rotateY = (clientX / innerWidth - 0.5) * 20;
    const rotateZ = (clientX / innerWidth - 0.5) * 5;
    
    setRotationValues({ x: rotateX, y: rotateY, z: rotateZ });
    
    // Apply 3D transform to hologram
    avatarRef.current.style.transform = `
      perspective(1200px) 
      rotateX(${-rotateX}deg) 
      rotateY(${rotateY}deg)
      rotateZ(${rotateZ * 0.3}deg)
    `;
    
    // Apply parallax effect to hologram container
    hologramContainerRef.current.style.transform = `
      scale(1.02)
      translate(${rotateY * 0.15}px, ${-rotateX * 0.15}px)
    `;
    
    // Create particle occasionally
    if (!loading && Math.random() > 0.97) {
      createParticle(clientX, clientY);
    }
    
    // Handle symbol interaction for touch
    if (e.touches[0]) {
      handleSymbolInteraction(e.touches[0]);
    }
    
    // Update floating elements
    updateFloatingElements(rotateX, rotateY);
  };
  
  const handleDeviceOrientation = (e) => {
    if (!avatarRef.current || !hologramContainerRef.current) return;
    
    // For mobile device gyroscope
    const tiltX = e.beta ? (e.beta - 45) / 3 : 0;
    const tiltY = e.gamma ? e.gamma / 3 : 0;
    const tiltZ = e.alpha ? e.alpha / 30 : 0;
    
    setRotationValues({ x: tiltX, y: tiltY, z: tiltZ });
    
    avatarRef.current.style.transform = `
      perspective(1200px) 
      rotateX(${-tiltX}deg) 
      rotateY(${tiltY}deg)
      rotateZ(${tiltZ}deg)
    `;
    
    // Apply parallax effect to hologram container
    hologramContainerRef.current.style.transform = `
      scale(1.02)
      translate(${tiltY * 0.15}px, ${-tiltX * 0.15}px)
    `;
    
    // Update floating elements
    updateFloatingElements(tiltX, tiltY);
  };
  
  const handleButtonMagneticEffect = (e) => {
    if (!speakButtonRef.current) return;
    
    const button = speakButtonRef.current;
    const buttonRect = button.getBoundingClientRect();
    
    // Calculate distance from mouse to button center
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    
    const maxDistance = 100; // pixels
    const distanceX = e.clientX - buttonCenterX;
    const distanceY = e.clientY - buttonCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < maxDistance) {
      // Calculate movement strength based on distance (closer = stronger)
      const strength = (maxDistance - distance) / maxDistance;
      const moveX = distanceX * strength * 0.4; // Increased intensity
      const moveY = distanceY * strength * 0.4;
      
      setButtonPosition({ x: moveX, y: moveY });
      
      // Add subtle glow effect on hover
      button.style.boxShadow = `0 0 ${20 + strength * 15}px rgba(0, 255, 221, ${0.3 + strength * 0.4})`;
    } else {
      // Reset position when mouse is far away
      setButtonPosition({ x: 0, y: 0 });
      button.style.boxShadow = '0 0 20px rgba(0, 255, 221, 0.3)';
    }
  };
  
  const handleSymbolInteraction = (e) => {
    if (!initialized) return;
    
    const { clientX, clientY } = e;
    const symbols = document.querySelectorAll('.symbol');
    
    symbols.forEach(symbol => {
      const rect = symbol.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = clientX - centerX;
      const distanceY = clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      if (distance < 150) {
        const angle = Math.atan2(distanceY, distanceX);
        const repelX = Math.cos(angle) * (150 - distance) * 0.08; // Increased repel effect
        const repelY = Math.sin(angle) * (150 - distance) * 0.08;
        const zElevation = (150 - distance) * 0.5; // Z-axis elevation based on proximity
        
        symbol.style.transform = `translate3d(${-repelX}px, ${-repelY}px, ${zElevation}px) scale(${1 + (150 - distance) * 0.003})`;
        symbol.style.filter = `drop-shadow(0 0 ${8 + (150 - distance) * 0.08}px rgba(0, 255, 221, 0.7))`;
      } else {
        symbol.style.transform = '';
        symbol.style.filter = '';
      }
    });
  };
  
  const handleMouseDown = () => {
    setIsPointerActive(true);
    createParticleBurst(cursorPos.x, cursorPos.y, 10);
  };
  
  const handleMouseUp = () => setIsPointerActive(false);
  const handleTouchStart = () => {
    setIsPointerActive(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  const handleTouchEnd = () => setIsPointerActive(false);
  
  const createRandomParticle = () => {
    if (!mainContainerRef.current) return;
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    createParticle(x, y);
  };
  
  const createParticle = (x, y) => {
    if (!mainContainerRef.current) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
    particle.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
    particle.style.setProperty('--duration', `${10 + Math.random() * 15}s`);
    particle.style.setProperty('--opacity', `${0.3 + Math.random() * 0.4}`);
    particle.style.setProperty('--z', `${Math.random() * 50}px`);
    
    mainContainerRef.current.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle && particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 15000);
  };
  
  const createParticleBurst = (x, y, count = 20) => {
    if (!mainContainerRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const burst = document.createElement('div');
      burst.className = 'particle';
      burst.style.left = `${x}px`;
      burst.style.top = `${y}px`;
      
      // More dynamic and rapid movement for burst particles
      burst.style.setProperty('--tx', `${Math.random() * 300 - 150}px`);
      burst.style.setProperty('--ty', `${Math.random() * 300 - 150}px`);
      burst.style.setProperty('--duration', `${2 + Math.random() * 3}s`); // Faster
      burst.style.setProperty('--opacity', `${0.5 + Math.random() * 0.5}`); // More visible
      burst.style.setProperty('--z', `${Math.random() * 100}px`); // More 3D movement
      
      mainContainerRef.current.appendChild(burst);
      
      // Remove burst particle after animation
      setTimeout(() => {
        if (burst && burst.parentNode) {
          burst.parentNode.removeChild(burst);
        }
      }, 3000);
    }
  };
  
  const createSplash = (x, y) => {
    const id = Date.now();
    setSplashes(prev => [...prev, { id, x, y }]);
    
    // Remove splash after animation completes
    setTimeout(() => {
      setSplashes(prev => prev.filter(splash => splash.id !== id));
    }, 1000);
  };
  
  const toggleSpeaking = (e) => {
    setSpeaking(!speaking);
    setEnergyField(!speaking); // Toggle energy field with speaking state
    
    // Create splash at click position
    if (e && e.clientX) {
      createSplash(e.clientX, e.clientY);
      createParticleBurst(e.clientX, e.clientY, 30); // Create more particles on button click
      
      // Create ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'button-ripple';
      
      if (speakButtonRef.current) {
        const buttonRect = speakButtonRef.current.getBoundingClientRect();
        const offsetX = e.clientX - buttonRect.left;
        const offsetY = e.clientY - buttonRect.top;
        
        ripple.style.left = `${offsetX}px`;
        ripple.style.top = `${offsetY}px`;
        
        speakButtonRef.current.appendChild(ripple);
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 1000);
      }
    } else {
      // If no position (e.g., called programmatically), use button center
      if (speakButtonRef.current) {
        const rect = speakButtonRef.current.getBoundingClientRect();
        createSplash(rect.left + rect.width/2, rect.top + rect.height/2);
        createParticleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 30);
      }
    }
  };

  // Update cursor dot position
  useEffect(() => {
    if (cursorDotRef.current) {
      cursorDotRef.current.style.left = `${cursorPos.x}px`;
      cursorDotRef.current.style.top = `${cursorPos.y}px`;
    }
  }, [cursorPos]);

    return (
    <div className="main-container" ref={mainContainerRef}>
      {/* Interactive cursor dot */}
      <div 
        ref={cursorDotRef}
        className={`interactive-dot ${isPointerActive ? 'active' : ''}`}
      ></div>
      
      {/* Splash effect container */}
      <div className="splash-effect">
        {splashes.map(splash => (
          <div 
            key={splash.id}
            className="splash"
            style={{ left: splash.x + 'px', top: splash.y + 'px' }}
          ></div>
        ))}
      </div>
    
      {loading ? (
        <div className="init-screen">
          <div className="init-circles">
            <div className="init-circle"></div>
            <div className="init-circle"></div>
            <div className="init-circle"></div>
          </div>
          
          <div className="init-content">
            <div className="init-icon"></div>
            <div className="init-text">INITIALIZING LISA</div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`app-interface ${initialized ? 'active' : ''}`}>
          <div className="power-lines">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="power-line" style={{ '--index': i }}></div>
            ))}
          </div>
          
          <div className="space-background">
            <div className="stars"></div>
            <div className="nebula"></div>
          </div>
          
          <div className="perspective-grid">
            <div className="grid x-grid"></div>
            <div className="grid perspective-grid"></div>
          </div>
          
          <div className="code-rain">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="code-column"
                style={{
                  '--delay': `${Math.random() * 5}s`,
                  '--speed': `${10 + Math.random() * 20}s`,
                  '--left': `${Math.random() * 100}%`,
                  '--width': `${1 + Math.random() * 2}px`,
                  '--z': `${Math.random() * 100 - 50}px`,
                }}
              >
                {[...Array(Math.floor(5 + Math.random() * 10))].map((_, j) => (
                  <div 
                    key={j}
                    className="code-bit"
                    style={{
                      '--delay': `${Math.random() * 2}s`,
                      '--speed': `${0.5 + Math.random() * 1}s`,
                    }}
                  >
                    {Math.random() > 0.7 ? (Math.random() > 0.5 ? '1' : '0') : Math.random() > 0.5 ? 'A' : 'X'}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="interface-grid">
            <div className="grid x-grid"></div>
          </div>
          
          <div className="hud-elements">
            <div className="hud-corner hud-corner-tl"></div>
            <div className="hud-corner hud-corner-tr"></div>
            <div className="hud-corner hud-corner-bl"></div>
            <div className="hud-corner hud-corner-br"></div>
            <div className="hud-scanline"></div>
          </div>
          
          <div className="top-bar">
            <div className="system-status">
              <div className={`status-indicator ${activePulse ? 'active' : ''}`}></div>
              <span>ACTIVE</span>
            </div>
            
            <div className="system-metrics">
              <div className="metric">
                <div className="metric-label">POWER</div>
                <div className="metric-value">{systemMetrics.power}%</div>
              </div>
              
              <div className="metric">
                <div className="metric-label">SYNC</div>
                <div className="metric-value">{systemMetrics.sync}%</div>
              </div>
              
              <div className="metric">
                <div className="metric-label">SIGNAL</div>
                <div className="metric-value">{systemMetrics.signal}%</div>
              </div>
            </div>
          </div>
          
          <div className="central-display">
            <div className="hologram-container" ref={hologramContainerRef}>
              <div className="hologram-base">
                <div className="base-glow"></div>
                <div className="base-ring"></div>
                <div className="base-ring"></div>
                <div className="base-ring"></div>
              </div>
              
              <div className="data-stream">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="data-bit"
                    style={{
                      '--delay': `${Math.random() * 5}s`,
                      '--duration': `${5 + Math.random() * 10}s`,
                      '--size': `${1 + Math.random() * 2}px`,
                      '--left': `${Math.random() * 100}%`,
                    }}
                  ></div>
                ))}
              </div>
              
              <div className="avatar-frame" ref={avatarRef}>
                <img src={lisaAvatar} alt="LISA AI" className="avatar-image" />
                <div className="avatar-depth-effect"></div>
                <div className="hologram-effects">
                  <div className="scan-line"></div>
                  <div className="horizontal-scan"></div>
                  <div className="glitch-effect"></div>
                </div>
                
                <div className={`voice-wave ${speaking ? 'active' : ''}`}>
                  <div className="wave-circle"></div>
                  <div className="wave-circle"></div>
                  <div className="wave-circle"></div>
                  <div className="wave-circle"></div>
                </div>
              </div>
              
              <div className={`holo-beam ${speaking ? 'active' : ''}`}>
                <div className="beam-core"></div>
                <div className="beam-glow"></div>
                <div className="beam-particles">
                  {[...Array(15)].map((_, i) => (
                    <div 
                      key={i} 
                      className="beam-particle"
                      style={{
                        '--delay': `${Math.random() * 2}s`,
                        '--size': `${2 + Math.random() * 3}px`,
                        '--offset': `${Math.random() * 20 - 10}px`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="orbiting-rings">
                <div className="orbit-ring ring-1"></div>
                <div className="orbit-ring ring-2"></div>
                <div className="orbit-ring ring-3"></div>
                <div className="orbit-dot"></div>
                <div className="orbit-satellite">
                  <div className="satellite-body"></div>
                  <div className="satellite-panel"></div>
                </div>
              </div>
              
              <div className={`energy-field ${energyField ? 'active' : ''}`}>
                <div className="energy-ring" style={{ width: '280px', height: '280px' }}></div>
                <div className="energy-ring" style={{ width: '310px', height: '310px' }}></div>
                <div className="energy-ring" style={{ width: '340px', height: '340px' }}></div>
                
                <div className="energy-particles">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="energy-particle"
                      style={{
                        '--delay': `${i * 0.5}s`,
                        '--size': `${2 + Math.random() * 2}px`,
                        '--radius': `${140 + Math.random() * 20}px`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lisa-identity">
              <h1>LISA AI</h1>
              <div className="lisa-subtext">Advanced Neural Intelligence</div>
            </div>
          </div>
          
          <div className="control-section">
            <button 
              className={`speak-button ${speaking ? 'active' : ''}`}
              onClick={toggleSpeaking}
              ref={speakButtonRef}
              style={{
                transform: `translate3d(${buttonPosition.x}px, ${buttonPosition.y}px, 0)`
              }}
            >
              <div className="button-bg"></div>
              <div className="button-3d-edge"></div>
              <div className="button-content">
                {speaking ? "LISTENING..." : "SPEAK TO LISA"}
                <div className="mic-icon"></div>
              </div>
              
              {speaking && (
                <div className="audio-visualizer">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="visualizer-bar"></div>
                  ))}
                </div>
              )}
            </button>
          </div>
          
          {/* Interactive particle burst */}
          {speaking && (
            <div className="particle-burst">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="burst-particle"
                  style={{
                    '--angle': `${i * 18}deg`,
                    '--delay': `${i * 0.05}s`,
                    '--size': `${3 + Math.random() * 3}px`,
                    '--rx': Math.random(),
                    '--ry': Math.random(),
                    '--rz': Math.random()
                  }}
                ></div>
              ))}
            </div>
          )}
          
          <div className="holo-symbols">
            <div className={`symbol symbol-1 ${initialized ? 'visible' : ''}`} style={{ '--z': '20px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <circle className="symbol-circuit" cx="20" cy="20" r="15" />
                  <g className="symbol-inner">
                    <circle cx="20" cy="20" r="5" fill="#00FFDD" />
                    <path d="M20 10L23 15H17L20 10Z" fill="#00FFDD" />
                    <path d="M20 30L23 25H17L20 30Z" fill="#00FFDD" />
                    <path d="M10 20L15 17V23L10 20Z" fill="#00FFDD" />
                    <path d="M30 20L25 17V23L30 20Z" fill="#00FFDD" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-2 ${initialized ? 'visible' : ''}`} style={{ '--z': '40px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <polygon className="symbol-circuit" points="20,5 35,20 20,35 5,20" />
                  <g className="symbol-inner">
                    <circle cx="20" cy="20" r="6" fill="#00FFDD" />
                    <circle cx="20" cy="20" r="2" fill="#030310" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-3 ${initialized ? 'visible' : ''}`} style={{ '--z': '30px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <rect className="symbol-circuit" x="8" y="8" width="24" height="24" rx="4" />
                  <g className="symbol-inner symbol-pulse">
                    <line x1="14" y1="20" x2="26" y2="20" stroke="#00FFDD" strokeWidth="2" />
                    <line x1="20" y1="14" x2="20" y2="26" stroke="#00FFDD" strokeWidth="2" />
                    <circle cx="20" cy="20" r="3" fill="#00FFDD" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-4 ${initialized ? 'visible' : ''}`} style={{ '--z': '50px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <path className="symbol-circuit" d="M10,20 C10,13 13,10 20,10 C27,10 30,13 30,20 C30,27 27,30 20,30 C13,30 10,27 10,20 Z" />
                  <g className="symbol-inner">
                    <path d="M15,15 L25,25 M15,25 L25,15" stroke="#00FFDD" strokeWidth="2" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-5 ${initialized ? 'visible' : ''}`} style={{ '--z': '20px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <path className="symbol-circuit" d="M5,20 L15,5 L35,15 L25,35 Z" />
                  <g className="symbol-inner">
                    <circle cx="20" cy="20" r="5" fill="#00FFDD" />
                    <circle cx="20" cy="20" r="2" fill="#030310" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-6 ${initialized ? 'visible' : ''}`} style={{ '--z': '35px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <circle className="symbol-circuit" cx="20" cy="20" r="15" />
                  <g className="symbol-inner">
                    <path d="M15,15 L25,25" stroke="#00FFDD" strokeWidth="2" />
                    <path d="M15,25 L25,15" stroke="#00FFDD" strokeWidth="2" />
                    <circle cx="20" cy="20" r="4" fill="none" stroke="#00FFDD" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>
            </div>
            
            <div className={`symbol symbol-7 ${initialized ? 'visible' : ''}`} style={{ '--z': '25px' }}>
              <div className="symbol-3d-layer">
                <svg viewBox="0 0 40 40">
                  <polygon className="symbol-circuit" points="20,5 30,15 25,30 15,30 10,15" />
                  <g className="symbol-inner">
                    <circle cx="20" cy="20" r="5" fill="#00FFDD" />
                    <polygon points="20,12 23,18 17,18" fill="#00FFDD" />
                  </g>
                </svg>
              </div>
            </div>
            
            {/* Connection lines and nodes */}
            <div
              className="connection-line"
              style={{
                top: '23%',
                left: '13%',
                width: '25%',
                transform: 'rotate(15deg)'
              }}
            ></div>
            
            <div
              className="connection-line"
              style={{
                top: '65%',
                right: '14%',
                width: '20%',
                transform: 'rotate(-20deg)'
              }}
            ></div>
            
            <div
              className="connection-line"
              style={{
                bottom: '23%',
                left: '17%',
                width: '25%',
                transform: 'rotate(-10deg)'
              }}
            ></div>
            
            <div
              className="connection-line"
              style={{
                top: '35%',
                right: '15%',
                width: '22%',
                transform: 'rotate(170deg)'
              }}
            ></div>
            
            <div
              className="connection-line"
              style={{
                top: '15%',
                left: '28%',
                width: '18%',
                transform: 'rotate(30deg)'
              }}
            ></div>
            
            <div
              className="connection-line"
              style={{
                bottom: '35%',
                right: '28%',
                width: '15%',
                transform: 'rotate(210deg)'
              }}
            ></div>
            
            {/* Node points */}
            <div className="node-point" style={{ top: '22%', left: '26%' }}></div>
            <div className="node-point" style={{ top: '63%', right: '28%' }}></div>
            <div className="node-point" style={{ bottom: '23%', left: '30%' }}></div>
            <div className="node-point" style={{ top: '38%', right: '29%' }}></div>
            <div className="node-point" style={{ top: '12%', left: '35%' }}></div>
            <div className="node-point" style={{ bottom: '32%', right: '35%' }}></div>
          </div>
          
          <div className="data-particles">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;