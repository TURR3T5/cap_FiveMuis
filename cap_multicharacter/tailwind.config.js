/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				terminal: {
					black: '#0d0d0d',
					dark: '#111111',
					gray: '#1e1e1e',
					green: '#3cb371',
					blue: '#4682b4',
					purple: '#800080',
					red: '#cd5c5c',
					yellow: '#ffd700',
					cyan: '#40e0d0',
					'bright-green': '#00ff00',
					'dark-blue': '#27374d',
				},
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'monospace'],
				digital: ['VT323', 'monospace'],
			},
			boxShadow: {
				terminal: '0 0 10px rgba(0, 255, 0, 0.5)',
				'terminal-blue': '0 0 10px rgba(70, 130, 180, 0.5)',
				'terminal-red': '0 0 10px rgba(205, 92, 92, 0.5)',
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'terminal-scan': 'terminalScan 2s linear infinite',
			},
			keyframes: {
				terminalScan: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' },
				},
			},
		},
	},
	plugins: [],
};
