import { useState } from 'react';

export default function GamePage() {
  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [complexity, setComplexity] = useState<'easy' | 'medium' | 'hard'>('medium');

  const startGame = () => {
    setView('game');
  };

  if (view === 'lobby') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Spades Card Game</h1>
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Complexity</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="complexity"
                value="easy"
                checked={complexity === 'easy'}
                onChange={() => setComplexity('easy')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Easy</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="complexity"
                value="medium"
                checked={complexity === 'medium'}
                onChange={() => setComplexity('medium')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Medium</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="complexity"
                value="hard"
                checked={complexity === 'hard'}
                onChange={() => setComplexity('hard')}
                className="h-4 w-4 text-indigo-600"
              />
              <span>Hard</span>
            </label>
          </div>
          <button
            onClick={startGame}
            className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <GameView complexity={complexity} onExit={() => setView('lobby')} />
    </div>
  );
}

// Placeholder for the actual game view
function GameView({ complexity, onExit }: { complexity: 'easy' | 'medium' | 'hard'; onExit: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold">Spades Game</h1>
        <div className="flex items-center space-x-3">
          <span className="text-gray-600">Complexity: {complexity}</span>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Exit to Lobby
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
        <h2 className="text-xl font-semibold mb-4 text-center">Game View (Placeholder)</h2>
        <p className="text-gray-500 text-center">
          Game implementation will go here. This is where the Spades game logic and UI will be implemented.
        </p>
      </div>
    </div>
  );
}