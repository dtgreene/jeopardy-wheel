import cx from 'classnames';

import styles from './Input.module.css';

export const Input = ({ className, ...other }) => (
  <input
    className={cx(
      'rounded bg-neutral-800 border border-neutral-500 text-inherit outline-none focus:ring-sky-500 focus:border-sky-500 block w-full px-3 py-2 transition-colors',
      styles.input,
      className
    )}
    {...other}
  />
);
