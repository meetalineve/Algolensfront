import React, { useState, useEffect, useRef } from 'react';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';

const SelectionSort = () => {
  const [array, setArray] = useState([29, 10, 14, 37, 13]);
  const [originalArray, setOriginalArray] = useState([...array]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x speed
  const [inputValue, setInputValue] = useState('');
  const [sortingComplete, setSortingComplete] = useState(false);
  
  const playIntervalRef = useRef(null);
  
  // Generate all steps for selection sort
  const generateSteps = (inputArray) => {
    const arr = [...inputArray];
    const n = arr.length;
    const allSteps = [];
    
    // Initial state
    allSteps.push({
      array: [...arr],
      comparing: [],
      minIndex: -1,
      sorted: []
    });
    
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      
      // First, find the minimum element
      for (let j = i + 1; j < n; j++) {
        // Add a step showing comparison
        allSteps.push({
          array: [...arr],
          comparing: [j, minIndex],
          minIndex: minIndex,
          sorted: Array.from({ length: i }, (_, idx) => idx)
        });
        
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
          // Update the minIndex
          allSteps.push({
            array: [...arr],
            comparing: [j, i],
            minIndex: minIndex,
            sorted: Array.from({ length: i }, (_, idx) => idx)
          });
        }
      }
      
      // Swap the found minimum element with the first element
      if (minIndex !== i) {
        // Add a step showing the swap
        allSteps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, minIndex],
          minIndex: minIndex,
          sorted: Array.from({ length: i }, (_, idx) => idx)
        });
        
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      }
      
      // Add a step showing the newly sorted element
      allSteps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        minIndex: -1,
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx)
      });
    }
    
    // Final state - all sorted
    allSteps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      minIndex: -1,
      sorted: Array.from({ length: n }, (_, idx) => idx)
    });
    
    return allSteps;
  };
  
  // Set up initial steps
  useEffect(() => {
    const steps = generateSteps(array);
    setSteps(steps);
    setCurrentStep(0);
  }, []);
  
  // Handle play/pause functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = getSpeedValue();
      playIntervalRef.current = setInterval(() => {
        setCurrentStep(prevStep => {
          if (prevStep >= steps.length - 1) {
            setIsPlaying(false);
            setSortingComplete(true);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, interval);
    } else {
      clearInterval(playIntervalRef.current);
    }
    
    return () => {
      clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, steps.length, speed]);
  
  const getSpeedValue = () => {
    // Convert speed label to milliseconds
    switch(speed) {
      case 0.5: return 2000;
      case 1: return 1000;
      case 1.5: return 666;
      case 2: return 500;
      default: return 1000;
    }
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSortingComplete(false);
  };
  
  const handleSkipToStart = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  
  const handleSkipToEnd = () => {
    setCurrentStep(steps.length - 1);
    setIsPlaying(false);
    setSortingComplete(true);
  };
  
  const handleSkipNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === steps.length - 2) {
      setSortingComplete(true);
    }
  };
  
  const handleSkipPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSortingComplete(false);
    }
  };
  
  const handleSpeedChange = (_, newSpeed) => {
    setSpeed(newSpeed);
  };
  
  const handleProgressChange = (value) => {
    const step = Math.floor((steps.length - 1) * (value / 100));
    setCurrentStep(step);
    setSortingComplete(step === steps.length - 1);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleSetArray = () => {
    const values = inputValue.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
    if (values.length > 0) {
      setArray(values);
      setOriginalArray([...values]);
      const newSteps = generateSteps(values);
      setSteps(newSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      setSortingComplete(false);
    }
  };
  
  // Render the current visualization state
  const renderVisualization = () => {
    if (!steps.length || currentStep < 0) return <div>Loading...</div>;
    
    const step = steps[currentStep];
    const maxValue = Math.max(...originalArray);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h3>Step {currentStep} of {steps.length - 1}</h3>
          {step.comparing.length === 2 && (
            <p>Comparing elements at positions {step.comparing[0]} and {step.comparing[1]}</p>
          )}
          {step.swapping && step.swapping.length === 2 && (
            <p>Swapping elements at positions {step.swapping[0]} and {step.swapping[1]}</p>
          )}
          {step.sorted.length > 0 && step.sorted.length < originalArray.length && (
            <p>Elements at positions {step.sorted.join(', ')} are sorted</p>
          )}
          {step.sorted.length === originalArray.length && (
            <p>Array is completely sorted!</p>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          height: '300px', 
          gap: '10px',
          margin: '0 auto'
        }}>
          {step.array.map((value, index) => (
            <div
              key={index}
              style={{
                width: '40px',
                height: `${(value / maxValue) * 250}px`,
                backgroundColor: step.sorted.includes(index) 
                  ? '#9C27B0' // Purple for sorted elements
                  : step.minIndex === index 
                    ? '#FF9800' // Orange for min element
                    : step.comparing.includes(index) 
                      ? '#FF5722' // Deep orange for comparing
                      : step.swapping && step.swapping.includes(index) 
                        ? '#E91E63' // Pink for swapping
                        : '#4CAF50', // Default green
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.3s ease'
              }}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Input controls
  const renderInputs = () => {
    return (
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="array-input">Enter comma-separated numbers:</label>
          <input
            id="array-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="e.g., 29,10,14,37,13"
            style={{
              padding: '8px',
              marginLeft: '10px',
              width: '300px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={handleSetArray}
            style={{
              padding: '8px 16px',
              marginLeft: '10px',
              backgroundColor: '#00bcf2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Set Array
          </button>
        </div>
        <div>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Reset
          </button>
          <span>Current array: [{steps[currentStep]?.array.join(', ')}]</span>
        </div>
      </div>
    );
  };
  
  // Solutions content
  const renderSolutions = () => {
    return (
      <div>
        <h3>Selection Sort Algorithm</h3>
        <p>Time Complexity: O(n²)</p>
        <p>Space Complexity: O(1)</p>
        <p>Selection Sort is an in-place comparison sorting algorithm.</p>
        <p>
          The algorithm divides the input list into two parts:
          <ul>
            <li>A sorted sublist of items built up from left to right</li>
            <li>A sublist of remaining unsorted items</li>
          </ul>
        </p>
        <p>It repeatedly finds the minimum element from the unsorted part and puts it at the beginning.</p>
      </div>
    );
  };
  
  // How to use content
  const renderHowToUse = () => {
    return (
      <div>
        <h3>How to Use This Visualizer</h3>
        <ol>
          <li>Enter comma-separated numbers in the input field.</li>
          <li>Click "Set Array" to initialize the array.</li>
          <li>Use the playback controls to start, pause, or step through the algorithm.</li>
          <li>The progress bar shows the current position in the sorting process.</li>
          <li>Adjust the speed using the speed control.</li>
        </ol>
        <h4>Color Legend:</h4>
        <ul>
          <li><span style={{ color: '#4CAF50' }}>■</span> Unsorted elements</li>
          <li><span style={{ color: '#FF5722' }}>■</span> Elements being compared</li>
          <li><span style={{ color: '#FF9800' }}>■</span> Current minimum element</li>
          <li><span style={{ color: '#E91E63' }}>■</span> Elements being swapped</li>
          <li><span style={{ color: '#9C27B0' }}>■</span> Sorted elements</li>
        </ul>
      </div>
    );
  };
  
  // Code content
  const renderCode = () => {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
{`function selectionSort(arr) {
  const n = arr.length;
  
  for(let i = 0; i < n - 1; i++) {
    // Find the minimum element in the unsorted array
    let minIndex = i;
    for(let j = i + 1; j < n; j++) {
      if(arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    
    // Swap the found minimum element with the first element
    if(minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  
  return arr;
}`}
      </pre>
    );
  };
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = steps.length > 0 
    ? (currentStep / (steps.length - 1)) * 100 
    : 0;
  
  // Config for the AlgorithmLayout controls
  const controlsConfig = {
    onPlay: handlePlayPause,
    onPause: handlePlayPause,
    skipToStart: handleSkipToStart,
    skipToEnd: handleSkipToEnd,
    skipNext: handleSkipNext,
    skipPrev: handleSkipPrev,
    onReplay: handleReset,
    onSpeedChange: handleSpeedChange,
    onProgressChange: handleProgressChange,
    isPlaying: isPlaying,
    progress: progressPercentage
  };
  
  return (
    <AlgorithmLayout
      title="Selection Sort Visualization"
      solutionsContent={renderSolutions()}
      visualizationContent={renderVisualization()}
      howToUseContent={renderHowToUse()}
      codeContent={renderCode()}
      controlsConfig={controlsConfig}
      inputsContent={renderInputs()}
    />
  );
};

export default SelectionSort;