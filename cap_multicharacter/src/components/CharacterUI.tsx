import { useState } from 'react';
import { Container, Title, Text, Button, Box, TextInput, Slider, Group, NumberInput } from '@mantine/core';
import { GenderMale, GenderFemale, Check, X, CaretRight } from '@phosphor-icons/react';

export interface Character {
	id: string;
	name: string;
	appearance: {
		gender: 'male' | 'female';
		height?: number;
		skin?: number;
		hair?: {
			style: number;
			color: number;
			highlight: number;
		};
		eyes?: number;
		features?: {
			[key: string]: number;
		};
		clothes?: {
			[key: string]: number;
		};
	};
	backstory?: string;
	lastPlayed: Date;
	level: number;
	cash: number;
	bank: number;
	job: string;
}

interface CharacterSelectorProps {
	characters: Character[];
	onSelect: (character: Character) => void;
	onCreateNew: () => void;
	onDeleteCharacter?: (id: string) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ characters, onSelect, onCreateNew }) => {
	const [selectedChar, setSelectedChar] = useState<Character | null>(null);

	const handleSelect = (character: Character) => {
		setSelectedChar(character);
		onSelect(character);
	};

	return (
		<Box style={{ backgroundColor: '#141414', minHeight: '100vh', width: '100%', padding: '20px' }}>
			<Container size='xs' p={0} style={{ marginLeft: 0, marginRight: 'auto' }}>
				<Title style={{ color: 'white', fontSize: '32px', fontWeight: 700 }} mb={10}>
					SELECT YOUR CHARACTER
				</Title>

				<Box style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
					{characters.map((character) => (
						<Box
							key={character.id}
							style={{
								backgroundColor: '#1a1a1a',
								borderRadius: '8px',
								overflow: 'hidden',
								border: selectedChar?.id === character.id ? '2px solid #ff9900' : '1px solid #252525',
								cursor: 'pointer',
							}}
							onClick={() => handleSelect(character)}
						>
							<Box style={{ display: 'flex', padding: '16px' }}>
								<Box
									style={{
										backgroundColor: '#272727',
										width: '60px',
										height: '60px',
										marginRight: '16px',
										borderRadius: '4px',
									}}
								/>
								<Box>
									<Text style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>{character.name}</Text>
									<Group mt={5}>
										<Text style={{ color: '#6b6b6b', fontSize: '14px' }}>${character.cash.toLocaleString()}</Text>
										<Text style={{ color: '#6b6b6b', fontSize: '14px' }}>${character.bank.toLocaleString()}</Text>
									</Group>
								</Box>
							</Box>
						</Box>
					))}
				</Box>

				<Box mt={30}>
					<Button
						style={{
							backgroundColor: '#ff9900',
							width: '100%',
							height: '50px',
							border: 'none',
							borderRadius: '4px',
							color: 'white',
							fontWeight: 700,
							textTransform: 'uppercase',
							position: 'relative',
						}}
						onClick={onCreateNew}
					>
						CREATE CHARACTER
						<Box
							style={{
								position: 'absolute',
								right: '16px',
								backgroundColor: 'rgba(255, 255, 255, 0.1)',
								borderRadius: '4px',
								width: '30px',
								height: '30px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<CaretRight size={18} />
						</Box>
					</Button>
				</Box>
			</Container>
		</Box>
	);
};

interface CharacterCreatorProps {
	onSave: (character: Omit<Character, 'id' | 'lastPlayed'>) => void;
	onCancel: () => void;
}

type BirthDateType = {
	day: number | '';
	month: number | '';
	year: number | '';
};

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave }) => {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		gender: 'male' as 'male' | 'female',
		height: 175,
		birthDate: { day: '', month: '', year: '' } as BirthDateType,
	});

	const [validations, setValidations] = useState({
		firstName: null as boolean | null,
		lastName: null as boolean | null,
		gender: true as boolean,
		height: true as boolean,
		birthDate: null as boolean | null,
	});

	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (field === 'firstName' || field === 'lastName') {
			setValidations((prev) => ({
				...prev,
				[field]: value.length >= 2 && value.length <= 16,
			}));
		}

		if (field === 'birthDate') {
			const { day, month, year } = value;
			const isValid = day !== '' && month !== '' && year !== '';
			setValidations((prev) => ({
				...prev,
				birthDate: isValid,
			}));
		}
	};

	const handleSave = () => {
		if (validations.firstName && validations.lastName) {
			const newCharacter = {
				name: `${formData.firstName} ${formData.lastName}`,
				appearance: {
					gender: formData.gender,
					height: formData.height,
				},
				backstory: '',
				level: 1,
				cash: 500,
				bank: 5000,
				job: 'Unemployed',
			};

			onSave(newCharacter);
		}
	};

	const handleGenderChange = (gender: 'male' | 'female') => {
		setFormData((prev) => ({
			...prev,
			gender,
		}));
	};

	const fieldContainerStyle = {
		position: 'relative' as const,
		backgroundColor: '#1a1a1a',
		borderRadius: '8px',
		padding: '16px',
		marginBottom: '16px',
	};

	const validationIconContainerStyle = {
		position: 'absolute' as const,
		top: 'calc(50% - 12px)',
		right: '16px',
		width: '24px',
		height: '24px',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	};

	return (
		<Box style={{ backgroundColor: '#141414', minHeight: '100vh', width: '100%', padding: '20px' }}>
			<Container size='xs' p={0} style={{ marginLeft: 0, marginRight: 'auto' }}>
				<Group style={{ alignItems: 'flex-start' }}>
					<Title style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>REGISTRATION</Title>
					<Box
						style={{
							backgroundColor: '#ff9900',
							padding: '8px',
							borderRadius: '4px',
							color: 'black',
							fontWeight: 700,
						}}
					>
						CHARACTER
					</Box>
				</Group>

				<Text
					style={{
						color: '#6b6b6b',
						fontSize: '12px',
						textTransform: 'uppercase',
						marginTop: '10px',
						marginBottom: '30px',
						lineHeight: 1.5,
					}}
				>
					HELLO, FRIEND! BEFORE YOU START THE GAME, CREATE A CHARACTER AND ALSO ENJOY THE GAME ON THE SERVER, IT WILL BE NICE FOR YOU AND US!
				</Text>

				{}
				<Box style={fieldContainerStyle}>
					<Text style={{ color: '#6b6b6b', fontSize: '12px', marginBottom: '8px' }}>First name</Text>
					<TextInput
						value={formData.firstName}
						onChange={(e) => handleChange('firstName', e.target.value)}
						placeholder='Enter first name'
						styles={{
							input: {
								border: 'none',
								backgroundColor: 'transparent',
								color: 'white',
								fontSize: '16px',
								padding: '0',
								height: 'auto',
							},
							wrapper: {
								height: 'auto',
							},
						}}
					/>
					{validations.firstName !== null && <Box style={validationIconContainerStyle}>{validations.firstName ? <Check weight='bold' size={16} color='#4CAF50' /> : <X weight='bold' size={16} color='#F44336' />}</Box>}
				</Box>

				{}
				<Box style={fieldContainerStyle}>
					<Text style={{ color: '#6b6b6b', fontSize: '12px', marginBottom: '8px' }}>Last name</Text>
					<TextInput
						value={formData.lastName}
						onChange={(e) => handleChange('lastName', e.target.value)}
						placeholder='Enter last name'
						styles={{
							input: {
								border: 'none',
								backgroundColor: 'transparent',
								color: 'white',
								fontSize: '16px',
								padding: '0',
								height: 'auto',
							},
							wrapper: {
								height: 'auto',
							},
						}}
					/>
					{validations.lastName !== null && <Box style={validationIconContainerStyle}>{validations.lastName ? <Check weight='bold' size={16} color='#4CAF50' /> : <X weight='bold' size={16} color='#F44336' />}</Box>}
				</Box>

				{}
				<Group style={{ gap: '10px', marginBottom: '16px' }} align='flex-start' wrap='nowrap'>
					{}
					<Box
						style={{
							...fieldContainerStyle,
							marginBottom: 0,
							width: '80px',
							height: '60px',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
						}}
					>
						<Text style={{ color: '#6b6b6b', fontSize: '12px' }}>Sex</Text>
						<Box
							style={{
								...validationIconContainerStyle,
								top: 'calc(50% - 12px)',
								right: '8px',
							}}
						>
							<Check weight='bold' size={16} color='#4CAF50' />
						</Box>
					</Box>

					{}
					<Box style={{ display: 'flex', gap: '10px', flex: 1 }}>
						<Box
							style={{
								width: '60px',
								height: '60px',
								backgroundColor: formData.gender === 'male' ? '#2d4da1' : '#1e2130',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
							onClick={() => handleGenderChange('male')}
						>
							<GenderMale size={24} color='white' />
						</Box>
						<Box
							style={{
								width: '60px',
								height: '60px',
								backgroundColor: formData.gender === 'female' ? '#913d88' : '#1e2130',
								borderRadius: '4px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
							onClick={() => handleGenderChange('female')}
						>
							<GenderFemale size={24} color='white' />
						</Box>
					</Box>
				</Group>

				{}
				<Box style={fieldContainerStyle}>
					<Text style={{ color: '#6b6b6b', fontSize: '12px', marginBottom: '8px' }}>Height</Text>

					<Group justify='space-between' mb={5}>
						<Box style={{ width: '80%' }}>
							<Slider
								value={formData.height}
								onChange={(value) => handleChange('height', value)}
								min={150}
								max={200}
								step={1}
								styles={{
									track: { backgroundColor: '#333' },
									bar: { backgroundColor: '#ff9900' },
									thumb: {
										backgroundColor: '#ff9900',
										borderColor: '#ff9900',
										width: '12px',
										height: '12px',
									},
								}}
							/>
						</Box>
						<Text style={{ color: 'white', fontSize: '14px', textAlign: 'right', width: '60px' }}>{formData.height} CM</Text>
					</Group>

					<Box
						style={{
							...validationIconContainerStyle,
							top: 'calc(50% - 12px)',
							right: '16px',
						}}
					>
						<Check weight='bold' size={16} color='#4CAF50' />
					</Box>
				</Box>

				{}
				<Box style={{ marginBottom: '30px' }}>
					<Text style={{ color: '#6b6b6b', fontSize: '12px', marginBottom: '8px' }}>Birth Date</Text>
					<Group style={{ gap: '10px' }}>
						<Box
							style={{
								...validationIconContainerStyle,
								position: 'relative',
								top: '30px',
								left: '-10px',
								marginRight: '-10px',
							}}
						>
							{validations.birthDate !== null ? <Check weight='bold' size={16} color='#4CAF50' /> : <Check weight='bold' size={16} color='#4CAF50' />}
						</Box>
						<NumberInput
							placeholder='DD'
							min={1}
							max={31}
							value={formData.birthDate.day}
							onChange={(value) => handleChange('birthDate', { ...formData.birthDate, day: value })}
							hideControls
							styles={{
								input: {
									backgroundColor: '#1a1a1a',
									border: 'none',
									color: 'white',
									textAlign: 'center',
									height: '60px',
									width: '70px',
								},
								wrapper: { width: '70px' },
							}}
						/>
						<NumberInput
							placeholder='MM'
							min={1}
							max={12}
							value={formData.birthDate.month}
							onChange={(value) => handleChange('birthDate', { ...formData.birthDate, month: value })}
							hideControls
							styles={{
								input: {
									backgroundColor: '#1a1a1a',
									border: 'none',
									color: 'white',
									textAlign: 'center',
									height: '60px',
									width: '70px',
								},
								wrapper: { width: '70px' },
							}}
						/>
						<NumberInput
							placeholder='YYYY'
							min={1900}
							max={2005}
							value={formData.birthDate.year}
							onChange={(value) => handleChange('birthDate', { ...formData.birthDate, year: value })}
							hideControls
							styles={{
								input: {
									backgroundColor: '#1a1a1a',
									border: 'none',
									color: 'white',
									textAlign: 'center',
									height: '60px',
									width: '70px',
								},
								wrapper: { width: '70px' },
							}}
						/>
					</Group>
				</Box>

				{}
				<Button
					style={{
						backgroundColor: '#ff9900',
						width: '100%',
						height: '50px',
						border: 'none',
						borderRadius: '4px',
						color: 'white',
						fontWeight: 700,
						textTransform: 'uppercase',
						position: 'relative',
					}}
					onClick={handleSave}
					disabled={!validations.firstName || !validations.lastName}
				>
					CREATE CHARACTER
					<Box
						style={{
							position: 'absolute',
							right: '16px',
							backgroundColor: 'rgba(255, 255, 255, 0.1)',
							borderRadius: '4px',
							width: '30px',
							height: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<CaretRight size={18} />
					</Box>
				</Button>
			</Container>
		</Box>
	);
};
