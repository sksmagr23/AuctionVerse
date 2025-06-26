import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loader = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[30vh]">
    <FaSpinner className="animate-spin text-4xl text-[#FCA311] mb-4" />
    <span className="text-lg font-medium text-[#14213D]">{message}</span>
  </div>
);

export default Loader; 