import cx from 'classnames';
import { forwardRef } from 'react';

import styles from './Button.module.css';

export const Button = forwardRef(({ className, variant, ...other }, ref) => (
  <button
    ref={ref}
    className={cx(
      'rounded transition select-none focus:outline-none whitespace-nowrap',
      styles[variant],
      className
    )}
    {...other}
  />
));
