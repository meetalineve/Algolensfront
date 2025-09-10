// NQueenPage.js
import React, { useState, useEffect, useRef } from 'react';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';
import NQueenVisualizer from './NQueenVisualizer';

const NQueenPage = () => {
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(5);
  const [progress, setProgress] = useState(0);
  const [solutions, setSolutions] = useState([]);
  const [boardSize, setBoardSize] = useState(4);
  
  // Reference to NQueenVisualizer component
  const visualizerRef = useRef(null);
  
  // Code content/explanation for the "Code" tab
  const codeContent = (
    <div>
      <h3>N-Queens Algorithm</h3>
      <p>The N-Queens problem is about placing N chess queens on an N×N board so that no two queens threaten each other.</p>
      <pre>{`// Backtracking algorithm
function solveNQueens(board, row, n) {
  if (row === n) {
    // Found a solution
    return true;
  }
  
  for (let col = 0; col < n; col++) {
    if (isValid(board, row, col, n)) {
      // Place queen
      board[row][col] = 1;
      
      // Move to next row
      if (solveNQueens(board, row + 1, n)) {
        return true;
      }
      
      // Backtrack if needed
      board[row][col] = 0;
    }
  }
  
  return false;
}`}</pre>
    </div>
  );
  
  // How to use instructions
  const howToUseContent = (
    <div>
      <h3>How to use the visualizer:</h3>
      <ol>
        <li>Enter a board size (N) between 1 and 8</li>
        <li>Click "Run Algorithm" to start</li>
        <li>Use the play/pause button to control visualization</li>
        <li>Adjust speed with the speed control</li>
        <li>Use navigation controls to step through the algorithm</li>
        <li>Click "Skip to End" to see all solutions immediately</li>
      </ol>
      <p>The visualizer will show the backtracking process and highlight all valid solutions.</p>
    </div>
  );
  
  // Track solutions
  const handleSolutionFound = (solution) => {
    setSolutions(prev => [...prev, solution]);
  };
  
  // Solution display
  const solutionsContent = (
    <div>
      <h3>Solutions Found</h3>
      <p>The N-Queens problem has multiple solutions for N ≥ 4.</p>
      {solutions.length > 0 ? (
        <div className="array-solutions">
          <table className="solutions-table">
            <thead>
              <tr>
                <th>Solution #</th>
                <th>Queen Positions</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((solution, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>[{solution.join(', ')}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No solutions found yet. Run the algorithm to find solutions.</p>
      )}
    </div>
  );
  
  // Handle play/pause toggle
  const handlePlayPauseToggle = () => {
    setIsPaused(prev => !prev);
  };
  
  // Handle speed change
  const handleSpeedChange = () => {
    // Cycle through speeds: 2 -> 5 -> 8 -> 10 -> 2
    const speeds = [2, 5, 8, 10];
    const currentIndex = speeds.findIndex(s => s >= speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };
  
  // Progress control handlers
  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
    if (visualizerRef.current) {
      visualizerRef.current.updateProgress(newProgress);
    }
  };
  
  // Navigate controls
  const handleNextStep = () => {
    const newProgress = Math.min(progress + 10, 100);
    setProgress(newProgress);
    if (visualizerRef.current) {
      visualizerRef.current.updateProgress(newProgress);
    }
  };
  
  const handlePrevStep = () => {
    const newProgress = Math.max(progress - 10, 0);
    setProgress(newProgress);
    if (visualizerRef.current) {
      visualizerRef.current.updateProgress(newProgress);
    }
  };
  
  const handleReplay = () => {
    setProgress(0);
    setSolutions([]);
    if (visualizerRef.current) {
      visualizerRef.current.resetVisualization();
    }
  };
  
  const handleJumpToStart = () => {
    setProgress(0);
    if (visualizerRef.current) {
      visualizerRef.current.updateProgress(0);
    }
  };
  
  const handleJumpToEnd = () => {
    setProgress(100);
    if (visualizerRef.current) {
      visualizerRef.current.updateProgress(100);
    }
  };
  
  // Run algorithm handler - calls startAlgorithm in NQueenVisualizer
  const handleRunAlgorithm = () => {
    if (visualizerRef.current && visualizerRef.current.startAlgorithm) {
      // Reset solutions
      setSolutions([]);
      
      // Set isPaused to false to start playing immediately
      setIsPaused(false);
      
      // Call startAlgorithm method in the NQueenVisualizer component
      visualizerRef.current.startAlgorithm();
    }
  };
  
  // Skip to end handler
  const handleSkipToEnd = () => {
    if (visualizerRef.current && visualizerRef.current.skipToEnd) {
      visualizerRef.current.skipToEnd();
    }
  };
  
  // Handle board size change
  const handleBoardSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 1 && size <= 8) {
      setBoardSize(size);
    }
  };
  
  // Update progress from visualizer (if needed)
  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
  };
  
  // Reset solutions when unmounting
  useEffect(() => {
    return () => {
      setSolutions([]);
    };
  }, []);
  
  return (
    <AlgorithmLayout
      title="N-Queens Problem Visualizer"
      solutionsContent={solutionsContent}
      visualizationContent={
        <NQueenVisualizer 
          ref={visualizerRef}
          speed={speed}
          playing={!isPaused}
          onSolutionFound={handleSolutionFound}
          boardSize={boardSize}
        />
      }
      howToUseContent={howToUseContent}
      codeContent={codeContent}
      controlsConfig={{
        onPlay: () => setIsPaused(false),
        onPause: () => setIsPaused(true),
        skipToStart: handleJumpToStart,
        skipToEnd: handleJumpToEnd,
        skipNext: handleNextStep,
        skipPrev: handlePrevStep,
        onReplay: handleReplay,
        onSpeedChange: () => handleSpeedChange(),
        onProgressChange: handleProgressChange,
        isPlaying: !isPaused,
        progress: progress,
        speed: speed
      }}
      inputsContent={
        <div>
          {/* Only keep board size input and run buttons in the orange container */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            height: '100%'
          }}>
            <label style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
              Board Size (N):
              <input 
                type="number" 
                min="1" 
                max="8" 
                value={boardSize} 
                onChange={handleBoardSizeChange} 
                style={{ 
                  width: '80px', 
                  height: '35px', 
                  fontSize: '1.1rem', 
                  marginLeft: '0.5rem',
                  textAlign: 'center',
                  padding: '0.5rem'
                }}
              />
            </label>
            <button 
              onClick={handleRunAlgorithm}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#4CAF50',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '1.1rem'
              }}
            >
              Run Algorithm
            </button>
            <button 
              onClick={handleSkipToEnd}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#FF9800',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '1.1rem'
              }}
            >
              Skip to End
            </button>
          </div>
        </div>
      }
    />
  );
};

export default NQueenPage;