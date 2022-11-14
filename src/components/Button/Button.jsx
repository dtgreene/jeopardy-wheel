import cx from 'classnames';
import { forwardRef } from 'react';

import styles from './Button.module.css';

export const Button = forwardRef(
  ({ className, disabled, variant, ...other }, ref) => (
    <button
      ref={ref}
      className={cx(
        'rounded transition select-none focus:outline-none whitespace-nowrap',
        { 'opacity-50': disabled },
        styles[variant],
        className
      )}
      disabled={disabled}
      {...other}
    />
  )
);
