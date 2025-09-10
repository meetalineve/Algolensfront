import React, { useState, useEffect, useRef } from 'react';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';
import './BubbleSort.css';

const BubbleSort = () => {
  // State for the array and algorithm execution
  const [array, setArray] = useState([29, 10, 14, 37, 13]);
  const [initialArray, setInitialArray] = useState([29, 10, 14, 37, 13]);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [sortingComplete, setSortingComplete] = useState(false);
  const [arrayInput, setArrayInput] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Store all steps for playback
  const stepsRef = useRef([]);
  const totalStepsRef = useRef(0);
  const animationRef = useRef(null);
  
  // Initialize or reset the algorithm
  const initializeAlgorithm = (newArray = array) => {
    const initialStep = {
      array: [...newArray],
      i: 0,
      j: 0,
      compare: [],
      swap: false,
      message: "Starting Bubble Sort"
    };
    
    stepsRef.current = [initialStep];
    setSteps([initialStep]);
    setCurrentStep(0);
    setI(0);
    setJ(0);
    setProgress(0);
    setSortingComplete(false);
    
    // Generate all steps in advance
    generateAllSteps(newArray);
  };
  
  // Generate all steps for the bubble sort algorithm
  const generateAllSteps = (arr) => {
    const steps = [];
    const arrCopy = [...arr];
    const n = arrCopy.length;
    
    steps.push({
      array: [...arrCopy],
      i: 0,
      j: 0,
      compare: [],
      swap: false,
      message: "Starting Bubble Sort"
    });
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Step for comparison
        steps.push({
          array: [...arrCopy],
          i,
          j,
          compare: [j, j + 1],
          swap: false,
          message: `Comparing ${arrCopy[j]} and ${arrCopy[j + 1]}`
        });
        
        // If swap needed
        if (arrCopy[j] > arrCopy[j + 1]) {
          // Swap elements
          [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
          
          // Step for swap
          steps.push({
            array: [...arrCopy],
            i,
            j,
            compare: [j, j + 1],
            swap: true,
            message: `Swapped ${arrCopy[j]} and ${arrCopy[j + 1]}`
          });
        }
      }
      
      // Step for end of pass
      steps.push({
        array: [...arrCopy],
        i: i + 1,
        j: 0,
        compare: [],
        swap: false,
        message: `Completed pass ${i + 1}. Element ${arrCopy[n - i - 1]} is now in its correct position.`
      });
    }
    
    // Final sorted step
    steps.push({
      array: [...arrCopy],
      i: n - 1,
      j: 0,
      compare: [],
      swap: false,
      message: "Sorting complete!",
      complete: true
    });
    
    stepsRef.current = steps;
    totalStepsRef.current = steps.length;
    return steps;
  };
  
  // Handle play/pause
  const handlePlayPause = () => {
    setIsRunning(prev => !prev);
  };
  
  // Handle array input change
  const handleArrayInputChange = (e) => {
    setArrayInput(e.target.value);
  };
  
  // Set a new array
  const handleSetArray = () => {
    if (!arrayInput.trim()) return;
    
    try {
      const newArray = arrayInput.split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num));
      
      if (newArray.length < 2) {
        alert("Please enter at least 2 valid numbers");
        return;
      }
      
      setArray(newArray);
      setInitialArray([...newArray]);
      initializeAlgorithm(newArray);
    } catch (error) {
      alert("Invalid input. Please enter comma-separated numbers.");
    }
  };
  
  // Reset the visualization
  const handleReset = () => {
    setIsRunning(false);
    setArray([...initialArray]);
    initializeAlgorithm(initialArray);
  };
  
  // Handle speed change
  const handleSpeedChange = (speedLabel, speedValue) => {
    setSpeed(speedValue);
  };
  
  // Handle progress change
  const handleProgressChange = (newProgress) => {
    if (stepsRef.current.length === 0) return;
    
    const stepIndex = Math.floor((newProgress / 100) * (stepsRef.current.length - 1));
    applyStep(stepIndex);
  };
  
  // Apply a specific step
  const applyStep = (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= stepsRef.current.length) return;
    
    const step = stepsRef.current[stepIndex];
    setArray([...step.array]);
    setI(step.i);
    setJ(step.j);
    setCurrentStep(stepIndex);
    setProgress((stepIndex / (stepsRef.current.length - 1)) * 100);
    
    if (step.complete) {
      setSortingComplete(true);
      setIsRunning(false);
    } else {
      setSortingComplete(false);
    }
  };
  
  // Skip to previous step
  const handlePrev = () => {
    const newStep = Math.max(0, currentStep - 1);
    applyStep(newStep);
  };
  
  // Skip to next step
  const handleNext = () => {
    const newStep = Math.min(stepsRef.current.length - 1, currentStep + 1);
    applyStep(newStep);
  };
  
  // Skip to start
  const handleStart = () => {
    applyStep(0);
  };
  
  // Skip to end
  const handleEnd = () => {
    applyStep(stepsRef.current.length - 1);
  };
  
  // Run animation based on current state
  useEffect(() => {
    if (isRunning && !sortingComplete) {
      const runStep = () => {
        const nextStep = currentStep + 1;
        if (nextStep < stepsRef.current.length) {
          applyStep(nextStep);
        } else {
          setIsRunning(false);
        }
      };
      
      // Calculate delay based on speed
      let delay;
      switch (speed) {
        case 0.5: delay = 2000; break;
        case 1: delay = 1000; break;
        case 1.5: delay = 700; break;
        case 2: delay = 500; break;
        default: delay = 1000;
      }
      
      animationRef.current = setTimeout(runStep, delay);
      return () => clearTimeout(animationRef.current);
    }
  }, [isRunning, currentStep, speed, sortingComplete]);
  
  // Initialize on mount
  useEffect(() => {
    initializeAlgorithm();
    return () => clearTimeout(animationRef.current);
  }, []);
  
  // Render the array visualization
  const renderArrayVisualization = () => {
    const currentStepData = stepsRef.current[currentStep];
    const maxValue = Math.max(...array);
    
    return (
      <div className="bubble-sort-visualization">
        <div className="array-display">
          {array.map((value, index) => {
            const isComparing = currentStepData?.compare?.includes(index);
            const isSorted = index >= array.length - i;
            const barHeight = (value / maxValue) * 300;
            
            return (
              <div 
                key={index} 
                className={`bar ${isComparing ? 'active' : ''} ${isSorted ? 'sorted' : ''}`}
                style={{ height: `${barHeight}px` }}
              >
                <span className="bar-value">{value}</span>
              </div>
            );
          })}
        </div>
        
        <div className="algorithm-message">
          {currentStepData?.message || "Ready to start"}
        </div>
      </div>
    );
  };
  
  // Render the inputs section
  const renderInputsSection = () => {
    return (
      <div className="bubble-sort-inputs">
        <div className="input-group">
          <input 
            type="text" 
            value={arrayInput} 
            onChange={handleArrayInputChange}
            placeholder="Enter comma-separated numbers (e.g., 29,10,14,37,13)"
            disabled={isRunning}
          />
          <button 
            onClick={handleSetArray}
            disabled={isRunning}
          >
            Set Array
          </button>
        </div>
        <button 
          onClick={handleReset}
          disabled={isRunning}
        >
          Reset
        </button>
      </div>
    );
  };
  
  // Render the solutions section
  const renderSolutionsSection = () => {
    return (
      <div className="bubble-sort-solution">
        <h3>Bubble Sort Algorithm</h3>
        <p>Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.</p>
        <p>Time Complexity: O(n²)</p>
        <p>Space Complexity: O(1)</p>
        <h4>Algorithm Steps:</h4>
        <ol>
          <li>Start from the first element.</li>
          <li>Compare adjacent elements. If the first is greater than the second, swap them.</li>
          <li>Continue to the next pair.</li>
          <li>After each complete pass, the largest element will be at the end.</li>
          <li>Repeat until no swaps are needed.</li>
        </ol>
      </div>
    );
  };
  
  // Render the how-to-use section
  const renderHowToUseSection = () => {
    return (
      <div className="bubble-sort-how-to-use">
        <h3>How to Use This Visualization</h3>
        <ol>
          <li>Enter comma-separated numbers in the input field.</li>
          <li>Click "Set Array" to update the visualization with your values.</li>
          <li>Use the playback controls to navigate through the sorting process:
            <ul>
              <li>Play/Pause - Start or pause the animation</li>
              <li>Step Forward/Backward - Move one step at a time</li>
              <li>Start/End - Jump to the beginning or end</li>
              <li>Speed - Adjust the animation speed</li>
            </ul>
          </li>
          <li>Reset - Return to the initial unsorted array</li>
        </ol>
        <p>Watch how elements are compared and swapped until the array is fully sorted.</p>
      </div>
    );
  };
  
  // Render the code section
  const renderCodeSection = () => {
    return (
      <div className="bubble-sort-code">
        <pre>{`function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    // Last i elements are already in place
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j + 1]) {
        // Swap if necessary
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}`}</pre>
      </div>
    );
  };
  
  // Combine everything into the AlgorithmLayout
  return (
    <AlgorithmLayout
      title="Bubble Sort Visualization"
      solutionsContent={renderSolutionsSection()}
      visualizationContent={renderArrayVisualization()}
      howToUseContent={renderHowToUseSection()}
      codeContent={renderCodeSection()}
      inputsContent={renderInputsSection()}
      controlsConfig={{
        onPlay: () => setIsRunning(true),
        onPause: () => setIsRunning(false),
        skipToStart: handleStart,
        skipToEnd: handleEnd,
        skipNext: handleNext,
        skipPrev: handlePrev,
        onReplay: handleReset,
        onSpeedChange: handleSpeedChange,
        onProgressChange: handleProgressChange,
        isPlaying: isRunning,
        progress: progress
      }}
    />
  );
};

export default BubbleSort;