import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingApi = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      <div className="animate-pulse">
        <Loader2 
          className="animate-spin text-white" 
          size={150} 
          strokeWidth={3}
        />
      </div>
      <div className="mt-6 text-center">
        <h2 className="text-2xl font-semibold text-white animate-bounce">
          Loading...
        </h2>
        <p className="mt-2 text-white animate-pulse">
          Please wait while we prepare everything
        </p>
      </div>
      <div className="absolute bottom-10 w-full max-w-md h-1 bg-blue-200 bg-opacity-50 overflow-hidden">
        <div className="h-full bg-white animate-progress-bar"></div>
      </div>
    </div>
  );
}


export default LoadingApi
