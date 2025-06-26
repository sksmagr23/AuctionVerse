import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

const Button = ({
  children,
  to,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  const Comp = to ? Link : 'button';

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return {
          base: 'text-[#14213D] bg-[#FCA311] border-black shadow-[5px_5px_0px_#000]',
          hover: 'hover:bg-[#eee] hover:text-[#eaa111] hover:border-[#FCA311] hover:shadow-[5px_5px_0px_#fca311]',
          active: 'active:bg-amber-300 active:text-black'
        };
      case 'secondary':
        return {
          base: 'text-[#14213D] bg-[#fff] border-black shadow-[5px_5px_0px_#000]',
          hover: 'hover:bg-[#fca311] hover:text-[#14213D] hover:border-[#14213D] hover:shadow-[5px_5px_0px_#14213d]',
          active: 'active:bg-gray-200 active:text-[#14213D]'
        };
      case 'nav':
        return {
          base: 'text-[#e5e5e5] bg-[#111] border-[#e5e5e5] shadow-[2px_2px_0px_#e5e5e5]',
          hover: 'hover:bg-[#fca311] hover:text-[#14213D] hover:border-[#14213D] hover:shadow-[2px_2px_0px_#14213d]',
          active: 'active:bg-gray-200 active:text-[#14213D]'
        };  
      case 'success':
        return {
          base: 'text-white bg-green-500 border-black shadow-[5px_5px_0px_#fff]',
          hover: 'hover:bg-white hover:text-green-500 hover:border-green-500 hover:shadow-[5px_5px_0px_#22c55e]',
          active: 'active:bg-green-100 active:text-green-600'
        };
      case 'warning':
        return {
          base: 'text-white bg-yellow-500 border-black shadow-[5px_5px_0px_#000]',
          hover: 'hover:bg-white hover:text-yellow-500 hover:border-yellow-500 hover:shadow-[5px_5px_0px_#eab308]',
          active: 'active:bg-yellow-100 active:text-yellow-600'
        };
      default:
        return {
          base: 'text-[#14213D] bg-[#FCA311] border-black shadow-[5px_5px_0px_#000]',
          hover: 'hover:bg-[#eee] hover:text-[#eaa111] hover:border-[#FCA311] hover:shadow-[5px_5px_0px_#fca311]',
          active: 'active:bg-amber-300 active:text-black'
        };
    }
  };

  const variantClasses = getVariantClasses();
  
  const baseClasses = `inline-block px-2 sm:px-3.5 py-1 sm:py-1.5 font-bold text-center no-underline border-2 rounded-sm transition-all duration-300 ease-in-out cursor-pointer ${variantClasses.base}`;
  
  const hoverClasses = variantClasses.hover;
  
  const activeClasses = `${variantClasses.active} active:shadow-none active:translate-y-1`;
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <Comp
      to={to}
      type={to ? undefined : type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        baseClasses,
        hoverClasses,
        activeClasses,
        disabledClasses,
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};

export default Button;