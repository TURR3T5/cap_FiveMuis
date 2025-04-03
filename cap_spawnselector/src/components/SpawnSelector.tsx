import React, { useState } from 'react';
import styled from 'styled-components';
import { SpawnLocation } from '../types';
import { Terminal } from './Terminal';
import { SpawnMarker } from './SpawnMarker';
import { SystemStatus } from './SystemStatus';

const SelectorContainer = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #11151a;
	color: #d2e6f0;
	font-family: 'Courier New', monospace;
	overflow: hidden;
`;

const Header = styled.div`
	display: flex;
	padding: 15px;
	border-bottom: 1px solid rgba(120, 160, 180, 0.3);
`;

const HeaderTitle = styled.div`
	font-size: 16px;
	font-weight: bold;
	flex: 1;
`;

const HeaderStatus = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
`;

const ContentArea = styled.div`
	display: grid;
	grid-template-columns: 1fr 300px;
	flex: 1;
	overflow: hidden;
`;

const MapContainer = styled.div`
	position: relative;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #0a0d12;
`;

const MapImage = styled.img`
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
`;

const SidePanel = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 15px;
	border-left: 1px solid rgba(120, 160, 180, 0.3);
	background-color: rgba(10, 15, 25, 0.6);
`;

const Footer = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 10px 15px;
	border-top: 1px solid rgba(120, 160, 180, 0.3);
	font-size: 12px;
`;

const Button = styled.button<{ primary?: boolean }>`
	background-color: ${(props) => (props.primary ? 'rgba(40, 120, 180, 0.3)' : 'rgba(40, 40, 40, 0.3)')};
	border: 1px solid ${(props) => (props.primary ? 'rgba(80, 160, 220, 0.6)' : 'rgba(120, 120, 120, 0.6)')};
	color: ${(props) => (props.primary ? 'rgba(210, 230, 240, 0.9)' : 'rgba(180, 180, 180, 0.9)')};
	padding: 8px 16px;
	font-family: 'Courier New', monospace;
	font-size: 12px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => (props.primary ? 'rgba(60, 140, 200, 0.4)' : 'rgba(60, 60, 60, 0.4)')};
		border-color: ${(props) => (props.primary ? 'rgba(100, 180, 240, 0.7)' : 'rgba(140, 140, 140, 0.7)')};
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const StatusText = styled.div`
	font-size: 11px;
	opacity: 0.7;
`;

interface SpawnSelectorProps {
	locations: SpawnLocation[];
}

export const SpawnSelector: React.FC<SpawnSelectorProps> = ({ locations }) => {
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

	const handleSelectLocation = (id: string) => {
		setSelectedLocation(id === selectedLocation ? null : id);
	};

	const selectedLocationData = locations.find((loc) => loc.id === selectedLocation);

	const handleSpawn = () => {
		if (selectedLocation) {
			console.log(`Spawning at location: ${selectedLocation}`);
		}
	};

	return (
		<SelectorContainer>
			<Header>
				<HeaderTitle>[ sBz2 MONITORING AND DATA EXTRACTION TOOL ]</HeaderTitle>
				<HeaderStatus>
					<StatusText>DDTMID: 19.22.10.14</StatusText>
					<StatusText>RETRUMSU</StatusText>
				</HeaderStatus>
			</Header>

			<ContentArea>
				<MapContainer>
					<MapImage src='/map-background.png' alt='Territory Map' />

					{locations.map((location) => (
						<SpawnMarker key={location.id} location={location} selected={location.id === selectedLocation} onClick={handleSelectLocation} />
					))}
				</MapContainer>

				<SidePanel>
					<Terminal title='SYSTEM STATUS' status='online'>
						<SystemStatus selectedLocation={selectedLocationData?.name} />
					</Terminal>

					<Terminal title='LOCATION DETAILS'>
						{selectedLocationData ? (
							<>
								<div style={{ marginBottom: '10px' }}>
									<div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px' }}>{selectedLocationData.name}</div>
									<div>{selectedLocationData.description}</div>
								</div>

								<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
									<div>
										<div>STATUS: {selectedLocationData.status?.toUpperCase() || 'UNKNOWN'}</div>
										<div>SECURITY: MEDIUM</div>
									</div>
									<div>
										<div>POPULATION: 42</div>
										<div>RESOURCES: STABLE</div>
									</div>
								</div>
							</>
						) : (
							<div>No location selected. Please select a spawn point on the map.</div>
						)}
					</Terminal>

					<Terminal title='SYSTEM LOG'>
						<div>[INFO] System initialized</div>
						<div>[INFO] Map data loaded successfully</div>
						<div>[WARNING] Networks [1] offline</div>
						<div>[INFO] Spawn system ready</div>
						{selectedLocationData && <div>[INFO] Location selected: {selectedLocationData.name}</div>}
					</Terminal>
				</SidePanel>
			</ContentArea>

			<Footer>
				<StatusText>RUNNING ON BACKUP POWER</StatusText>
				<div>
					<Button onClick={() => setSelectedLocation(null)} disabled={!selectedLocation}>
						CLEAR SELECTION
					</Button>
					<Button primary onClick={handleSpawn} disabled={!selectedLocation || selectedLocationData?.status === 'offline'} style={{ marginLeft: '10px' }}>
						INITIALIZE SPAWN SEQUENCE
					</Button>
				</div>
			</Footer>
		</SelectorContainer>
	);
};
