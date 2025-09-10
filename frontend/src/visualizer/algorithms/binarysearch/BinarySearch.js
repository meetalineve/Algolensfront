import React, { useState, useEffect, useRef } from 'react';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';

const BinarySearch = () => {
  // Simulation state
  const [array, setArray] = useState('');
  const [target, setTarget] = useState('');
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(-1);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Refs
  const playbackIntervalRef = useRef(null);
  
  // Helper function to create array from input - MODIFIED to handle comma-separated numbers
  const createArrayFromInput = (input) => {
    // If input has commas, split by commas
    if (input.includes(',')) {
      return input.trim().split(',').map(num => Number(num.trim())).filter(num => !isNaN(num));
    }
    // If input has spaces, process as before
    else if (input.includes(' ')) {
      return input.trim().split(/\s+/).map(Number).filter(num => !isNaN(num));
    } 
    // Process each character as a separate number
    else {
      return input.split('').map(Number).filter(num => !isNaN(num));
    }
  };
  
  // Binary search algorithm with step tracking
  const binarySearch = (arr, target) => {
    // Sort the array first
    arr.sort((a, b) => a - b);
    
    let low = 0;
    let high = arr.length - 1;
    let steps = [];
    let iteration = 1;
    
    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      
      // Create comparison text
      let comparisonText = '';
      if (arr[mid] === target) {
        comparisonText = `Found target value ${target} at index ${mid}!`;
      } else if (arr[mid] < target) {
        comparisonText = `${arr[mid]} < ${target}, so search in the right half`;
      } else {
        comparisonText = `${arr[mid]} > ${target}, so search in the left half`;
      }
      
      // Record this step
      steps.push({
        iteration: iteration,
        lowerBound: low,
        upperBound: high,
        mid: mid,
        comparisonText: comparisonText,
        found: arr[mid] === target
      });
      
      if (arr[mid] === target) {
        return [mid, steps]; // Found the element
      } else if (arr[mid] < target) {
        low = mid + 1; // Search in the right half
      } else {
        high = mid - 1; // Search in the left half
      }
      
      iteration++;
    }
    
    // Add a final step showing element not found
    steps.push({
      iteration: iteration,
      lowerBound: -1,
      upperBound: -1,
      mid: -1,
      comparisonText: `Target value ${target} not found in the array`,
      found: false,
      notFound: true
    });
    
    return [-1, steps]; // Element not found
  };
  
  // Handle simulation
  const startSimulation = () => {
    // Clear any existing error
    setErrorMessage('');
    
    // Validate inputs
    const parsedArray = createArrayFromInput(array);
    if (parsedArray.length === 0) {
      setErrorMessage('Please enter a valid array of numbers');
      return;
    }
    
    const searchValue = parseInt(target);
    if (isNaN(searchValue)) {
      setErrorMessage('Please enter a valid search number');
      return;
    }
    
    // Sort the array for binary search
    const sortedArray = [...parsedArray].sort((a, b) => a - b);
    
    // Perform binary search
    const [resultIndex, searchSteps] = binarySearch(sortedArray, searchValue);
    
    // Update state
    setSteps(searchSteps);
    setResult(resultIndex);
    setCurrentStep(0);
    setProgress(0);
    
    // Auto-play
    startPlayback();
  };
  
  // Reset everything to initial state
  const resetAll = () => {
    // Stop any playback
    stopPlayback();
    
    // Reset all state
    setArray('');
    setTarget('');
    setSteps([]);
    setResult(-1);
    setCurrentStep(0);
    setProgress(0);
    setErrorMessage('');
  };
  
  // Control functions
  const startPlayback = () => {
    setIsPlaying(true);
  };
  
  const stopPlayback = () => {
    setIsPlaying(false);
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
  };
  
  const resetSimulation = () => {
    if (steps.length === 0) return;
    
    setCurrentStep(0);
    setProgress(0);
    stopPlayback();
  };
  
  const goToNextStep = () => {
    if (steps.length === 0) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(((currentStep + 1) / (steps.length - 1)) * 100);
    }
  };
  
  const goToPrevStep = () => {
    if (steps.length === 0) return;
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(((currentStep - 1) / (steps.length - 1)) * 100);
    }
  };
  
  const goToStart = () => {
    if (steps.length === 0) return;
    
    setCurrentStep(0);
    setProgress(0);
  };
  
  const goToEnd = () => {
    if (steps.length === 0) return;
    
    setCurrentStep(steps.length - 1);
    setProgress(100);
  };
  
  const handleSpeedChange = (_, value) => {
    setPlaybackSpeed(value);
  };
  
  const handleProgressChange = (value) => {
    if (steps.length === 0) return;
    
    const newStep = Math.floor((value / 100) * (steps.length - 1));
    setCurrentStep(newStep);
    setProgress(value);
  };
  
  // Playback effect
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      // Clear existing interval
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      
      // Start new interval
      playbackIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            const nextStep = prev + 1;
            setProgress(((nextStep) / (steps.length - 1)) * 100);
            return nextStep;
          } else {
            // End of simulation
            setIsPlaying(false);
            clearInterval(playbackIntervalRef.current);
            return prev;
          }
        });
      }, 1000 / playbackSpeed);
    }
    
    // Cleanup on unmount or when isPlaying changes
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, steps.length, playbackSpeed]);
  
  // Visualization component
  const VisualizationContent = () => {
    if (steps.length === 0) {
      return (
        <div className="placeholder-message" style={{ textAlign: 'center', padding: '3rem' }}>
          Enter numbers and a search key to start the binary search simulation
        </div>
      );
    }
    
    const step = steps[currentStep];
    const sortedArray = array.length > 0 ? createArrayFromInput(array).sort((a, b) => a - b) : [];
    
    return (
      <div>
        {/* Iteration info */}
        <div className="iteration-info" style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          borderRadius: '4px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="iteration-count" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            Iteration: {step.iteration}
          </div>
          <div className="bounds-info" style={{ display: 'flex', gap: '1rem' }}>
            {!step.notFound && (
              <>
                <div className="bound lower-bound" style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  color: '#b02a37'
                }}>
                  Lower: {step.lowerBound}
                </div>
                <div className="bound mid" style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  color: '#146c43'
                }}>
                  Mid: {step.mid}
                </div>
                <div className="bound upper-bound" style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(23, 162, 184, 0.1)',
                  color: '#117a8b'
                }}>
                  Upper: {step.upperBound}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Comparison info */}
        <div className="comparison-info" style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {step.comparisonText}
        </div>
        
        {/* Array visualization */}
        <div className="array-visualization" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          padding: '1rem 0'
        }}>
          {sortedArray.map((num, i) => {
            let elementClass = '';
            const parsedTarget = parseInt(target);
            
            if (step.notFound) {
              // Final "not found" state
              elementClass = num === parsedTarget ? 'target-element' : '';
            } else if (i < step.lowerBound || i > step.upperBound) {
              elementClass = 'not-in-range';
            } else if (i === step.mid) {
              elementClass = step.found ? 'found-element' : 'mid-element';
            } else if (i >= step.lowerBound && i < step.mid) {
              elementClass = 'lower-bound-element';
            } else if (i > step.mid && i <= step.upperBound) {
              elementClass = 'upper-bound-element';
            }
            
            // Add target indicator
            if (num === parsedTarget && !step.notFound) {
              elementClass += ' target-element';
            }
            
            const styles = {
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #dee2e6',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              ...(elementClass.includes('not-in-range') && { opacity: 0.3 }),
              ...(elementClass.includes('lower-bound-element') && { 
                backgroundColor: 'rgba(220, 53, 69, 0.1)', 
                borderColor: '#dc3545' 
              }),
              ...(elementClass.includes('mid-element') && { 
                backgroundColor: 'rgba(40, 167, 69, 0.1)', 
                borderColor: '#28a745',
                transform: 'translateY(-10px)'
              }),
              ...(elementClass.includes('upper-bound-element') && { 
                backgroundColor: 'rgba(23, 162, 184, 0.1)', 
                borderColor: '#17a2b8' 
              }),
              ...(elementClass.includes('target-element') && { 
                backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                borderColor: '#ffc107' 
              }),
              ...(elementClass.includes('found-element') && { 
                backgroundColor: 'rgba(40, 167, 69, 0.2)', 
                borderColor: '#28a745',
                transform: 'translateY(-10px)',
                animation: 'pulse 1s infinite'
              })
            };
            
            return (
              <div key={i} className={`array-element ${elementClass}`} style={styles}>
                {num}
                <div className="index-label" style={{
                  position: 'absolute',
                  bottom: '-20px',
                  fontSize: '0.8rem',
                  color: '#6c757d'
                }}>
                  {i}
                </div>
              </div>
            );
          })}
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0% { transform: translateY(-10px) scale(1); }
            50% { transform: translateY(-10px) scale(1.05); }
            100% { transform: translateY(-10px) scale(1); }
          }
        `}</style>
      </div>
    );
  };
  
  // Handle key in input
  const handleArrayInputKeyDown = (e) => {
    if (e.key === " " || e.key === ",") {
      e.stopPropagation(); // Stop propagation to prevent triggering other keyboard shortcuts
    }
  };
  
  // Inputs component - Updated placeholder text for comma-separated values
  const InputsContent = () => (
    <div>
      <h3>Enter Array and Search Value</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={array}
          onChange={(e) => setArray(e.target.value)}
          onKeyDown={handleArrayInputKeyDown}
          placeholder="Enter numbers separated by commas (e.g. 1,2,3,4,5)"
          style={{
            padding: '0.75rem',
            flex: 1,
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Search number"
          style={{
            padding: '0.75rem',
            width: '150px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
        <button
          onClick={startSimulation}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
        >
          Start Simulation
        </button>
        <button
          onClick={resetAll}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
  
  // Solutions content
  const SolutionsContent = () => (
    <div>
      <h3>Binary Search</h3>
      <p>
        Binary search is an efficient algorithm for finding an item from a sorted array of items by repeatedly dividing the search interval in half.
      </p>
      <h4>Time Complexity</h4>
      <p>O(log n) - where n is the number of elements in the array</p>
      <h4>Space Complexity</h4>
      <p>O(1) - constant space</p>
    </div>
  );
  
  // Code content
  const CodeContent = () => (
    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
      {`// Binary Search Algorithm
