import classNames from 'classnames';

import styles from './Button.module.css';

export const Button = ({ className, disabled, variant, ...other }) => (
  <button
    className={classNames(
      'rounded transition duration-500 ease select-none focus:outline-none focus:shadow-outline',
      { 'opacity-50': disabled },
      styles[variant],
      className
    )}
    disabled={disabled}
    {...other}
  />
);
