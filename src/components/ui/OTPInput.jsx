import React, { useRef, useEffect } from 'react';

const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);

  useEffect(() => {
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = value.split('');
    newOtp[index] = val.substring(val.length - 1);
    const combinedOtp = newOtp.join('');
    onChange(combinedOtp);

    // Move to next input
    if (val && index < length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0 && inputs.current[index - 1]) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData.padEnd(length, ' ')); // Or just paste what we have
    // Better: simply update parent
    onChange(pastedData);
    if (inputs.current[Math.min(pastedData.length, length) - 1]) {
        inputs.current[Math.min(pastedData.length, length) - 1].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:border-[#6B46C1] focus:ring-2 focus:ring-[#6B46C1]/20 outline-none transition-all"
        />
      ))}
    </div>
  );
};

export default OTPInput;