// frontend/src/App.js
import React from 'react';
// Import HashRouter instead of BrowserRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import LandingPage from './components/Landing/LandingPage';
import './App.css';
import DijkstraVisualizer from './visualizer/algorithms/dijkstra/DijkstraPage';
import AlgorithmLayout from './components/Layouts/AlgorithmLayout';
import NQueenPage from './visualizer/algorithms/nqueen/NQueenPage';
import BubbleSort from './visualizer/algorithms/bubblesort/BubbleSort';
import SelectionSort from './visualizer/algorithms/selectionsort/SelectionSort';
import BinarySearch from './visualizer/algorithms/binarysearch/BinarySearch';
import Knapsack from './visualizer/algorithms/knapsack/Knapsack';
import Profile from './components/user/profile';


const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/visualizer/:algorithm" element={<LandingPage />} />
          <Route path="/dijkstra" element={<DijkstraVisualizer />} />
          <Route path="/lay" element={<AlgorithmLayout />} />
          <Route path="/algorithms/nqueens" element={<NQueenPage />} />
          <Route path="/algorithms/bubble" element={<BubbleSort />} />
          <Route path="/algorithms/selection" element={<SelectionSort />} />
          <Route path="/algorithms/binary" element={<BinarySearch />} />
          <Route path="/algorithms/knapsack" element={<Knapsack />} />
          
         
        </Routes>
      </div>
    </Router>
  );
};

export default App;