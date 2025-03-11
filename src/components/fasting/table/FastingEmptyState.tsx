
import React from 'react';

const FastingEmptyState: React.FC = () => {
  return (
    <div className="p-8 text-center border rounded-lg">
      <p className="text-gray-500">No fasting logs yet. Start a fast to begin tracking.</p>
    </div>
  );
};

export default FastingEmptyState;
