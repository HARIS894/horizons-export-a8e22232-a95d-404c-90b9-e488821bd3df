export const getPostalCodeLabel = (country) => {
  return country === 'India' ? 'Pincode' : 'Postal Code';
};

export const buildSimplePricingWhatsappMessage = ({
  name,
  whatsapp,
  country,
  postalCode,
  selectedServices,
  details,
}) => {
  return [
    'Hello InstantCare Team,',
    '',
    'I would like to discuss care/support for my family.',
    '',
    `Name: ${name || 'Not provided'}`,
    `WhatsApp: ${whatsapp || 'Not provided'}`,
    `Country: ${country || 'Not provided'}`,
    `${country === 'India' ? 'Pincode' : 'Postal Code'}: ${postalCode || 'Not provided'}`,
    '',
    'Services Required:',
    selectedServices.length ? selectedServices.join(', ') : 'Not provided',
    '',
    'Additional Requirement:',
    details || 'Not provided',
    '',
    'Please contact me on WhatsApp to discuss suitable options, availability and pricing.',
  ].join('\n');
};
