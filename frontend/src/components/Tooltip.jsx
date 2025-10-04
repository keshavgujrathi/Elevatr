import React, { useState } from 'react';
import { Info } from 'lucide-react';

const Tooltip = ({ text, children, darkMode }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children || <Info className="w-4 h-4 text-slate-400" />}
      </div>
      {show && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {text}
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;