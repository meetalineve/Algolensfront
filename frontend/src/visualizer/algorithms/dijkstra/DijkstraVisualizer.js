import React, { useEffect, useRef, useState } from 'react';
import './DijkstraVisualizer.css';

const DijkstraVisualizer = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [verts, setVerts] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startV, setStartV] = useState(null);
  const [dragV, setDragV] = useState(null);
  const [mode, setMode] = useState(null);
  const [edgeO, setEdgeO] = useState(null);
  const [draggingEdge, setDraggingEdge] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState('');
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [running, setRunning] = useState(false);
  const [algorithmSteps, setAlgorithmSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inlineInput, setInlineInput] = useState({
    visible: false, 
    x: 0, 
    y: 0, 
    callback: null
  });
  const inputRef = useRef(null);
  const animationRef = useRef(null);
  const algorithmRef = useRef(null);
  
  // Define hit method outside of the class to be used universally
  const hit = (vertex, px, py) => {
    return (px - vertex.x) ** 2 + (py - vertex.y) ** 2 <= vertex.r ** 2;
  };
  
  // Vertex class
  class Vertex {
    constructor(x, y, label) {
      this.x = x;
      this.y = y;
      this.label = label || `V${verts.length + 1}`;
      this.r = 20;
      this.dist = Infinity;
      this.prev = null;
      this.visited = false;
      this.adj = [];
      this.id = Date.now() + Math.random(); // Unique identifier for each vertex
    }
    
    hit(px, py) {
      return (px - this.x) ** 2 + (py - this.y) ** 2 <= this.r ** 2;
    }
  }

  // Edge class
  class Edge {
    constructor(u, v, w) {
      this.u = u;
      this.v = v;
      this.w = w;
    }
  }

  // Effect for canvas initialization and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw edges
      edges.forEach(e => {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.u.x, e.u.y);
        ctx.lineTo(e.v.x, e.v.y);
        ctx.stroke();
        
        const mx = (e.u.x + e.v.x) / 2;
        const my = (e.u.y + e.v.y) / 2;
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.w, mx, my - 5);
      });
      
      // Draw final path edges (if algorithm has finished running)
      if (!running && verts.some(v => v.visited)) {
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 4;
        verts.forEach(v => {
          if (v.prev) {
            ctx.beginPath();
            ctx.moveTo(v.x, v.y);
            ctx.lineTo(v.prev.x, v.prev.y);
            ctx.stroke();
          }
        });
      }
      
      // Draw vertices
      verts.forEach(v => {
        let fill = '#fff';
        if (startV && v.id === startV.id) fill = '#22c55e';
        else if (v.visited) fill = '#facc15';
        
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v.label, v.x, v.y + 5);
        
        // Distance
        if (v.dist < Infinity) {
          ctx.fillText(v.dist, v.x, v.y - 25);
        }
      });
      
      // Rubber-band for edge drawing
      if (draggingEdge && edgeO) {
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(edgeO.x, edgeO.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
      }
    };

    render();
    
    // Add a requestAnimationFrame to ensure smooth rendering
    animationRef.current = requestAnimationFrame(function loop() {
      render();
      animationRef.current = requestAnimationFrame(loop);
    });
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    
  }, [verts, edges, startV, edgeO, draggingEdge, mousePos, running]);

  // Effect for focusing the inline input when it appears
  useEffect(() => {
    if (inlineInput.visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inlineInput.visible]);

  // Helper function for sleeping (used in dijkstra animation)
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Store snapshot of current algorithm state
  const captureAlgorithmState = (vertices) => {
    return vertices.map(v => ({
      label: v.label,
      dist: v.dist,
      visited: v.visited,
      prev: v.prev ? v.prev.label : null,
      id: v.id
    }));
  };

  // Dijkstra's algorithm implementation
  const runDijkstra = async () => {
    if (!startV) {
      alert('Pick a start vertex first.');
      return;
    }
    
    // Don't start if already running
    if (running) {
      return;
    }
    
    setRunning(true);
    setIsPlaying(true);
    setStatus('Running...');
    setAlgorithmSteps([]);
    setCurrentStep(0);
    
    // Reset all vertices
    const updatedVerts = verts.map(v => {
      return {
        ...v,
        dist: Infinity,
        prev: null,
        visited: false
      };
    });
    
    // Set start vertex distance to 0
    const startIndex = updatedVerts.findIndex(v => v.id === startV.id);
    if (startIndex !== -1) {
      updatedVerts[startIndex].dist = 0;
    }
    
    setVerts([...updatedVerts]);
    
    // Run the algorithm with the current state
    const steps = [];
    steps.push(captureAlgorithmState([...updatedVerts]));
    
    if (algorithmRef.current) {
      clearTimeout(algorithmRef.current);
    }
    
    // Use the same algorithm logic as the original script.js
    const q = [...updatedVerts];
    let totalSteps = q.length;
    let currentStepCount = 0;
    
    const runStep = async () => {
      // Check if we should continue or pause
      if (!isPlaying) {
        // Save timeout reference to resume later
        algorithmRef.current = setTimeout(runStep, 100);
        return;
      }
      
      if (q.length === 0) {
        // Algorithm completed
        setStatus('Completed');
        setRunning(false);
        setIsPlaying(false);
        setProgress(100);
        setAlgorithmSteps(steps);
        return;
      }
      
      // Sort by distance (min priority queue behavior)
      q.sort((a, b) => a.dist - b.dist);
      const u = q.shift();
      
      if (u.dist === Infinity) {
        // Unreachable vertices remain
        setStatus('Completed (some unreachable)');
        setRunning(false);
        setIsPlaying(false);
        setProgress(100);
        setAlgorithmSteps(steps);
        return;
      }
      
      // Mark current vertex as visited
      const uIndex = updatedVerts.findIndex(v => v.id === u.id);
      if (uIndex !== -1) {
        updatedVerts[uIndex].visited = true;
        setVerts([...updatedVerts]);
      }
      
      // Update progress
      currentStepCount++;
      const progressValue = Math.min(100, Math.floor((currentStepCount / totalSteps) * 100));
      setProgress(progressValue);
      setCurrentStep(steps.length);
      
      // Store the current state
      steps.push(captureAlgorithmState([...updatedVerts]));
      
      await sleep(1000 / speed);
      
      // Process all adjacent vertices
      for (const edge of edges) {
        if (edge.u.id === u.id) {
          const vIndex = updatedVerts.findIndex(vertex => vertex.id === edge.v.id);
          if (vIndex !== -1 && !updatedVerts[vIndex].visited) {
            const nd = u.dist + edge.w;
            if (nd < updatedVerts[vIndex].dist) {
              updatedVerts[vIndex].dist = nd;
              updatedVerts[vIndex].prev = u;
              setVerts([...updatedVerts]);
              
              // Store state after each distance update
              steps.push(captureAlgorithmState([...updatedVerts]));
            }
          }
        } else if (edge.v.id === u.id) {
          // Handle undirected graph (edges work both ways)
          const vIndex = updatedVerts.findIndex(vertex => vertex.id === edge.u.id);
          if (vIndex !== -1 && !updatedVerts[vIndex].visited) {
            const nd = u.dist + edge.w;
            if (nd < updatedVerts[vIndex].dist) {
              updatedVerts[vIndex].dist = nd;
              updatedVerts[vIndex].prev = u;
              setVerts([...updatedVerts]);
              
              // Store state after each distance update
              steps.push(captureAlgorithmState([...updatedVerts]));
            }
          }
        }
      }
      
      // Continue with next step
      algorithmRef.current = setTimeout(runStep, 1);
    };
    
    // Start the algorithm
    algorithmRef.current = setTimeout(runStep, 1);
  };

  // Create inline input using React state
  const createInlineInput = (x, y, onEnter) => {
    // Fix the offset issue by adding 120px to x coordinate
    setInlineInput({
      visible: true,
      x: x + 120,
      y,
      callback: onEnter
    });
  };

  // Handle input submission
  const handleInputSubmit = (e) => {
    if (e.key === 'Enter' && inlineInput.visible) {
      const value = e.target.value;
      if (inlineInput.callback) {
        inlineInput.callback(value);
      }
      setInlineInput({ visible: false, x: 0, y: 0, callback: null });
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setInlineInput({ visible: false, x: 0, y: 0, callback: null });
  };

  // Event handlers
  const handleCanvasDoubleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createInlineInput(x, y, (val) => {
      const label = val.trim().toUpperCase() || `V${verts.length + 1}`;
      const newVertex = new Vertex(x, y, label);
      setVerts([...verts, newVertex]);
    });
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    for (const v of verts) {
      // Use standalone hit function instead of method
      if (hit(v, x, y)) {
        if (mode === 'start-pick') {
          setStartV(v);
          setStatus(`Start: ${v.label}`);
          setMode(null);
        } else if (e.shiftKey) {
          setEdgeO(v);
          setDraggingEdge(true);
        } else {
          setDragV(v);
        }
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    if (dragV) {
      const updatedVerts = verts.map(v => {
        if (v.id === dragV.id) {
          return { ...v, x, y };
        }
        return v;
      });
      setVerts(updatedVerts);
      setDragV({ ...dragV, x, y });
    }
  };

  const handleCanvasMouseUp = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Finish dragging a vertex
    if (dragV) {
      setDragV(null);
      return;
    }
    
    // Finish drawing an edge
    if (draggingEdge && edgeO) {
      const u = edgeO;
      let vHit = null;
      
      for (const v of verts) {
        // Use standalone hit function
        if (v.id !== u.id && hit(v, x, y)) {
          vHit = v;
          break;
        }
      }
      
      if (vHit) {
        const midx = (u.x + vHit.x) / 2;
        const midy = (u.y + vHit.y) / 2;
        
        createInlineInput(midx, midy, (val) => {
          let w = parseInt(val);
          if (isNaN(w)) w = 1;
          
          // Check if edge already exists
          const edgeExists = edges.some(e => 
            (e.u.id === u.id && e.v.id === vHit.id) || 
            (e.u.id === vHit.id && e.v.id === u.id)
          );
          
          if (!edgeExists) {
            // Create new edge
            const newEdge = new Edge(u, vHit, w);
            setEdges([...edges, newEdge]);
          }
        });
      }
    }
    
    // Reset drag states
    setDragV(null);
    setDraggingEdge(false);
    setEdgeO(null);
  };

  // Button handlers
  const handlePickStart = () => {
    setMode('start-pick');
    setStatus('Click vertex to set START.');
  };

  // Fixed reset handler
  const handleReset = () => {
    if (algorithmRef.current) {
      clearTimeout(algorithmRef.current);
    }
    
    setVerts([]);
    setEdges([]);
    setStartV(null);
    setStatus('');
    setProgress(0);
    setRunning(false);
    setIsPlaying(false);
    setAlgorithmSteps([]);
    setCurrentStep(0);
  };

  // Apply algorithm state at a specific step
  const applyAlgorithmState = (stepIndex) => {
    if (algorithmSteps.length === 0 || stepIndex < 0 || stepIndex >= algorithmSteps.length) {
      return;
    }
    
    const step = algorithmSteps[stepIndex];
    
    // Apply the state to current vertices
    const updatedVerts = verts.map(v => {
      const vState = step.find(state => state.id === v.id);
      if (vState) {
        return {
          ...v,
          dist: vState.dist,
          visited: vState.visited,
          prev: vState.prev ? verts.find(prev => prev.label === vState.prev) : null
        };
      }
      return v;
    });
    
    setVerts([...updatedVerts]);
    setCurrentStep(stepIndex);
    setProgress(Math.floor((stepIndex / (algorithmSteps.length - 1)) * 100) || 0);
  };

  // Priority Queue display
  const PriorityQueue = () => {
    const sortedVerts = [...verts].sort((a, b) => a.dist - b.dist);
    
    return (
      <div className="pq">
        <h2>Priority Queue</h2>
        <table>
          <thead>
            <tr>
              <th>Vertex</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {sortedVerts.map((v, i) => (
              <tr key={i}>
                <td>{v.label}</td>
                <td>{v.dist === Infinity ? '∞' : v.dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Algorithm code for display
  const algorithmCode = `function dijkstra(graph, start) {
  // Set initial distances
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();
  
  // Initialize all vertices
  for (let vertex in graph) {
    distances[vertex] = Infinity;
    previous[vertex] = null;
    pq.enqueue(vertex, Infinity);
  }
  
  // Set start distance to 0
  distances[start] = 0;
  pq.decreaseKey(start, 0);
  
  // Process vertices
  while (!pq.isEmpty()) {
    let u = pq.dequeue().value;
    
    // For each neighbor of u
    for (let { vertex: v, weight } of graph[u]) {
      let alt = distances[u] + weight;
      if (alt < distances[v]) {
        distances[v] = alt;
        previous[v] = u;
        pq.decreaseKey(v, alt);
      }
    }
  }
  
  return { distances, previous };
}`;

  // Instructions
  const howToUseContent = (
    <div>
      <h3>How to use</h3>
      <ul>
        <li><strong>Add vertex:</strong> double‑click; type name inline.</li>
        <li><strong>Move vertex:</strong> drag it.</li>
        <li><strong>Add edge:</strong> Shift+drag from one vertex to another; enter weight inline.</li>
        <li><strong>Pick start:</strong> click "Pick Start", then click a vertex.</li>
        <li><strong>Reset:</strong> clear all.</li>
      </ul>
    </div>
  );

  // Inputs content
  const inputsContent = (
    <div className="dijkstra-inputs">
      <button onClick={handlePickStart} className="btn-outline">Pick Start</button>
      <button onClick={runDijkstra} className="btn-primary">Run Dijkstra</button>
      <button onClick={handleReset} className="btn-outline">Reset</button>
      <div className="status-display">{status}</div>
    </div>
  );

  // Canvas visualization content
  const visualizationContent = (
    <div 
      ref={containerRef}
      style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <canvas 
        ref={canvasRef}
        width={800}
        height={550}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        style={{ background: 'white', borderRadius: '4px' }}
      />
      
      {inlineInput.visible && (
        <input
          ref={inputRef}
          className="inline-input"
          style={{
            position: 'absolute',
            left: `${inlineInput.x - 20}px`,
            top: `${inlineInput.y - 10}px`,
            width: '40px',
            textAlign: 'center',
            padding: '2px'
          }}
          onKeyDown={handleInputSubmit}
          onBlur={handleInputBlur}
          autoFocus
        />
      )}
    </div>
  );

  // Controls configuration for AlgorithmLayout
  const controlsConfig = {
    onPlay: () => {
      if (!running && startV) {
        runDijkstra();
      } else if (!isPlaying && running) {
        setIsPlaying(true);
      }
    },
    onPause: () => {
      setIsPlaying(false);
    },
    onSpeedChange: (speedLabel) => {
      switch (speedLabel) {
        case '0.5x':
          setSpeed(0.5);
          break;
        case '1x':
          setSpeed(1);
          break;
        case '1.5x':
          setSpeed(1.5);
          break;
        case '2x':
          setSpeed(2);
          break;
        default:
          setSpeed(1);
      }
    },
    onReplay: () => {
      if (startV) {
        if (running) {
          if (algorithmRef.current) {
            clearTimeout(algorithmRef.current);
          }
          setRunning(false);
        }
        
        // Reset vertex states but keep the graph structure
        const updatedVerts = verts.map(v => ({
          ...v,
          dist: Infinity,
          prev: null,
          visited: false
        }));
        
        setVerts([...updatedVerts]);
        setProgress(0);
        setCurrentStep(0);
        
        // Run Dijkstra with short delay
        setTimeout(() => {
          runDijkstra();
        }, 100);
      }
    },
    skipToStart: () => {
      if (algorithmRef.current) {
        clearTimeout(algorithmRef.current);
      }
      
      if (startV) {
        // Reset vertex states but keep the graph structure
        const updatedVerts = verts.map(v => {
          return {
            ...v,
            dist: v.id === startV.id ? 0 : Infinity,
            prev: null,
            visited: false
          };
        });
        
        setVerts([...updatedVerts]);
        setRunning(false);
        setIsPlaying(false);
        setProgress(0);
        
        if (algorithmSteps.length > 0) {
          applyAlgorithmState(0);
        }
      }
    },
    skipToEnd: () => {
      if (algorithmRef.current) {
        clearTimeout(algorithmRef.current);
      }
      
      if (startV) {
        setRunning(false);
        setIsPlaying(false);
        
        if (algorithmSteps.length > 0) {
          // Apply the final state
          applyAlgorithmState(algorithmSteps.length - 1);
        } else {
          // If no steps are stored, just mark everything as visited
          const updatedVerts = verts.map(v => ({
            ...v,
            visited: true
          }));
          setVerts([...updatedVerts]);
          setProgress(100);
        }
      }
    },
    skipNext: () => {
      if (algorithmSteps.length > 0 && currentStep < algorithmSteps.length - 1) {
        applyAlgorithmState(currentStep + 1);
      }
    },
    skipPrev: () => {
      if (algorithmSteps.length > 0 && currentStep > 0) {
        applyAlgorithmState(currentStep - 1);
      }
    },
    onProgressChange: (value) => {
      if (algorithmSteps.length > 0) {
        const stepIndex = Math.min(
          algorithmSteps.length - 1, 
          Math.floor((value / 100) * (algorithmSteps.length - 1))
        );
        applyAlgorithmState(stepIndex);
      }
      setProgress(value);
    },
    isPlaying: isPlaying,
    progress: progress,
    speed: speed
  };
  
  return {
    solutionsComponent: <PriorityQueue />,
    visualizationComponent: visualizationContent,
    inputsComponent: inputsContent,
    howToUseComponent: howToUseContent,
    codeComponent: <pre>{algorithmCode}</pre>,
    controlsConfig: controlsConfig
  };
};

export default DijkstraVisualizer;