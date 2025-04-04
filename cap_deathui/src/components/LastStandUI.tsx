import React, { useState, useEffect } from 'react';
import { Box, Text } from '@mantine/core';

interface LastStandProps {
	initialTime?: number;
	onRequestHelp?: () => void;
	onRespawn?: () => void;
}

const LastStandUI: React.FC<LastStandProps> = ({
	initialTime = 300, // 5 minutes in seconds
	onRequestHelp = () => console.log('Help requested'),
	onRespawn = () => console.log('Respawn requested'),
}) => {
	const [timeLeft, setTimeLeft] = useState(initialTime);
	const [isTimerExpired, setIsTimerExpired] = useState(false);
	const [_isHelpRequested, setIsHelpRequested] = useState(false);
	const [isEHeld, setIsEHeld] = useState(false);
	const [eHoldProgress, setEHoldProgress] = useState(0);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === 'g' && !isTimerExpired) {
				setIsHelpRequested(true);
				onRequestHelp();
			}

			if (e.key.toLowerCase() === 'e' && isTimerExpired && !isEHeld) {
				setIsEHeld(true);
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === 'e') {
				setIsEHeld(false);
				setEHoldProgress(0);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [isTimerExpired, isEHeld, onRequestHelp, onRespawn]);

	useEffect(() => {
		if (timeLeft <= 0) {
			setIsTimerExpired(true);
			return;
		}

		const timer = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [timeLeft]);

	useEffect(() => {
		if (!isEHeld) return;

		const holdTime = 2000; // 2 seconds to hold
		const interval = 50; // Update progress every 50ms
		const step = (interval / holdTime) * 100;

		const progressTimer = setInterval(() => {
			setEHoldProgress((prev) => {
				const newProgress = prev + step;
				if (newProgress >= 100) {
					clearInterval(progressTimer);
					onRespawn();
					return 100;
				}
				return newProgress;
			});
		}, interval);

		return () => clearInterval(progressTimer);
	}, [isEHeld, onRespawn]);

	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;

	return (
		<>
			<Box
				style={{
					margin: 0,
					height: '100vh',
					width: '100vw',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
					position: 'relative',
					backgroundColor: '#00000088',
					boxShadow: 'inset 0px 0px 120px 100px rgba(0,0,0,0.6)',
					fontFamily: '"Poppins", sans-serif',
				}}
			>
				{/* Diamond container */}
				<Box
					style={{
						top: '34.5%',
						width: '110px',
						height: '110px',
						transform: 'rotate(45deg)',
						overflow: 'hidden',
						position: 'relative',
					}}
				>
					{/* Diamond inner */}
					<Box
						className='diamond-border-1'
						style={{
							width: '100%',
							height: '100%',
							position: 'absolute',
							top: 0,
							left: 0,
							transform: 'rotate(180deg)',
							background: 'linear-gradient(rgba(197, 82, 82, 0), rgba(197, 82, 82, 0)) 50% 50%/calc(100% - 4px) calc(100% - 4px) no-repeat, linear-gradient(135deg, rgba(197, 82, 82, 0) 60%, rgba(197, 82, 82, 0.65) 100%) no-repeat',
							borderRadius: '0px',
						}}
					/>

					{/* Diamond border */}
					<Box
						className='diamond-border-2'
						style={{
							width: '100%',
							height: '100%',
							position: 'absolute',
							top: 0,
							left: 0,
							transform: 'rotate(90deg)',
							borderRadius: '0px',
						}}
					/>

					{/* Skull icon */}
					<Box
						style={{
							color: '#ceb6b6',
							fontSize: '1.5em',
							position: 'absolute',
							opacity: 0.7,
							transform: 'rotate(-45deg)',
							marginTop: '18px',
							marginLeft: '16px',
						}}
					>
						<i className='fas fa-skull'></i>
					</Box>
				</Box>

				{/* Main text */}
				<Box
					style={{
						textAlign: 'center',
						position: 'absolute',
						bottom: '10%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				>
					<Text
						style={{
							color: '#C55252',
							fontSize: '2em',
							fontFamily: '"Poppins", sans-serif',
							fontWeight: 600,
							fontStyle: 'normal',
							textShadow: '0px 0px 31px rgba(197, 82, 82, 1)',
						}}
					>
						Du er bevidstløs
					</Text>
				</Box>

				{/* Information text */}
				<Box
					style={{
						textAlign: 'center',
						position: 'absolute',
						bottom: '10%',
						left: '50%',
						transform: 'translateX(-50%)',
					}}
				>
					<Text
						style={{
							color: '#83878d',
							fontSize: '0.7em',
							fontFamily: '"Poppins", sans-serif',
							fontWeight: 500,
							fontStyle: 'normal',
						}}
					>
						{!isTimerExpired ? (
							'Du er bevidstløs. Vær så venlig at vent på en læge, alt bliver godt.'
						) : (
							<span style={{ fontSize: '1em', fontWeight: 500, fontStyle: 'normal' }}>
								Hold <span style={{ color: '#C55252', fontSize: '1.05em' }}>E (5)</span> to respawn or wait for the <span style={{ color: '#C55252', fontSize: '1.05em' }}>EMS</span>.
							</span>
						)}
					</Text>
				</Box>

				{/* Timer */}
				<Box
					style={{
						textAlign: 'center',
						position: 'absolute',
						bottom: '2%',
						left: '50%',
						transform: 'translateX(-50%)',
					}}
				>
					<Box
						style={{
							color: isTimerExpired ? '#C55252' : '#83878d',
							fontSize: '2em',
							fontFamily: '"Poppins", sans-serif',
							fontWeight: 500,
							fontStyle: 'normal',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<TimeBox value={Math.floor(minutes / 10)} />
						<TimeBox value={minutes % 10} />
						<Box
							style={{
								margin: '30px 5px',
								fontSize: '0.6em',
								color: '#83878d',
							}}
						>
							:
						</Box>
						<TimeBox value={Math.floor(seconds / 10)} />
						<TimeBox value={seconds % 10} />
					</Box>
				</Box>

				{/* E Hold Progress Bar (conditionally rendered) */}
				{isTimerExpired && isEHeld && (
					<Box
						style={{
							position: 'absolute',
							bottom: '7%',
							left: '50%',
							transform: 'translateX(-50%)',
							width: '200px',
							height: '4px',
							backgroundColor: 'rgba(0, 0, 0, 0.5)',
							borderRadius: '2px',
							overflow: 'hidden',
						}}
					>
						<Box
							style={{
								width: `${eHoldProgress}%`,
								height: '100%',
								backgroundColor: '#C55252',
								transition: 'width 0.05s linear',
							}}
						/>
					</Box>
				)}
			</Box>
		</>
	);
};

const TimeBox: React.FC<{ value: number }> = ({ value }) => {
	return (
		<Box
			style={{
				background: '#85858554',
				color: '#fff',
				fontSize: '0.8em',
				margin: '14px 5px',
				padding: '10px',
				borderRadius: '5px',
				width: '40px',
				border: '1px solid #ffffff17',
			}}
		>
			{value}
		</Box>
	);
};

export default LastStandUI;
