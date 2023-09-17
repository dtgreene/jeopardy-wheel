import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import cx from 'classnames';

import { Button } from '../Button';

const Dropdown = ({ label, children }) => (
  <Menu as="div" className="relative inline-block text-left">
    {({ open }) => (
      <>
        <div>
          <Menu.Button
            as={Button}
            variant="secondaryOutline"
            className="flex items-center gap-1"
          >
            <span>{label}</span>
            <ChevronDownIcon
              width={24}
              height={24}
              className={cx('transition', { '-rotate-180': open })}
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="mt-2 text-white absolute left-0 rounded bg-neutral-800 shadow-lg focus:outline-none py-1 border border-neutral-500">
            {children}
          </Menu.Items>
        </Transition>
      </>
    )}
  </Menu>
);

Dropdown.Button = ({ children, ...other }) => (
  <Menu.Item as={Fragment}>
    <button
      className={cx(
        'w-full text-left transition select-none focus:outline-none whitespace-nowrap px-2 hover:bg-neutral-600'
      )}
      {...other}
    >
      {children}
    </button>
  </Menu.Item>
);

export { Dropdown };
