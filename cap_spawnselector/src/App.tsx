import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { SpawnSelector } from './components/SpawnSelector';
import { spawnLocations } from './data/locations';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Courier New', monospace;
    background-color: #000;
    color: #d2e6f0;
    overflow: hidden;
  }
`;

const App: React.FC = () => {
	return (
		<>
			<GlobalStyle />
			<SpawnSelector locations={spawnLocations} />
		</>
	);
};

export default App;
