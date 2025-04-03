import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, TextInput, Paper } from '@mantine/core';
import { X } from 'lucide-react';

export interface ComboboxOption {
	value: string;
	label: string;
}

export interface ComboboxProps {
	label: string;
	placeholder?: string;
	data: ComboboxOption[];
	value: string | null;
	onChange: (value: string | null) => void;
}

export const SimpleCombobox: React.FC<ComboboxProps> = ({ label, placeholder, data, value, onChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (value) {
			const selectedOption = data.find((item) => item.value === value);
			if (selectedOption) {
				setSearchValue(selectedOption.label);
			}
		} else {
			setSearchValue('');
		}
	}, [value, data]);

	const filteredData = data.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));

	const handleOptionClick = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		onChange(null);
		setSearchValue('');
	};

	return (
		<div style={{ position: 'relative' }} ref={dropdownRef}>
			<Text size='sm' fw={500} mb={5}>
				{label}
			</Text>
			<TextInput
				ref={inputRef}
				placeholder={placeholder}
				value={searchValue}
				onChange={(e) => setSearchValue(e.currentTarget.value)}
				onClick={() => setIsOpen(true)}
				rightSection={
					value ? (
						<div style={{ cursor: 'pointer' }} onClick={handleClear}>
							<X size={16} />
						</div>
					) : null
				}
				styles={{
					input: {
						cursor: 'pointer',
					},
				}}
			/>

			{isOpen && (
				<Paper
					shadow='sm'
					p={0}
					withBorder
					style={{
						position: 'absolute',
						width: '100%',
						maxHeight: '200px',
						overflowY: 'auto',
						zIndex: 1000,
						marginTop: '4px',
						backgroundColor: '#2a2a2a',
						scrollbarWidth: 'none',
					}}
				>
					<div
						style={{
							maxHeight: '200px',
							overflowY: 'auto',
						}}
					>
						{filteredData.length === 0 ? (
							<Text size='sm' c='dimmed' ta='center' py='xs'>
								Nothing found
							</Text>
						) : (
							filteredData.map((item, index) => (
								<Box
									key={item.value}
									p='xs'
									style={{
										cursor: 'pointer',
										backgroundColor: value === item.value ? '#505050' : hoveredIndex === index ? '#3a3a3a' : 'transparent',
										borderRadius: '4px',
										margin: '2px 4px',
										transition: 'background-color 0.15s ease',
									}}
									onClick={() => handleOptionClick(item.value)}
									onMouseEnter={() => setHoveredIndex(index)}
									onMouseLeave={() => setHoveredIndex(null)}
								>
									<Text size='sm'>{item.label}</Text>
								</Box>
							))
						)}
					</div>
				</Paper>
			)}
		</div>
	);
};
