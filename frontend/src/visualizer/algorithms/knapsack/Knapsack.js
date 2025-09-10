import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';
import './Knapsack.css';

const Knapsack = () => {
  const [showCode, setShowCode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [speedLabel, setSpeedLabel] = useState('1x');
  const [profitArray, setProfitArray] = useState('');
  const [weightArray, setWeightArray] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [itemNames, setItemNames] = useState('');
  const [sortingStarted, setSortingStarted] = useState(false);
  
  // Knapsack algorithm states
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [dpTable, setDpTable] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [maxProfit, setMaxProfit] = useState(0);
  const [parsedInputs, setParsedInputs] = useState({
    profits: [],
    weights: [],
    capacity: 0,
    names: []
  });

  const speeds = ['0.5x', '1x', '1.5x', '2x'];
  const speedValues = [2000, 1000, 667, 500]; // milliseconds
  const progressBarRef = useRef(null);
  const animationRef = useRef(null);
  const { id } = useParams();

  // Parse input arrays
  const parseInputs = () => {
    const profits = profitArray.trim().split(/\s+/).map(Number);
    const weights = weightArray.trim().split(/\s+/).map(Number);
    const capacity = parseInt(maxWeight);
    const names = itemNames.trim() ? 
                  itemNames.trim().split(/\s+/) : 
                  profits.map((_, idx) => `Item${idx+1}`);
    
    // Make sure names array is same length as profits/weights
    while (names.length < profits.length) {
      names.push(`Item${names.length+1}`);
    }

    return {
      profits,
      weights,
      capacity,
      names: names.slice(0, profits.length)
    };
  };

  // Generate knapsack DP table and all steps for animation
  const generateKnapsackSteps = ({ profits, weights, capacity, names }) => {
    const n = profits.length;
    // Initialize DP table with zeros
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    const steps = [];
    
    // Record initial state
    steps.push({
      type: 'init',
      message: 'Initializing DP table with zeros',
      dp: JSON.parse(JSON.stringify(dp)),
      highlightCell: null,
      currentItem: null,
      currentWeight: null,
      selected: []
    });
    
    // Fill the dp table and record each step
    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        // Default case - don't take the item
        dp[i][w] = dp[i-1][w];
        
        steps.push({
          type: 'compare',
          message: `Considering ${names[i-1]} (profit: ${profits[i-1]}, weight: ${weights[i-1]}) for capacity ${w}`,
          dp: JSON.parse(JSON.stringify(dp)),
          highlightCell: [i, w],
          currentItem: i-1,
          currentWeight: w,
          selected: []
        });
        
        // If we can take the item, decide if it's worth taking
        if (weights[i-1] <= w) {
          const takeProfit = dp[i-1][w - weights[i-1]] + profits[i-1];
          const leaveProfit = dp[i-1][w];
          
          steps.push({
            type: 'calculation',
            message: `For ${names[i-1]}, comparing: Take (${takeProfit}) vs Leave (${leaveProfit})`,
            dp: JSON.parse(JSON.stringify(dp)),
            highlightCell: [i, w],
            compareCell: [i-1, w - weights[i-1]],
            currentItem: i-1,
            currentWeight: w,
            takeProfit,
            leaveProfit,
            selected: []
          });
          
          // If taking the item gives more profit
          if (takeProfit > leaveProfit) {
            dp[i][w] = takeProfit;
            
            steps.push({
              type: 'update',
              message: `Taking ${names[i-1]} gives better profit (${takeProfit} > ${leaveProfit})`,
              dp: JSON.parse(JSON.stringify(dp)),
              highlightCell: [i, w],
              currentItem: i-1,
              currentWeight: w,
              selected: []
            });
          } else {
            steps.push({
              type: 'skip',
              message: `Leaving ${names[i-1]} is better (${leaveProfit} >= ${takeProfit})`,
              dp: JSON.parse(JSON.stringify(dp)),
              highlightCell: [i, w],
              currentItem: i-1,
              currentWeight: w,
              selected: []
            });
          }
        } else {
          steps.push({
            type: 'tooHeavy',
            message: `${names[i-1]} is too heavy for capacity ${w}`,
            dp: JSON.parse(JSON.stringify(dp)),
            highlightCell: [i, w],
            currentItem: i-1,
            currentWeight: w,
            selected: []
          });
        }
      }
    }
    
    // Trace back to find which items are selected
    const selected = [];
    let remainingCapacity = capacity;
    
    for (let i = n; i > 0; i--) {
      if (dp[i][remainingCapacity] !== dp[i-1][remainingCapacity]) {
        selected.unshift(i-1); // Add item to selected list (0-based index)
        remainingCapacity -= weights[i-1];
      }
    }
    
    // Add final step showing selected items
    steps.push({
      type: 'result',
      message: `Maximum profit: ${dp[n][capacity]}. Selected items: ${selected.map(idx => names[idx]).join(', ')}`,
      dp: JSON.parse(JSON.stringify(dp)),
      highlightCell: [n, capacity],
      currentItem: null,
      currentWeight: capacity,
      selected
    });
    
    return {
      dpTable: dp,
      steps,
      maxProfit: dp[n][capacity],
      selectedItems: selected
    };
  };

  // Handle start button click
  const handleStart = () => {
    try {
      const inputs = parseInputs();
      
      // Validate inputs
      if (inputs.profits.length === 0 || inputs.weights.length === 0 || isNaN(inputs.capacity)) {
        alert('Please enter valid inputs for profits, weights, and capacity');
        return;
      }
      
      if (inputs.profits.length !== inputs.weights.length) {
        alert('Profit array and weight array must have the same length');
        return;
      }
      
      if (inputs.profits.some(isNaN) || inputs.weights.some(isNaN) || inputs.capacity <= 0) {
        alert('All profits and weights must be valid numbers, and capacity must be positive');
        return;
      }
      
      setParsedInputs(inputs);
      
      // Generate all steps for the knapsack algorithm
      const { dpTable, steps, maxProfit, selectedItems } = generateKnapsackSteps(inputs);
      
      setDpTable(dpTable);
      setAlgorithmSteps(steps);
      setTotalSteps(steps.length);
      setCurrentStep(0);
      setMaxProfit(maxProfit);
      setSelectedItems(selectedItems);
      
      // Reset progress
      setProgress(0);
      setSortingStarted(true);
      setIsPlaying(true);
      
      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      // Start animation
      playAnimation(0);
    } catch (error) {
      alert('Error starting algorithm: ' + error.message);
    }
  };

  // Animation play function
  const playAnimation = (stepIndex) => {
    if (stepIndex >= algorithmSteps.length) {
      setIsPlaying(false);
      return;
    }
    
    setCurrentStep(stepIndex);
    const progressPercent = (stepIndex / (algorithmSteps.length - 1)) * 100;
    setProgress(progressPercent);
    
    if (isPlaying) {
      const nextStep = stepIndex + 1;
      const currentSpeed = speedValues[speedIndex];
      
      animationRef.current = setTimeout(() => {
        playAnimation(nextStep);
      }, currentSpeed);
    }
  };

  // Control functions
  const handlePlayPause = () => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState && currentStep < algorithmSteps.length) {
      // If we're playing and not at the end, continue from current step
      playAnimation(currentStep);
    }
  };

  const handleSpeedChange = () => {
    const nextIndex = (speedIndex + 1) % speeds.length;
    setSpeedIndex(nextIndex);
    setSpeedLabel(speeds[nextIndex]);
    
    // If currently playing, restart animation with new speed
    if (isPlaying) {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      playAnimation(currentStep);
    }
  };

  const handleReplay = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
    
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    playAnimation(0);
  };

  const handleEnd = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    const lastStepIndex = algorithmSteps.length - 1;
    setCurrentStep(lastStepIndex);
    setProgress(100);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    const nextStep = Math.min(currentStep + 1, algorithmSteps.length - 1);
    setCurrentStep(nextStep);
    
    const progressPercent = (nextStep / (algorithmSteps.length - 1)) * 100;
    setProgress(progressPercent);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    const prevStep = Math.max(currentStep - 1, 0);
    setCurrentStep(prevStep);
    
    const progressPercent = (prevStep / (algorithmSteps.length - 1)) * 100;
    setProgress(progressPercent);
    setIsPlaying(false);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Solutions content for the algorithm explanation
  const solutionsContent = (
    <div className="solutions-content">
      {/* Show this when the algorithm hasn't run yet */}
      {!sortingStarted ? (
        <>
          <h3>0/1 Knapsack Problem</h3>
          <p>The 0/1 Knapsack problem is a classic optimization problem:</p>
          <ul>
            <li>You have a knapsack with limited capacity</li>
            <li>You have items with different weights and profits</li>
            <li>You need to choose items to maximize profit while respecting the weight limit</li>
            <li>Either take an item (1) or leave it (0)</li>
          </ul>
          <h4>Solution Approach</h4>
          <p>We use dynamic programming to solve this problem efficiently:</p>
          <ul>
            <li>Create a DP table with items as rows and weights as columns</li>
            <li>For each item and weight, decide whether to take it or leave it</li>
            <li>Base case: With 0 items or 0 capacity, profit is 0</li>
            <li>Formula: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + profit[i])</li>
          </ul>
        </>
      ) : (
        // Show the final results when the algorithm has finished
        <div className="final-results">
          <h3>Final Result</h3>
          <p>Maximum profit: {maxProfit}</p>
          
          <h4>Selected Items:</h4>
          <div className="selected-items-container">
            {selectedItems.map(idx => (
              <div key={idx} className="selected-item">
                {parsedInputs.names[idx]} (Profit: {parsedInputs.profits[idx]}, Weight: {parsedInputs.weights[idx]})
              </div>
            ))}
          </div>
          
          <p>
            Total weight: {selectedItems.reduce((sum, idx) => sum + parsedInputs.weights[idx], 0)}
          </p>
        </div>
      )}
    </div>
  );

  // How to use content explaining usage
  const howToUseContent = (
    <div>
      <h3>How to Use the Knapsack Visualizer</h3>
      <ol>
        <li>Enter the profit values for each item, separated by spaces</li>
        <li>Enter the weight values for each item, separated by spaces</li>
        <li>Enter the maximum weight capacity of the knapsack</li>
        <li>Optionally, enter names for each item (if not specified, default names will be used)</li>
        <li>Click "Start" to begin the visualization</li>
        <li>Use the control panel to:
          <ul>
            <li>Play/pause the animation</li>
            <li>Step forward or backward</li>
            <li>Jump to the start or end</li>
            <li>Adjust the animation speed</li>
          </ul>
        </li>
      </ol>
      <p>The visualization will show how the algorithm builds the dynamic programming table and eventually determines which items to select for maximum profit.</p>
    </div>
  );

  // Code implementation for display
  const codeContent = (
    <pre>
{`// 0/1 Knapsack Dynamic Programming Solution
function knapsack(profits, weights, capacity) {
  const n = profits.length;
  
  // Initialize DP table with zeros
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      // By default, don't take the item
      dp[i][w] = dp[i-1][w];
      
      // If we can take the item, decide if it's worth taking
      if (weights[i-1] <= w) {
        const takeProfit = dp[i-1][w - weights[i-1]] + profits[i-1];
        dp[i][w] = Math.max(dp[i][w], takeProfit);
      }
    }
  }
  
  // Trace back to find which items are selected
  const selected = [];
  let remainingCapacity = capacity;
  
  for (let i = n; i > 0; i--) {
    if (dp[i][remainingCapacity] !== dp[i-1][remainingCapacity]) {
      selected.unshift(i-1); // Add item to selected list
      remainingCapacity -= weights[i-1];
    }
  }
  
  return {
    maxProfit: dp[n][capacity],
    selectedItems: selected
  };
}`}
    </pre>
  );

  // Render the algorithm visualization based on current step
  const renderVisualization = () => {
    if (!sortingStarted || algorithmSteps.length === 0) {
      return (
        <div className="visualization-placeholder">
          <p>Enter input values and click "Start" to visualize the Knapsack algorithm</p>
          <div className="example-inputs">
            <p><strong>Example:</strong> Profits: 60 100 120, Weights: 10 20 30, Max Weight: 50</p>
          </div>
        </div>
      );
    }
    
    // Check if currentStep is valid and currentStepData exists before destructuring
    if (currentStep >= 0 && currentStep < algorithmSteps.length) {
      const currentStepData = algorithmSteps[currentStep];
      if (currentStepData) {
        const { dp, highlightCell, compareCell, currentItem, currentWeight, message } = currentStepData;
        
        return (
          <div className="knapsack-visualization">
            <div className="visualization-message">
              <p>{message}</p>
            </div>
            
            <div className="visualization-container">
              <div className="items-container">
                <h4>Items</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Profit</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedInputs.profits.map((profit, idx) => (
                      <tr key={idx} className={currentItem === idx ? 'highlighted-row' : ''}>
                        <td>{parsedInputs.names[idx]}</td>
                        <td>{profit}</td>
                        <td>{parsedInputs.weights[idx]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="dp-table-container">
                <h4>DP Table</h4>
                <table className="dp-table">
                  <thead>
                    <tr>
                      <th>Item / Weight</th>
                      {Array.from({ length: parsedInputs.capacity + 1 }, (_, i) => (
                        <th key={i} className={currentWeight === i ? 'highlighted-col' : ''}>{i}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dp.map((row, i) => (
                      <tr key={i}>
                        <td>{i === 0 ? '0 (No items)' : parsedInputs.names[i-1]}</td>
                        {row.map((cell, j) => {
                          let cellClass = '';
                          if (highlightCell && highlightCell[0] === i && highlightCell[1] === j) {
                            cellClass = 'highlighted-cell';
                          } else if (compareCell && compareCell[0] === i && compareCell[1] === j) {
                            cellClass = 'compare-cell';
                          }
                          return <td key={j} className={cellClass}>{cell}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // Fallback if there's an issue with currentStep or currentStepData
    return (
      <div className="visualization-error">
        <p>Error rendering visualization. Please try restarting the algorithm.</p>
      </div>
    );
  };

  // Input content for the algorithm
  const inputsContent = (
    <div>
      <div className="input-row">
        <label>
          Enter Profit Array:
          <input
            type="text"
            value={profitArray}
            onChange={(e) => setProfitArray(e.target.value)}
            placeholder="e.g., 60 100 120"
          />
        </label>
        <label>
          Enter Weight Array:
          <input
            type="text"
            value={weightArray}
            onChange={(e) => setWeightArray(e.target.value)}
            placeholder="e.g., 10 20 30"
          />
        </label>
      </div>
      <div className="input-row right-align">
        <label>
          Enter Max Weight:
          <input
            type="number"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
            placeholder="e.g., 50"
          />
        </label>
        <label>
          Enter Item Names:
          <input
            type="text"
            value={itemNames}
            onChange={(e) => setItemNames(e.target.value)}
            placeholder="e.g., Item1 Item2"
          />
        </label>
      </div>

      {/* Start Button */}
      <button onClick={handleStart} className="start-button">
        Start
      </button>
    </div>
  );

  // Configure controls for AlgorithmLayout
  const controlsConfig = {
    onPlay: handlePlayPause,
    onPause: handlePlayPause,
    skipToStart: () => {
      setCurrentStep(0);
      setIsPlaying(false);
    },
    skipToEnd: handleEnd,
    skipNext: handleNext,
    skipPrev: handlePrev,
    onReplay: handleReplay,
    onSpeedChange: handleSpeedChange,
    onProgressChange: (value) => setProgress(value),
    isPlaying: isPlaying,
    progress: progress
  };

  return (
    <AlgorithmLayout
      title="0/1 Knapsack Problem"
      solutionsContent={solutionsContent}
      visualizationContent={renderVisualization()}
      howToUseContent={howToUseContent}
      codeContent={codeContent}
      controlsConfig={controlsConfig}
      inputsContent={inputsContent}
    />
  );
};

export default Knapsack;