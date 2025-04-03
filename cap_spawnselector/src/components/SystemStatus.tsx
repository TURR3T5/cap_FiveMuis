import React from 'react';
import styled from 'styled-components';

const StatusContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 11px;
`;

const StatusItem = styled.div`
	display: flex;
	justify-content: space-between;
`;

const StatusLabel = styled.span`
	color: rgba(180, 200, 210, 0.7);
`;

const StatusValue = styled.span<{ highlight?: boolean }>`
	color: ${(props) => (props.highlight ? '#44FFFF' : 'rgba(210, 230, 240, 0.9)')};
	font-weight: ${(props) => (props.highlight ? 'bold' : 'normal')};
`;

interface SystemStatusProps {
	selectedLocation?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ selectedLocation }) => {
	return (
		<StatusContainer>
			<StatusItem>
				<StatusLabel>[CAPACITY]:</StatusLabel>
				<StatusValue>450/620 [UPGRADES]</StatusValue>
			</StatusItem>
			<StatusItem>
				<StatusLabel>[EFFICIENCY]:</StatusLabel>
				<StatusValue>0.8 [NORMAL]</StatusValue>
			</StatusItem>
			<StatusItem>
				<StatusLabel>[BATTERY]:</StatusLabel>
				<StatusValue highlight>LARGE [RUNNING]</StatusValue>
			</StatusItem>
			<StatusItem>
				<StatusLabel>[CONTROL_PANEL]:</StatusLabel>
				<StatusValue>TRUE</StatusValue>
			</StatusItem>
			<StatusItem>
				<StatusLabel>[CONNECTION]:</StatusLabel>
				<StatusValue>TRUE [CONNECTED]</StatusValue>
			</StatusItem>
			<StatusItem>
				<StatusLabel>[SPAWN_LOCATION]:</StatusLabel>
				<StatusValue highlight>{selectedLocation || 'NOT_SELECTED'}</StatusValue>
			</StatusItem>
		</StatusContainer>
	);
};