function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    
    // Found the target
    if (arr[mid] === target) {
      return mid;
    }
    
    // Target is in the right half
    if (arr[mid] < target) {
      low = mid + 1;
    } 
    // Target is in the left half
    else {
      high = mid - 1;
    }
  }
  
  // Target not found
  return -1;
}`}
    </pre>
  );
  
  // How to use content - Updated to reflect the comma-separated input method
  const HowToUseContent = () => (
    <div>
      <h3>How to Use This Visualization</h3>
      <p>1. Enter numbers separated by commas in the input field (e.g., 1, 3, 5, 7, 9, 11, 13, 15, 17, 19)</p>
      <p>2. The visualizer also supports spaces (e.g., "1 2 3 4 5") or no separators (e.g., "12345")</p>
      <p>3. Enter a number to search for in the "Search number" field</p>
      <p>4. Click "Start Simulation" to begin the binary search</p>
      <p>5. Use the playback controls to step through the algorithm</p>
      <p>6. Watch the visualization to understand how binary search works</p>
      <p>7. Use the "Reset" button to clear all inputs and start over</p>
      <br />
      <p><strong>Note:</strong> The array will be automatically sorted before the search begins, as binary search requires a sorted array.</p>
    </div>
  );
  
  // Controls configuration
  const controlsConfig = {
    onPlay: startPlayback,
    onPause: stopPlayback,
    skipToStart: goToStart,
    skipToEnd: goToEnd,
    skipNext: goToNextStep,
    skipPrev: goToPrevStep,
    onReplay: resetSimulation,
    onSpeedChange: handleSpeedChange,
    onProgressChange: handleProgressChange,
    isPlaying: isPlaying,
    progress: progress
  };
  
  return (
    <AlgorithmLayout
      title="Binary Search Visualization"
      solutionsContent={<SolutionsContent />}
      visualizationContent={<VisualizationContent />}
      inputsContent={<InputsContent />}
      howToUseContent={<HowToUseContent />}
      codeContent={<CodeContent />}
      controlsConfig={controlsConfig}
    />
  );
};

export default BinarySearch;