import cx from 'classnames';

import styles from './Button.module.css';

export const Button = ({ className, disabled, variant, ...other }) => (
  <button
    className={cx(
      'rounded transition select-none focus:outline-none whitespace-nowrap',
      { 'opacity-50': disabled },
      styles[variant],
      className
    )}
    disabled={disabled}
    {...other}
  />
);
