import { useState, useEffect } from 'react';

export const LoadingPlaceholder = () => {
  const [error, setError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setError(true), 3_000);

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <div className="fixed w-full h-full flex flex-col justify-center items-center gap-2">
      <div className="text-xl">Loading...</div>
      {error && (
        <div className="text-gray-400 text-sm">
          (this is taking a while, something may be wrong)
        </div>
      )}
    </div>
  );
};
