import cx from 'classnames';

import styles from './SpinButton.module.css';

export const SpinButton = ({ className, disabled, children, ...other }) => (
  <button
    className={cx({ 'opacity-50': disabled }, styles.base, className)}
    disabled={disabled}
    {...other}
  >
    <span className={styles.front}>{children}</span>
  </button>
);
