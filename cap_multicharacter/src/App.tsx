import React, { useState, useEffect } from 'react';
import { CharacterSelector, CharacterCreator, Character } from './components/CharacterUI';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
	const [characters, setCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState(true);
	const [view, setView] = useState<'selector' | 'creator'>('creator');

	useEffect(() => {
		const loadCharacters = async () => {
			try {
				// For development, load mock data
				const mockCharacters: Character[] = [
					{
						id: '1',
						name: 'John Doe',
						appearance: {
							gender: 'male',
							height: 180,
						},
						lastPlayed: new Date(Date.now() - 3600000 * 24),
						level: 10,
						cash: 5000,
						bank: 25000,
						job: 'Mechanic',
					},
					{
						id: '2',
						name: 'Jane Smith',
						appearance: {
							gender: 'female',
							height: 170,
						},
						lastPlayed: new Date(Date.now() - 3600000 * 48),
						level: 15,
						cash: 7500,
						bank: 50000,
						job: 'Lawyer',
					},
				];

				setCharacters(mockCharacters);
				setLoading(false);
			} catch (error) {
				console.error('Failed to load characters:', error);
				setLoading(false);
			}
		};

		loadCharacters();
	}, []);

	const handleSelectCharacter = (character: Character) => {
		const updatedCharacters = characters.map((char) => {
			if (char.id === character.id) {
				return {
					...char,
					lastPlayed: new Date(),
				};
			}
			return char;
		});

		setCharacters(updatedCharacters);

		console.log('Character selected:', character);
		// This is where you would send a message to the FiveM server
	};

	const handleCreateCharacter = () => {
		setView('creator');
	};

	const handleDeleteCharacter = (id: string) => {
		const updatedCharacters = characters.filter((char) => char.id !== id);
		setCharacters(updatedCharacters);
		console.log('Character deleted:', id);
	};

	const handleSaveCharacter = (characterData: Omit<Character, 'id' | 'lastPlayed'>) => {
		const newCharacter: Character = {
			...characterData,
			id: uuidv4(),
			lastPlayed: new Date(),
		};

		const updatedCharacters = [...characters, newCharacter];
		setCharacters(updatedCharacters);
		setView('selector');

		console.log('Character created:', newCharacter);
		// This is where you would send a message to the FiveM server
	};

	const handleCancelCreate = () => {
		setView('selector');
	};

	if (loading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					backgroundColor: '#141414',
					color: 'white',
				}}
			>
				Loading...
			</div>
		);
	}

	return <>{view === 'selector' ? <CharacterSelector characters={characters} onSelect={handleSelectCharacter} onCreateNew={handleCreateCharacter} onDeleteCharacter={handleDeleteCharacter} /> : <CharacterCreator onSave={handleSaveCharacter} onCancel={handleCancelCreate} />}</>;
};

export default App;
