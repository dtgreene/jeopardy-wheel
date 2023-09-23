import cx from 'classnames';

import styles from './SpinButton.module.css';

export const SpinButton = ({ className, children, ...other }) => (
  <button className={cx(styles.base, className)} {...other}>
    <span className={styles.front}>{children}</span>
  </button>
);
