import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
        <p className="text-gray-600">If you can see this styled, Tailwind is working!</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestPage;