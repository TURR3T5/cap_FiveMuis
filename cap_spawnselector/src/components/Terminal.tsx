import React from 'react';
import styled from 'styled-components';

const TerminalContainer = styled.div`
	background-color: rgba(0, 0, 0, 0.85);
	border: 1px solid rgba(120, 160, 180, 0.4);
	color: rgba(210, 230, 240, 0.9);
	font-family: 'Courier New', monospace;
	font-size: 12px;
	padding: 8px 12px;
	overflow: auto;
	max-height: 100%;
	box-shadow: 0 0 15px rgba(80, 180, 220, 0.3);
`;

const TerminalHeader = styled.div`
	border-bottom: 1px solid rgba(120, 160, 180, 0.4);
	padding-bottom: 8px;
	margin-bottom: 8px;
	font-weight: bold;
	display: flex;
	justify-content: space-between;
`;

const StatusBox = styled.div<{ status?: string }>`
	background-color: ${(props) => (props.status === 'online' ? 'rgba(40, 180, 40, 0.3)' : props.status === 'offline' ? 'rgba(180, 40, 40, 0.3)' : 'rgba(120, 120, 120, 0.3)')};
	padding: 2px 6px;
	border: 1px solid ${(props) => (props.status === 'online' ? 'rgba(40, 180, 40, 0.6)' : props.status === 'offline' ? 'rgba(180, 40, 40, 0.6)' : 'rgba(120, 120, 120, 0.6)')};
`;

interface TerminalProps {
	title: string;
	status?: 'online' | 'offline';
	children: React.ReactNode;
}

export const Terminal: React.FC<TerminalProps> = ({ title, status, children }) => {
	return (
		<TerminalContainer>
			<TerminalHeader>
				<div>[ {title} ]</div>
				{status && <StatusBox status={status}>{status.toUpperCase()}</StatusBox>}
			</TerminalHeader>
			{children}
		</TerminalContainer>
	);
};
