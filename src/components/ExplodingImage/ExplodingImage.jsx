import { useRef, useState } from 'react';

import ExplosionImage from 'src/assets/images/explosion.gif';

const EXPLODE_TIME = 600;

export const ExplodingImage = ({ src, width, height }) => {
  const [explode, setExplode] = useState(false);
  const [done, setDone] = useState(false);

  const timeout = useRef(null);

  const handleImageClick = () => {
    if (!timeout.current) {
      setExplode(true);
      timeout.current = setTimeout(() => {
        setDone(true);
      }, EXPLODE_TIME);
    }
  };

  if (done) return null;

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      onClick={handleImageClick}
    >
      <img src={src} width={width} height={height} />
      {explode && (
        <img
          src={ExplosionImage}
          width={width}
          height={height}
          className="absolute z-10"
        />
      )}
    </div>
  );
};
