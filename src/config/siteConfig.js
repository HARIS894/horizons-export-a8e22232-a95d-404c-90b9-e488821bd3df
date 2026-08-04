export const siteContact = {
  phoneDisplay: '+91 89489 89353',
  phoneHref: 'tel:+918948989353',
  whatsappNumber: '918948989353',
  email: 'instantnurseservice@gmail.com',
  supportEmail: 'support@instantcare.in',
  primaryDomain: 'https://instantcare.in',
};

export const buildWhatsAppUrl = (message) => {
  return `https://wa.me/${siteContact.whatsappNumber}?text=${encodeURIComponent(message)}`;
};