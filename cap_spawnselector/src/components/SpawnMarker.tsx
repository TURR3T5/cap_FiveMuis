import React, { useState } from 'react';
import styled from 'styled-components';
import { SpawnLocation } from '../types';

const MarkerContainer = styled.div<{ color: string; selected: boolean }>`
	position: absolute;
	width: 24px;
	height: 24px;
	transform: translate(-50%, -50%);
	cursor: pointer;
	transition: all 0.3s ease;
	z-index: 10;

	&:hover {
		transform: translate(-50%, -50%) scale(1.2);
	}
`;

const MarkerIcon = styled.div<{ color: string; selected: boolean }>`
	width: 100%;
	height: 100%;
	border-radius: ${(props) => (props.selected ? '2px' : '50%')};
	background-color: ${(props) => props.color};
	box-shadow: 0 0 10px ${(props) => props.color};
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	&::after {
		content: '';
		position: absolute;
		width: ${(props) => (props.selected ? '14px' : '8px')};
		height: ${(props) => (props.selected ? '14px' : '8px')};
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: ${(props) => (props.selected ? '1px' : '50%')};
	}
`;

const Tooltip = styled.div`
	position: absolute;
	top: calc(100% + 10px);
	left: 50%;
	transform: translateX(-50%);
	background-color: rgba(0, 0, 0, 0.85);
	border: 1px solid rgba(120, 160, 180, 0.5);
	padding: 8px 12px;
	min-width: 150px;
	color: rgba(210, 230, 240, 0.9);
	font-family: 'Courier New', monospace;
	font-size: 12px;
	z-index: 100;
	pointer-events: none;
	white-space: nowrap;
	box-shadow: 0 0 15px rgba(80, 180, 220, 0.3);
`;

const StatusIndicator = styled.span<{ status?: string }>`
	display: inline-block;
	height: 8px;
	width: 8px;
	border-radius: 50%;
	margin-right: 6px;
	background-color: ${(props) => (props.status === 'online' ? '#44FF44' : props.status === 'offline' ? '#FF4444' : props.status === 'restricted' ? '#FFAA44' : '#AAAAAA')};
`;

interface SpawnMarkerProps {
	location: SpawnLocation;
	selected: boolean;
	onClick: (id: string) => void;
}

export const SpawnMarker: React.FC<SpawnMarkerProps> = ({ location, selected, onClick }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<MarkerContainer style={{ left: `${location.x}%`, top: `${location.y}%` }} color={location.color} selected={selected} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onClick={() => onClick(location.id)}>
			<MarkerIcon color={location.color} selected={selected} />

			{showTooltip && (
				<Tooltip>
					<div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
						<StatusIndicator status={location.status} />
						{location.name}
					</div>
					<div>{location.description}</div>
					<div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.7 }}>CLICK TO SELECT SPAWN POINT</div>
				</Tooltip>
			)}
		</MarkerContainer>
	);
};
