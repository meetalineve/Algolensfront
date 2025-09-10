// NQueenVisualizer.js
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './NQueenVisualizer.css';

const NQueenVisualizer = forwardRef(({ speed, playing, onSolutionFound, boardSize }, ref) => {
  const [n, setN] = useState(boardSize || 4);
  const [boards, setBoards] = useState([]);
  const [boardsUUID, setBoardsUUID] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [boardPosition, setBoardPosition] = useState({});
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [speedLabel, setSpeedLabel] = useState('1x');
  
  // Correct solution count array
  const solutionsArray = [0, 1, 0, 0, 2, 10, 4, 40, 92];
  
  const speedRef = useRef(speed);
  const playingRef = useRef(playing);
  const boardRef = useRef(0); // Current board index
  const isRunningRef = useRef(isRunning);
  const boardsRef = useRef([]);
  const boardPositionRef = useRef({});
  const progressRef = useRef(0);
  
  // Update n when boardSize prop changes
  useEffect(() => {
    if (boardSize !== n) {
      setN(boardSize);
    }
  }, [boardSize]);
  
  // Update playing state when prop changes
  useEffect(() => {
    setIsPlaying(playing);
    playingRef.current = playing;
  }, [playing]);
  
  // Update speed state when prop changes
  useEffect(() => {
    setCurrentSpeed(speed);
    speedRef.current = speed;
    updateSpeedLabel(speed);
  }, [speed]);
  
  // Update refs when props change
  useEffect(() => {
    speedRef.current = currentSpeed;
    playingRef.current = isPlaying;
    isRunningRef.current = isRunning;
    boardsRef.current = boards;
    boardPositionRef.current = boardPosition;
    progressRef.current = progress;
  }, [currentSpeed, isPlaying, isRunning, boards, boardPosition, progress]);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    startAlgorithm: () => {
      if (!isRunningRef.current) {
        startAlgorithm();
      }
    },
    skipToEnd: () => {
      speedRef.current = 10; // Set max speed
      playingRef.current = true; // Make sure it's playing
      setIsPlaying(true);
      setCurrentSpeed(10);
      updateSpeedLabel(10);
    },
    updateProgress: (newProgress) => {
      setProgress(newProgress);
      progressRef.current = newProgress;
    },
    resetVisualization: () => {
      // Reset state
      setIsRunning(false);
      isRunningRef.current = false;
      
      // Reset progress
      setProgress(0);
      progressRef.current = 0;
      
      // Reset boards
      const { newBoards, newBoardsUUID, newBoardPosition } = initializeBoards();
      setBoardsUUID(newBoardsUUID);
      setBoards(newBoards);
      setBoardPosition(newBoardPosition);
      
      // Reset solutions
      setSolutions([]);
      setTotalSolutions(0);
    }
  }));

  // Update speed label based on speed value (1-10)
  const updateSpeedLabel = (speedValue) => {
    if (speedValue <= 2) setSpeedLabel('0.5x');
    else if (speedValue <= 5) setSpeedLabel('1x');
    else if (speedValue <= 8) setSpeedLabel('1.5x');
    else setSpeedLabel('2x');
  };

  // Delay function respecting the current speed setting
  const delay = () => new Promise(res => setTimeout(res, (10 - speedRef.current) * 50));
  
  // Wait if visualization is paused
  const waitIfPaused = async () => {
    if (!playingRef.current) {
      await new Promise(resolve => {
        const checkPlaying = () => {
          if (playingRef.current) {
            resolve();
          } else {
            setTimeout(checkPlaying, 100);
          }
        };
        checkPlaying();
      });
    }
  };
  
  const initializeBoards = () => {
    // Create just 1 working board + 0 solution boards to start
    const newBoardsUUID = [];
    const newBoards = [];
    const newBoardPosition = {};
  
    // Create unique ID for the working board
    const uuid = `board-0-${Math.random().toString(36).substr(2, 9)}`;
    newBoardsUUID.push(uuid);
    
    // Create empty board
    newBoards.push({
      id: uuid,
      cells: Array(n).fill().map(() => Array(n).fill("-"))
    });
    
    // Initialize position object
    newBoardPosition[0] = {};
    
    // Update state
    setBoardsUUID(newBoardsUUID);
    setBoards(newBoards);
    setBoardPosition(newBoardPosition);
    
    // Update refs directly for immediate access
    boardsRef.current = newBoards;
    boardPositionRef.current = newBoardPosition;
    boardRef.current = 0;
    
    return { newBoards, newBoardsUUID, newBoardPosition };
  };
  
  // Check if placing a queen at (row, col) is valid
  const isValid = async (board, r, col) => {
    await waitIfPaused();
    
    // Use ref for immediate access
    const currentBoards = boardsRef.current;
    
    // Ensure board exists
    if (!currentBoards[board]) return false;
    
    const updatedBoards = [...currentBoards];
    
    // Place queen temporarily
    updatedBoards[board].cells[r][col] = "♕";
    setBoards(updatedBoards);
    boardsRef.current = updatedBoards;
    await delay();
    
    // Check columns
    for (let i = r - 1; i >= 0; i--) {
      if (updatedBoards[board].cells[i][col] === "♕") {
        // Mark as error
        updatedBoards[board].cells[i][col] = { symbol: "♕", error: true };
        updatedBoards[board].cells[r][col] = "-"; // Remove queen
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        await delay();
        
        // Reset error marking
        updatedBoards[board].cells[i][col] = "♕";
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        return false;
      }
      
      // Mark as checking
      updatedBoards[board].cells[i][col] = { symbol: "-", checking: true };
      setBoards([...updatedBoards]);
      boardsRef.current = [...updatedBoards];
      await delay();
    }
    
    // Check upper-left diagonal
    for (let i = r - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (updatedBoards[board].cells[i][j] === "♕") {
        // Mark as error
        updatedBoards[board].cells[i][j] = { symbol: "♕", error: true };
        updatedBoards[board].cells[r][col] = "-"; // Remove queen
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        await delay();
        
        // Reset error marking
        updatedBoards[board].cells[i][j] = "♕";
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        return false;
      }
      
      // Mark as checking
      updatedBoards[board].cells[i][j] = { symbol: "-", checking: true };
      setBoards([...updatedBoards]);
      boardsRef.current = [...updatedBoards];
      await delay();
    }
    
    // Check upper-right diagonal
    for (let i = r - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (updatedBoards[board].cells[i][j] === "♕") {
        // Mark as error
        updatedBoards[board].cells[i][j] = { symbol: "♕", error: true };
        updatedBoards[board].cells[r][col] = "-"; // Remove queen
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        await delay();
        
        // Reset error marking
        updatedBoards[board].cells[i][j] = "♕";
        setBoards([...updatedBoards]);
        boardsRef.current = [...updatedBoards];
        return false;
      }
      
      // Mark as checking
      updatedBoards[board].cells[i][j] = { symbol: "-", checking: true };
      setBoards([...updatedBoards]);
      boardsRef.current = [...updatedBoards];
      await delay();
    }
    
    // Update progress based on current position
    const progressValue = Math.min(((r * n + col) / (n * n)) * 100, 99);
    setProgress(progressValue);
    progressRef.current = progressValue;
    
    return true;
  };
  
  // Clear coloring of cells to reset to checkerboard pattern
  const clearColor = async (board) => {
    if (!isRunningRef.current) return;
    
    const currentBoards = boardsRef.current;
    if (!currentBoards[board]) return;
    
    const updatedBoards = [...currentBoards];
    
    // Reset cell states but keep queens
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (typeof updatedBoards[board].cells[r][c] === 'object' && updatedBoards[board].cells[r][c].checking) {
          updatedBoards[board].cells[r][c] = "-";
        }
      }
    }
    
    setBoards([...updatedBoards]);
    boardsRef.current = [...updatedBoards];
    await delay();
  };
  
  // Main N-Queen solving algorithm
  const solveQueen = async (board, r) => {
    if (!isRunningRef.current) return;
    
    const currentBoards = boardsRef.current;
    if (!currentBoards[board]) return;
    
    const currentPosition = boardPositionRef.current;
    
    if (r === n) {
      // Found a solution
      // Create array-based solution
      const solution = [];
      for (let k = 0; k < n; k++) {
        if (currentPosition[board] && currentPosition[board][k] !== undefined) {
          solution.push(currentPosition[board][k]);
        }
      }
      
      // Create a new solution board
      const solutionBoardIndex = currentBoards.length;
      const solutionBoardUUID = `board-${solutionBoardIndex}-${Math.random().toString(36).substr(2, 9)}`;
      
      const updatedBoards = [...currentBoards];
      const updatedBoardsUUID = [...boardsUUID];
      const updatedPosition = {...currentPosition};
      
      // Create new solution board with queens placed
      updatedBoards.push({
        id: solutionBoardUUID,
        cells: Array(n).fill().map(() => Array(n).fill("-"))
      });
      
      updatedBoardsUUID.push(solutionBoardUUID);
      
      // Ensure the solution board position exists
      if (!updatedPosition[solutionBoardIndex]) updatedPosition[solutionBoardIndex] = {};
      
      // Place queens on solution board
      for (let k = 0; k < n; k++) {
        if (updatedPosition[board] && updatedPosition[board][k] !== undefined) {
          const col = updatedPosition[board][k];
          updatedBoards[solutionBoardIndex].cells[k][col] = "♕";
          updatedPosition[solutionBoardIndex][k] = col;
        }
      }
      
      // Update solutions state
      setSolutions(prev => [...prev, solution]);
      setTotalSolutions(prev => prev + 1);
      
      setBoards(updatedBoards);
      setBoardsUUID(updatedBoardsUUID);
      setBoardPosition(updatedPosition);
      boardsRef.current = updatedBoards;
      boardPositionRef.current = updatedPosition;
      
      if (onSolutionFound) {
        onSolutionFound(solution);
      }
      
      // Update progress when solution is found
      const solutionsFound = totalSolutions + 1;
      const targetSolutions = solutionsArray[n] || 1;
      const progressValue = Math.min((solutionsFound / targetSolutions) * 100, 100);
      setProgress(progressValue);
      progressRef.current = progressValue;
      
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (!isRunningRef.current) return;
      
      const currentBoards = boardsRef.current;
      if (!currentBoards[board]) return;
      
      await waitIfPaused();
      await clearColor(board);
      
      if (await isValid(board, r, col)) {
        await waitIfPaused();
        await clearColor(board);
        
        // Place queen
        const updatedBoards = [...boardsRef.current];
        const updatedPosition = {...boardPositionRef.current};
        
        // Ensure the board position object exists
        if (!updatedPosition[board]) updatedPosition[board] = {};
        
        updatedBoards[board].cells[r][col] = "♕";
        updatedPosition[board][r] = col;
        
        setBoards(updatedBoards);
        setBoardPosition(updatedPosition);
        boardsRef.current = updatedBoards;
        boardPositionRef.current = updatedPosition;
        
        // Move to next row
        await solveQueen(board, r + 1);
        
        // Backtrack
        if (!isRunningRef.current) return;
        
        const currentBoards = boardsRef.current;
        if (!currentBoards[board]) return;
        
        await waitIfPaused();
        
        const newBoards = [...boardsRef.current];
        const newPosition = {...boardPositionRef.current};
        
        // Remove queen
        if (newBoards[board] && newBoards[board].cells && newBoards[board].cells[r]) {
          newBoards[board].cells[r][col] = "-";
        }
        
        // Remove position
        if (newPosition[board]) {
          delete newPosition[board][r];
        }
        
        setBoards(newBoards);
        setBoardPosition(newPosition);
        boardsRef.current = newBoards;
        boardPositionRef.current = newPosition;
        
        await delay();
      }
    }
  };
  
  // Start the N-Queens algorithm
  const startAlgorithm = async () => {
    if (isRunningRef.current) return;
    
    setIsRunning(true);
    isRunningRef.current = true;
    setSolutions([]);
    setTotalSolutions(0);
    setProgress(0);
    progressRef.current = 0;
    
    console.log("Starting N-Queens algorithm with n =", n);
    
    // Initialize boards
    const { newBoards, newBoardPosition } = initializeBoards();
    
    console.log("Boards initialized:", newBoards.length);
    
    // Begin solving
    await delay();
    
    // Always use refs for direct access
    try {
      await solveQueen(0, 0);
      console.log("Algorithm completed successfully");
      // Set progress to 100% when complete
      setProgress(100);
      progressRef.current = 100;
    } catch (err) {
      console.error("Error during N-Queens algorithm:", err);
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };
  
  // Control handlers
  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    playingRef.current = newPlayingState;
  };
  
  const handleSpeedChange = () => {
    // Cycle through speeds: 2 (0.5x) -> 5 (1x) -> 8 (1.5x) -> 10 (2x) -> 2 (0.5x)
    const speeds = [2, 5, 8, 10];
    const currentIndex = speeds.findIndex(s => s >= currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    setCurrentSpeed(newSpeed);
    speedRef.current = newSpeed;
    updateSpeedLabel(newSpeed);
  };
  
  const handleNext = () => {
    // Implementation depends on algorithm specifics
    // For now, just increase progress by 10%
    const newProgress = Math.min(progress + 10, 100);
    setProgress(newProgress);
    progressRef.current = newProgress;
  };
  
  const handlePrev = () => {
    // Implementation depends on algorithm specifics
    // For now, just decrease progress by 10%
    const newProgress = Math.max(progress - 10, 0);
    setProgress(newProgress);
    progressRef.current = newProgress;
  };
  
  const handleReset = () => {
    if (isRunningRef.current) {
      // Stop current algorithm
      setIsRunning(false);
      isRunningRef.current = false;
    }
    
    // Reset state
    setProgress(0);
    progressRef.current = 0;
    setSolutions([]);
    setTotalSolutions(0);
    
    // Re-initialize boards
    initializeBoards();
  };
  
  const handleStart = () => {
    setProgress(0);
    progressRef.current = 0;
  };
  
  const handleEnd = () => {
    setProgress(100);
    progressRef.current = 100;
  };
  
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    progressRef.current = newProgress;
  };
  
  useEffect(() => {
    // Initialize empty boards when n changes
    if (!isRunningRef.current) {
      // Create just 1 working board
      const newBoards = [];
      const newBoardsUUID = [];
      const newBoardPosition = {};
      
      const uuid = `board-0-${Math.random().toString(36).substr(2, 9)}`;
      newBoardsUUID.push(uuid);
      
      newBoards.push({
        id: uuid,
        cells: Array(n).fill().map(() => Array(n).fill("-"))
      });
      
      // Initialize position object
      newBoardPosition[0] = {};
      
      setBoardsUUID(newBoardsUUID);
      setBoards(newBoards);
      setBoardPosition(newBoardPosition);
      
      // Set refs directly for immediate access
      boardsRef.current = newBoards;
      boardPositionRef.current = newBoardPosition;
      boardRef.current = 0;
    }
  }, [n]);
  
  return (
    <div className="nqueen-visualizer">
      <div className="solutions-info">
        <p>For an {n}×{n} board, there are {solutionsArray[n] || 0} possible solutions.</p>
        <p>Found so far: {totalSolutions}</p>
      </div>
      
      <div className="boards-container">
        {boards.length > 0 ? boards.map((board, index) => {
          // Ensure board exists and has cells
          if (!board || !board.cells) {
            return null;
          }
          
          // Determine board title - first is Working Board, others are Solutions
          const boardTitle = index === 0 ? "Working Board" : `Solution ${index}`;
          
          return (
            <div key={board.id} className="board-wrapper">
              <h4>{boardTitle}</h4>
              <table className="chess-board">
                <tbody>
                  {Array(n).fill().map((_, row) => (
                    <tr key={row}>
                      {Array(n).fill().map((_, col) => {
                        // Ensure board.cells and board.cells[row] exist
                        if (!board.cells || !board.cells[row]) {
                          return <td key={col} className="cell light">-</td>;
                        }
                        
                        const cell = board.cells[row][col];
                        const isAlternate = (row + col) % 2 === 1;
                        
                        let className = isAlternate ? 'cell dark' : 'cell light';
                        let content = "-";
                        
                        if (typeof cell === 'object') {
                          if (cell.checking) className += ' checking';
                          if (cell.error) className += ' error';
                          content = cell.symbol;
                        } else if (cell === "♕") {
                          content = "♕";
                          className += ' queen';
                        }
                        
                        return (
                          <td key={col} className={className}>
                            {content === "♕" ? <span className="queen-symbol">♕</span> : content}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {index > 0 && (
                <div className="solution-array">
                  [{
                    Array(n).fill().map((_, i) => {
                      if (boardPosition[index] && boardPosition[index][i] !== undefined) {
                        return boardPosition[index][i];
                      }
                      return "";
                    }).filter(val => val !== "").join(', ')
                  }]
                </div>
              )}
            </div>
          );
        }) : <p>No boards to display</p>}
      </div>
    </div>
  );
});

export default NQueenVisualizer;