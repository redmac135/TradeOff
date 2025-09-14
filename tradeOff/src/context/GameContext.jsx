import { createContext, useContext } from 'react';

// Create the Game Context
export const GameContext = createContext();

// Custom hook to use the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
