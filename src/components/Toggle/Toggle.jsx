import cx from 'classnames';

import styles from './Toggle.module.css';

export const Toggle = ({ className, disabled, inputProps = {}, name }) => (
  <label
    className={cx(
      styles.switch,
      'relative inline-block w-12 h-6 select-none transition-opacity',
      { 'opacity-50': disabled },
      className
    )}
  >
    <input
      type="checkbox"
      className="hidden w-0 h-0"
      {...inputProps}
      disabled={disabled}
    />
    <span
      className={cx(
        styles.slider,
        'absolute rounded-full top-0 right-0 bottom-0 left-0 bg-neutral-600 transition-colors',
        { 'cursor-pointer': !disabled }
      )}
    ></span>
  </label>
);
