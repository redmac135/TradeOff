import React from 'react';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to TradeOff
          </h1>
          <p className="text-lg text-gray-600">
            Your Stock Market Simulator Game
          </p>
        </div>
      </main>
    </div>
  );
}

export default App
