import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './AlgorithmLayout.css';

const AlgorithmLayout = ({ 
  title = "Algorithm Visualization",
  solutionsContent = null, 
  visualizationContent = null, 
  howToUseContent = null, 
  codeContent = null,
  controlsConfig = {},
  inputsContent = null 
}) => {
  const [showCode, setShowCode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1); // Start with 1x
  const [speedLabel, setSpeedLabel] = useState('1x');
  const speeds = ['0.5x', '1x', '1.5x', '2x'];
  
  const progressBarRef = useRef(null);
  
  // Default values to prevent undefined errors
  const {
    onPlay = () => {},
    onPause = () => {},
    skipToStart = () => {},
    skipToEnd = () => {},
    skipNext = () => {},
    skipPrev = () => {},
    onReplay = () => {},
    onSpeedChange = () => {},
    onProgressChange = () => {},
    speed = null,
    isPlaying: propIsPlaying = null,
    progress: propProgress = null
  } = controlsConfig;
  
  // Sync local state with props when provided
  useEffect(() => {
    if (propIsPlaying !== null) {
      setIsPlaying(propIsPlaying);
    }
  }, [propIsPlaying]);
  
  useEffect(() => {
    if (propProgress !== null) {
      setProgress(propProgress);
    }
  }, [propProgress]);
  
  useEffect(() => {
    if (speed !== null) {
      // Map speed value to index for display
      if (speed <= 2) {
        setSpeedIndex(0);
        setSpeedLabel('0.5x');
      } else if (speed <= 5) {
        setSpeedIndex(1);
        setSpeedLabel('1x');
      } else if (speed <= 8) {
        setSpeedIndex(2);
        setSpeedLabel('1.5x');
      } else {
        setSpeedIndex(3);
        setSpeedLabel('2x');
      }
    }
  }, [speed]);
  
  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (newState) {
      onPlay();
    } else {
      onPause();
    }
  };
  
  const handleSpeedChange = () => {
    const nextIndex = (speedIndex + 1) % speeds.length;
    setSpeedIndex(nextIndex);
    setSpeedLabel(speeds[nextIndex]);
    
    // Convert label to actual speed value for callback
    let speedValue;
    switch(speeds[nextIndex]) {
      case '0.5x': speedValue = 0.5; break;
      case '1x': speedValue = 1; break;
      case '1.5x': speedValue = 1.5; break;
      case '2x': speedValue = 2; break;
      default: speedValue = 1;
    }
    
    onSpeedChange(speeds[nextIndex], speedValue);
  };

  const updateProgressBar = (value) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${value}%`;
    }
    setProgress(value);
    onProgressChange(value);
  };
  
  const handleStart = () => {
    updateProgressBar(0);
    skipToStart();
  };
  
  const handleEnd = () => {
    updateProgressBar(100);
    skipToEnd();
  };
  
  const handleNext = () => {
    const newProgress = Math.min(progress + 10, 100);
    updateProgressBar(newProgress);
    skipNext();
  };
  
  const handlePrev = () => {
    const newProgress = Math.max(progress - 10, 0);
    updateProgressBar(newProgress);
    skipPrev();
  };
  
  const handleReplay = () => {
    updateProgressBar(0);
    setIsPlaying(true);
    onReplay();
  };
  
  // Update progress bar when progress changes
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [progress]);
  
  return (
    <div className="algorithm-layout-container">
      {/* Navbar from LandingPage - kept original */}
      <nav id="navbar">
        <div id="left-logo">
          <Link to="/" id="logo">
            <span className="logo-white">Algo</span><span className="logo-blue">Lens</span><small>.NET</small>
          </Link>
        </div>
  
        {/* Updated algorithms dropdown menu with only available algorithms */}
        <div className="algo-dropdown-container">
          <button className="algo-dropdown-btn">ALGORITHMS</button>
          <div className="algo-dropdown-content">
            <Link to="/">Home</Link>
            <Link to="/algorithms/nqueens">N-Queens Problem</Link>
            <Link to="/algorithms/bubble">Bubble Sort</Link>
            <Link to="/algorithms/selection">Selection Sort</Link>
            <Link to="/algorithms/binary">Binary Search</Link>
            <Link to="/algorithms/knapsack">Knapsack</Link>
            <Link to="/dijkstra">Dijkstra Algorithm</Link>
          </div>
        </div>
      </nav>

      <div className="algorithm-layout">
        {/* Title Bar */}
        <div className="algorithm-title">
          <h1>{title}</h1>
        </div>
        
        <div className="algorithm-body">
          {/* Solutions Panel */}
          <div className="algorithm-solutions">
            <h2>SOLUTIONS</h2>
            <div className="solutions-content">
              {solutionsContent || <p>No solution information available</p>}
            </div>
          </div>
          
          <div className="algorithm-main">
            {/* Visualization Area */}
            <div className="algorithm-visualization">
              {visualizationContent || <p>Visualization not available</p>}
            </div>
            
            {/* Controls Bar - Black and white theme */}
            <div className="algorithm-controls">
              <div className="algo-controls">
                <div className="controls-left">
                  {/* Replay button (far left) */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handleReplay}
                    id="replay-button"
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    replay
                  </span>
                </div>
                
                <div className="controls-center" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Jump to start */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handleStart}
                    id="start-button"
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    first_page
                  </span>
                  
                  {/* Previous step */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handlePrev}
                    id="prev-button"
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    navigate_before
                  </span>
                  
                  {/* Play/Pause */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handlePlayPause}
                    id="play-pause-button"
                    data-state={isPlaying ? 'playing' : 'paused'}
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                  
                  {/* Next step */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handleNext}
                    id="next-button"
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    navigate_next
                  </span>
                  
                  {/* Jump to end */}
                  <span 
                    className="material-symbols-outlined control-icon" 
                    onClick={handleEnd}
                    id="end-button"
                    style={{ fontSize: '1.5rem', color: 'black', cursor: 'pointer' }}
                  >
                    last_page
                  </span>
                  
                  {/* Progress bar */}
                  <div className="progress-container" style={{ 
                    flexGrow: 1, 
                    height: '4px', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    borderRadius: '2px', 
                    position: 'relative', 
                    maxWidth: '250px' 
                  }}>
                    <div 
                      className="progress-bar" 
                      ref={progressBarRef}
                      id="progress" 
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: 'black',
                        borderRadius: '2px',
                        position: 'relative'
                      }}
                    >
                      <div className="progress-handle" style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: 'black',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '50%',
                        right: '-6px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer'
                      }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="controls-right">
                  {/* Speed control */}
                  <div className="speed-control" onClick={handleSpeedChange} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: 'black'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>speed</span>
                    <span className="speed-value" style={{ marginLeft: '4px', fontSize: '1.1rem' }}>
                      {speedLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inputs Area */}
            <div className="algorithm-inputs">
              {inputsContent || <p>No input controls available</p>}
            </div>
          </div>
          
          {/* How To Use / Code Panel */}
          <div className="algorithm-how-to-use">
            <h2>HOW TO USE</h2>
            <div className="toggle-container">
              <button 
                className={!showCode ? "active" : ""}
                onClick={() => setShowCode(false)}
              >
                How To Use
              </button>
              <button 
                className={showCode ? "active" : ""}
                onClick={() => setShowCode(true)}
              >
                Code
              </button>
            </div>
            <div className="content-container">
              {showCode 
                ? (codeContent || <p>No code examples available</p>) 
                : (howToUseContent || <p>No usage instructions available</p>)
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmLayout;