import { useEffect, useState } from 'react';
import cx from 'classnames';

import styles from './ChristmasLights.module.css';

const spacing = 64;

export const ChristmasLights = () => {
  const [cols, setCols] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setCols(createArray(Math.floor(window.innerWidth / spacing)));
      setRows(createArray(Math.floor(window.innerHeight / spacing) - 1));
    };

    window.addEventListener('resize', handleResize, false);

    handleResize();

    return () => window.removeEventListener('resize', handleResize, false);
  }, []);

  return (
    <>
      <LightGroup items={cols} />
      <LightGroup items={rows} orientation="col" />
      <LightGroup items={rows} orientation="col" position="end" />
      <LightGroup items={cols} position="end" />
    </>
  );
};

const LightGroup = ({ items, orientation = 'row', position = 'start' }) => (
  <div className={cx(styles.lightGroup, styles[orientation], styles[position])}>
    {items.map((value) => (
      <div key={value} className={styles.container}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          className={styles.wire}
        >
          <path
            fill="none"
            stroke="#294b29"
            strokeWidth="2"
            d="M0,32 Q32,64 64,32"
          />
        </svg>
        <div className={styles.socket}></div>
        <div className={styles.bulb}></div>
      </div>
    ))}
  </div>
);

function createArray(length) {
  if (length <= 0) return [];

  return [...Array(length)].map(() => getId());
}

function getId() {
  return (Math.random() + 1).toString(36).substring(7);
}
