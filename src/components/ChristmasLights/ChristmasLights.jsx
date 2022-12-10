import { useEffect, useState } from 'react';
import cx from 'classnames';

import styles from './ChristmasLights.module.css';

const spacing = 64;
const root = document.querySelector(':root');
root.style.setProperty('--light-spacing', `${spacing}px`);

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
      <LightRow cols={cols} />
      <LightColumn rows={rows} />
      <LightColumn rows={rows} end />
      <LightRow cols={cols} end />
    </>
  );
};

const LightRow = ({ cols, end } = { cols: [], end: false }) => (
  <div
    className={cx('fixed pointer-events-none flex justify-center items-center w-full left-0', {
      'bottom-0': end,
      'top-0': !end,
    })}
  >
    {cols.map((value) => (
      <div key={value} className={cx(styles.container, styles.row)}>
        <div
          className={cx(styles.socket, {
            'bottom-0': end,
            'top-0': !end,
          })}
        ></div>
        <div className={styles.bulb}></div>
      </div>
    ))}
  </div>
);

const LightColumn = ({ rows, end } = { rows: [], end: false }) => (
  <div
    className={cx(
      'fixed pointer-events-none flex justify-center items-center h-full flex-col top-0',
      {
        'left-0': end,
        'right-0': !end,
      }
    )}
  >
    {rows.map((value) => (
      <div key={value} className={cx(styles.container, styles.col)}>
        <div
          className={cx(styles.socket, {
            'left-0': end,
            'right-0': !end,
          })}
        ></div>
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
