import React from 'react';
import AlgorithmLayout from '../../../components/Layouts/AlgorithmLayout';
import DijkstraVisualizer from './DijkstraVisualizer';

const DijkstraPage = () => {
  // Get all the components and configs from the visualizer
  const {
    solutionsComponent,
    visualizationComponent,
    inputsComponent,
    howToUseComponent,
    codeComponent,
    controlsConfig
  } = DijkstraVisualizer();

  return (
    <AlgorithmLayout
      title="Dijkstra's Algorithm Visualizer"
      solutionsContent={solutionsComponent}
      visualizationContent={visualizationComponent}
      howToUseContent={howToUseComponent}
      codeContent={codeComponent}
      controlsConfig={controlsConfig}
      inputsContent={inputsComponent}
    />
  );
};

export default DijkstraPage;