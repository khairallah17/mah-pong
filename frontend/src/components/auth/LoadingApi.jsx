import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingApi = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-opacity-50 bg-gray-100">
      <div className="animate-pulse">
        <Loader2 
          className="animate-spin text-blue-600" 
          size={64} 
          strokeWidth={3}
        />
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-semibold text-blue-800 animate-bounce">
          Loading...
        </h2>
        <p className="mt-2 text-blue-600 animate-pulse">
          Please wait while we prepare everything
        </p>
      </div>
      <div className="absolute bottom-10 w-full max-w-md h-1 bg-blue-200 bg-opacity-50 overflow-hidden">
        <div className="h-full bg-blue-600 animate-progress-bar"></div>
      </div>
    </div>
  );
}


export default LoadingApi
