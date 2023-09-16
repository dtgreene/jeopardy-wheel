import cx from 'classnames';

import styles from './Input.module.css';

export const Input = ({ className, ...other }) => (
  <input className={cx(styles.input, className)} {...other} />
);
