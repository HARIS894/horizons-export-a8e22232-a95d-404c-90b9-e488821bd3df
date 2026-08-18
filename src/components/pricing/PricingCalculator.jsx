import React, { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { InquiryField, InquiryInput, InquiryTextarea } from '@/components/inquiry/InquiryFields';
import { buildWhatsAppUrl } from '@/config/siteConfig';
import { pricingConfig } from '@/components/pricing/pricingData';
import { buildSimplePricingWhatsappMessage, getPostalCodeLabel } from '@/components/pricing/pricingUtils';

const initialValues = { name: '', whatsapp: '', country: 'India', postalCode: '', selectedServices: [], details: '' };

const PricingCalculator = () => {
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const postalCodeLabel = useMemo(() => getPostalCodeLabel(values.country), [values.country]);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleService = (option) => {
    setValues((current) => ({
      ...current,
      selectedServices: current.selectedServices.includes(option)
        ? current.selectedServices.filter((item) => item !== option)
        : [...current.selectedServices, option],
    }));
  };

  const handleConnect = () => {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!values.whatsapp.trim()) nextErrors.whatsapp = 'Please enter your WhatsApp number.';
    if (!values.country.trim()) nextErrors.country = 'Please choose your country.';
    if (!values.postalCode.trim()) nextErrors.postalCode = `Please enter your ${postalCodeLabel.toLowerCase()}.`;
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast({ title: 'Please complete the required details', description: 'We need a few basic details before connecting you on WhatsApp.', variant: 'destructive' });
      return;
    }

    window.open(buildWhatsAppUrl(buildSimplePricingWhatsappMessage(values)), '_blank', 'noopener,noreferrer');
    toast({ title: 'Connecting with InstantCare', description: pricingConfig.connectForm.successMessage });
  };

  return (
    <section id="connect-with-instantcare" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-purple-100 bg-[linear-gradient(135deg,_rgba(245,243,255,0.96)_0%,_rgba(255,255,255,0.98)_50%,_rgba(248,250,252,0.95)_100%)] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">Connect With InstantCare</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{pricingConfig.connectForm.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{pricingConfig.connectForm.subtitle}</p>
            <div className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7C3AED]">Simple customer journey</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {['Service', 'Understand pricing', 'Basic requirement', 'Name and WhatsApp', 'Country and pincode', 'Connect with InstantCare'].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">{item}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <InquiryField label="Name" htmlFor="pricing-name" required error={errors.name}><InquiryInput id="pricing-name" value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Your name" aria-invalid={Boolean(errors.name)} /></InquiryField>
              <InquiryField label="WhatsApp Number" htmlFor="pricing-whatsapp" required error={errors.whatsapp}><InquiryInput id="pricing-whatsapp" value={values.whatsapp} onChange={(event) => updateValue('whatsapp', event.target.value)} placeholder="Your WhatsApp number" inputMode="tel" aria-invalid={Boolean(errors.whatsapp)} /></InquiryField>
              <InquiryField label="Your Country" htmlFor="pricing-country" required error={errors.country} hint="Start typing and choose the country that fits your location.">
                <><InquiryInput id="pricing-country" list="pricing-country-options" value={values.country} onChange={(event) => updateValue('country', event.target.value)} placeholder="Select country" aria-invalid={Boolean(errors.country)} /><datalist id="pricing-country-options">{pricingConfig.connectForm.countryOptions.map((country) => <option key={country} value={country} />)}</datalist></>
              </InquiryField>
              <InquiryField label={postalCodeLabel} htmlFor="pricing-postal" required error={errors.postalCode}><InquiryInput id="pricing-postal" value={values.postalCode} onChange={(event) => updateValue('postalCode', event.target.value)} placeholder={postalCodeLabel} aria-invalid={Boolean(errors.postalCode)} /></InquiryField>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4"><h3 className="text-lg font-semibold text-slate-950">What do you need help with?</h3><p className="text-sm text-slate-500">Optional</p></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {pricingConfig.connectForm.supportOptions.map((option) => {
                  const isSelected = values.selectedServices.includes(option);
                  return <button key={option} type="button" onClick={() => toggleService(option)} aria-pressed={isSelected} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${isSelected ? 'border-[#7C3AED] bg-purple-50 text-[#6D28D9] shadow-[0_10px_25px_rgba(124,58,237,0.10)]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-200 hover:bg-white'}`}>{option}</button>;
                })}
              </div>
            </div>

            <div className="mt-8"><InquiryField label="Tell us briefly what you need" htmlFor="pricing-details"><InquiryTextarea id="pricing-details" value={values.details} onChange={(event) => updateValue('details', event.target.value)} placeholder="Tell us briefly what you need so our team can contact you on WhatsApp with suitable care options and pricing." className="min-h-[140px]" /></InquiryField></div>
            <div className="mt-8 rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-5"><p className="text-sm font-semibold text-slate-900">Thank you. Our team will review your requirement and connect with you on WhatsApp with suitable options, availability and pricing.</p></div>
            <Button type="button" onClick={handleConnect} className="mt-6 h-12 w-full rounded-full bg-[#7C3AED] text-base font-semibold text-white hover:bg-[#6D28D9]" aria-label="Connect on WhatsApp"><MessageCircle className="mr-2 h-4 w-4" />{pricingConfig.connectForm.submitLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;
