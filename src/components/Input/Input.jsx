import cx from 'classnames';

import styles from './Input.module.css';

export const Input = ({ className, ...other }) => (
  <input
    className={cx(
      'rounded bg-gray-800 border border-gray-600 text-inherit outline-none focus:ring-blue-600 focus:border-blue-600 block w-full px-3 py-2 transition-colors',
      styles.input,
      className
    )}
    {...other}
  />
);
