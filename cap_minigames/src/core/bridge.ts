import { MinigameConfig, MinigameResult, FiveMBridge } from './types';

export const createFiveMBridge = (): FiveMBridge => {
  const isDev = process.env.NODE_ENV === 'development';
  
  const sendResult = (gameId: string, result: MinigameResult): void => {
    if (isDev) {
      console.log('DEV: Game result sent to FiveM:', { gameId, result });
      return;
    }
    
    /* fetch(`https://${GetParentResourceName()}/gameResult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ 
        gameId, 
        ...result 
      })
    }).catch(err => console.error('Error sending result to FiveM:', err)); */
  };
  
  const onGameRequest = (callback: (gameId: string, config: MinigameConfig) => void): void => {
    if (isDev) {
      console.log('DEV: Registered game request listener');
      return;
    }

    window.addEventListener('message', (event) => {
      if (event.data.action === 'startGame') {
        const { gameId, config } = event.data;
        callback(gameId, config);
      }
    });
  };
  
  const debugStartGame = (gameId: string, config: MinigameConfig): void => {
    if (isDev) {
      console.log('DEV: Starting game via debug interface:', { gameId, config });
    }
  };
  
  return {
    sendResult,
    onGameRequest,
    debugStartGame
  };
};

export const fiveMBridge = createFiveMBridge();