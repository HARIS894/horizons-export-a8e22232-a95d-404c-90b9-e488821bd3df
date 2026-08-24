import React from 'react';

const InstantCareLogoMark = ({ className = '', title = 'InstantCare logo' }) => {
  return (
    <img
      src="/instantcare-logo.png"
      alt={title}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
};

export default InstantCareLogoMark;