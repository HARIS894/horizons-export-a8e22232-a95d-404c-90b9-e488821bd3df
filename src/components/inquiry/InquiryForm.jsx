import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock3, Loader2, Mail, MapPinned, MessageCircle, Navigation, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { serviceCatalog } from '@/data/serviceCatalog';
import {
  inquiryBudgetOptions,
  inquiryGenderOptions,
  inquiryInitialValues,
  inquiryLanguageOptions,
  inquiryStorage,
  submitInquiry,
  validateInquiryFiles,
} from '@/utils/inquiryUtils';
import {
  InquiryField,
  InquiryFileUpload,
  InquiryInput,
  InquirySelect,
  InquiryTextarea,
} from '@/components/inquiry/InquiryFields';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const successOrbs = [
  'left-6 top-8 h-20 w-20 bg-emerald-200/40',
  'right-10 top-14 h-16 w-16 bg-sky-200/40',
  'left-20 bottom-10 h-14 w-14 bg-purple-200/40',
  'right-16 bottom-12 h-24 w-24 bg-amber-200/30',
];

const validateForm = (values) => {
  const nextErrors = {};

  if (values.name.trim().length < 3) nextErrors.name = 'Enter the full name of the enquirer.';
  if (!values.country.trim()) nextErrors.country = 'Country is required.';
  if (!/^\+?[0-9\s-]{10,15}$/.test(values.phone.trim())) nextErrors.phone = 'Enter a valid mobile number.';
  if (!/^\+?[0-9\s-]{10,15}$/.test(values.whatsapp.trim())) nextErrors.whatsapp = 'Enter a valid WhatsApp number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = 'Enter a valid email address.';
  if (values.patientName.trim().length < 3) nextErrors.patientName = 'Enter the patient name.';
  if (!values.patientAge || Number(values.patientAge) <= 0 || Number(values.patientAge) > 120) nextErrors.patientAge = 'Enter a valid patient age.';
  if (!values.gender) nextErrors.gender = 'Select the patient gender.';
  if (!values.city.trim()) nextErrors.city = 'City is required.';
  if (!/^\d{6}$/.test(values.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit PIN code.';
  if (values.currentLocation.trim().length < 5) nextErrors.currentLocation = 'Add the current location or address.';
  if (!values.preferredLanguage) nextErrors.preferredLanguage = 'Select a preferred language.';
  if (!values.preferredService) nextErrors.preferredService = 'Select a service.';
  if (values.medicalCondition.trim().length < 10) nextErrors.medicalCondition = 'Summarize the medical condition in at least 10 characters.';
  if (!values.preferredDate) nextErrors.preferredDate = 'Select the preferred date.';
  if (!values.preferredTime.trim()) nextErrors.preferredTime = 'Enter the preferred time.';
  if (!values.privacyAccepted) nextErrors.privacyAccepted = 'You must authorize InstantCare to contact you.';

  const fileError = validateInquiryFiles(values);
  if (fileError) nextErrors.medicalReports = fileError;

  return nextErrors;
};

const InquiryForm = ({
  source = 'contact-page',
  title = 'Create a Care Inquiry',
  description = 'Tell us about the care you need and our team will contact you.',
  hideContainer = false,
  hideIntro = false,
  initialOverrides = null,
  onSubmitted,
}) => {
  const { toast } = useToast();
  const [values, setValues] = useState(inquiryInitialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(null);
  const serviceOptions = useMemo(() => [...serviceCatalog].sort((left, right) => left.title.localeCompare(right.title)), []);

  useEffect(() => {
    const draft = inquiryStorage.loadDraft();
    if (draft) {
      setValues({ ...inquiryInitialValues, ...draft, medicalReports: [] });
    }
  }, []);

  useEffect(() => {
    if (initialOverrides && Object.keys(initialOverrides).length > 0) {
      setValues((current) => ({ ...current, ...initialOverrides }));
    }
  }, [initialOverrides]);

  useEffect(() => {
    const { medicalReports, ...draftableValues } = values;
    inquiryStorage.saveDraft(draftableValues);
  }, [values]);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (errors.medicalReports && field === 'medicalReports') {
      setErrors((current) => ({ ...current, medicalReports: undefined }));
    }
  };

  const handleFileChange = (field) => (event) => {
    const nextFiles = Array.from(event.target.files || []);
    updateValue(field, [...values[field], ...nextFiles]);
    event.target.value = '';
  };

  const handleFileRemove = (field) => (fileToRemove) => {
    updateValue(field, values[field].filter((file) => !(file.name === fileToRemove.name && file.size === fileToRemove.size && file.lastModified === fileToRemove.lastModified)));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Location unavailable', description: 'This browser does not support location lookup.', variant: 'destructive' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateValue('currentLocation', `Lat ${coords.latitude.toFixed(5)}, Lng ${coords.longitude.toFixed(5)}`);
        updateValue('gpsLocation', {
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
          accuracy: Math.round(coords.accuracy || 0),
          capturedAt: new Date().toISOString(),
        });
        toast({ title: 'Location captured', description: 'Coordinates were added to the enquiry.' });
      },
      () => {
        toast({ title: 'Location blocked', description: 'Please enter the current location manually.', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const openOutboundLinks = (emailLink, whatsappLink) => {
    const anchor = document.createElement('a');
    anchor.href = emailLink;
    anchor.click();
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast({ title: 'Please review the form', description: 'Some required details are missing or invalid.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const result = await submitInquiry({ ...values, source });
      setSuccessState(result);
      inquiryStorage.clearDraft();
      setValues(inquiryInitialValues);
      toast({ title: 'Inquiry saved', description: 'Your enquiry has been received and our team can follow up.' });
      openOutboundLinks(result.emailLink, result.whatsappLink);
      onSubmitted?.(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast({ title: 'Submission failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(inquiryInitialValues);
    setErrors({});
    inquiryStorage.clearDraft();
  };

  if (successState) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_rgba(255,255,255,1)_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fdfb_100%)] p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)] sm:p-10">
        {successOrbs.map((orbClassName) => (
          <motion.div key={orbClassName} className={`absolute rounded-full blur-2xl ${orbClassName}`} animate={{ y: [0, -8, 0], opacity: [0.5, 0.9, 0.5] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: 'easeInOut' }} />
        ))}
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div initial={{ scale: 0.7, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white text-emerald-600 shadow-[0_20px_40px_rgba(16,185,129,0.18)]">
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-green-600">Inquiry Received</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">Your healthcare inquiry is ready for follow-up.</h3>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your enquiry has been received, and our team can follow up right away by email or WhatsApp.
          </p>

          <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 text-left sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Inquiry ID</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{successState.inquiry.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preferred Date</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{successState.inquiry.preferredDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preferred Service</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{successState.inquiry.preferredService}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Uploaded Files</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{successState.inquiry.attachments.length}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/80 bg-white/80 p-5 text-left shadow-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preferred Time</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{successState.inquiry.preferredTime}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Patient</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{successState.inquiry.patientName}, {successState.inquiry.patientAge}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Follow-Up</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Support team notified</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full bg-[#7C3AED] px-6 py-5 text-base font-semibold text-white hover:bg-[#6D28D9]">
              <a href={successState.emailLink}>
                <Mail className="mr-2 h-4 w-4" /> Email Support
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-green-200 bg-white px-6 py-5 text-base font-semibold text-green-700 hover:bg-green-50">
              <a href={successState.whatsappLink} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Enquiry
              </a>
            </Button>
          </div>

          <Button type="button" variant="ghost" className="mt-6 rounded-full px-6 py-4 text-sm font-semibold text-slate-700" onClick={() => setSuccessState(null)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Submit another inquiry
          </Button>
        </div>
      </motion.div>
    );
  }

  const content = (
    <>
      {!hideIntro ? (
        <>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Care Inquiry</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Priority review</p>
                  <p className="text-xs leading-6 text-slate-600">Your care needs, timing and notes are captured clearly for our team.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Preferred timing</p>
                  <p className="text-xs leading-6 text-slate-600">Choose the date and time that work best for your care request.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Complete details</p>
                  <p className="text-xs leading-6 text-slate-600">Share reports, doctor details and hospital information that may help our team assist you.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <form onSubmit={handleSubmit} className={`${hideIntro ? '' : 'mt-8 '}space-y-8`}>
        <div className="grid gap-6 md:grid-cols-2">
          <InquiryField label="Full Name" htmlFor="inquiry-name" required error={errors.name}>
            <InquiryInput id="inquiry-name" value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Full name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
          </InquiryField>
          <InquiryField label="Country" htmlFor="inquiry-country" required error={errors.country}>
            <InquiryInput id="inquiry-country" value={values.country} onChange={(event) => updateValue('country', event.target.value)} placeholder="Country of residence" aria-invalid={Boolean(errors.country)} />
          </InquiryField>
          <InquiryField label="Mobile Number" htmlFor="inquiry-phone" required error={errors.phone}>
            <InquiryInput id="inquiry-phone" value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="Primary mobile number" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
          </InquiryField>
          <InquiryField label="WhatsApp Number" htmlFor="inquiry-whatsapp" required error={errors.whatsapp}>
            <InquiryInput id="inquiry-whatsapp" value={values.whatsapp} onChange={(event) => updateValue('whatsapp', event.target.value)} placeholder="WhatsApp number" inputMode="tel" aria-invalid={Boolean(errors.whatsapp)} />
          </InquiryField>
          <InquiryField label="Email" htmlFor="inquiry-email" required error={errors.email}>
            <InquiryInput id="inquiry-email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} placeholder="name@example.com" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
          </InquiryField>
          <InquiryField label="Patient Name" htmlFor="inquiry-patient-name" required error={errors.patientName}>
            <InquiryInput id="inquiry-patient-name" value={values.patientName} onChange={(event) => updateValue('patientName', event.target.value)} placeholder="Patient full name" aria-invalid={Boolean(errors.patientName)} />
          </InquiryField>
          <InquiryField label="Patient Age" htmlFor="inquiry-patient-age" required error={errors.patientAge}>
            <InquiryInput id="inquiry-patient-age" value={values.patientAge} onChange={(event) => updateValue('patientAge', event.target.value)} placeholder="Age in years" type="number" min="0" max="120" aria-invalid={Boolean(errors.patientAge)} />
          </InquiryField>
          <InquiryField label="Gender" htmlFor="inquiry-gender" required error={errors.gender}>
            <InquirySelect id="inquiry-gender" value={values.gender} onChange={(event) => updateValue('gender', event.target.value)} aria-invalid={Boolean(errors.gender)}>
              <option value="">Select gender</option>
              {inquiryGenderOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </InquirySelect>
          </InquiryField>
          <InquiryField label="City" htmlFor="inquiry-city" required error={errors.city}>
            <InquiryInput id="inquiry-city" value={values.city} onChange={(event) => updateValue('city', event.target.value)} placeholder="City" aria-invalid={Boolean(errors.city)} />
          </InquiryField>
          <InquiryField label="PIN Code" htmlFor="inquiry-pincode" required error={errors.pincode}>
            <InquiryInput id="inquiry-pincode" value={values.pincode} onChange={(event) => updateValue('pincode', event.target.value)} placeholder="6-digit PIN code" inputMode="numeric" maxLength={6} aria-invalid={Boolean(errors.pincode)} />
          </InquiryField>
          <InquiryField label="Preferred Language" htmlFor="inquiry-language" required error={errors.preferredLanguage}>
            <InquirySelect id="inquiry-language" value={values.preferredLanguage} onChange={(event) => updateValue('preferredLanguage', event.target.value)} aria-invalid={Boolean(errors.preferredLanguage)}>
              {inquiryLanguageOptions.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </InquirySelect>
          </InquiryField>
          <InquiryField label="Service Required" htmlFor="inquiry-service" required error={errors.preferredService}>
            <InquirySelect id="inquiry-service" value={values.preferredService} onChange={(event) => updateValue('preferredService', event.target.value)} aria-invalid={Boolean(errors.preferredService)}>
              <option value="">Select a service</option>
              {serviceOptions.map((service) => (
                <option key={service.slug} value={service.title}>{service.title}</option>
              ))}
            </InquirySelect>
          </InquiryField>
          <InquiryField label="Preferred Date" htmlFor="inquiry-date" required error={errors.preferredDate}>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <InquiryInput id="inquiry-date" value={values.preferredDate} onChange={(event) => updateValue('preferredDate', event.target.value)} type="date" min={getTodayDate()} className="pr-12" aria-invalid={Boolean(errors.preferredDate)} />
            </div>
          </InquiryField>
          <InquiryField label="Preferred Time" htmlFor="inquiry-time" required error={errors.preferredTime}>
            <InquiryInput id="inquiry-time" value={values.preferredTime} onChange={(event) => updateValue('preferredTime', event.target.value)} placeholder="e.g. Today 6:30 PM or Tomorrow morning" aria-invalid={Boolean(errors.preferredTime)} />
          </InquiryField>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <InquiryField label="Current Location" htmlFor="inquiry-location" required error={errors.currentLocation} hint="Add the address manually or capture device coordinates.">
            <div className="space-y-3">
              <InquiryTextarea id="inquiry-location" value={values.currentLocation} onChange={(event) => updateValue('currentLocation', event.target.value)} placeholder="Current address, landmark, or geolocation coordinates" className="min-h-[100px]" aria-invalid={Boolean(errors.currentLocation)} />
              <Button type="button" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={handleUseCurrentLocation}>
                <Navigation className="mr-2 h-4 w-4" /> Use current location
              </Button>
              {values.gpsLocation ? <p className="text-xs text-slate-500">GPS captured: {values.gpsLocation.latitude}, {values.gpsLocation.longitude} ({values.gpsLocation.accuracy} m accuracy)</p> : null}
            </div>
          </InquiryField>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Why we ask for location</p>
                <p className="text-xs leading-6 text-slate-600">Location helps us check service coverage, route medical staff, and plan urgent follow-up more accurately.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <InquiryField label="Budget" htmlFor="inquiry-budget" required error={errors.budget}>
            <InquirySelect id="inquiry-budget" value={values.budget} onChange={(event) => updateValue('budget', event.target.value)} aria-invalid={Boolean(errors.budget)}>
              <option value="">Select budget range</option>
              {inquiryBudgetOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </InquirySelect>
          </InquiryField>
          <InquiryField label="Hospital Name" htmlFor="inquiry-hospital">
            <InquiryInput id="inquiry-hospital" value={values.hospitalName} onChange={(event) => updateValue('hospitalName', event.target.value)} placeholder="Optional current or recent hospital" />
          </InquiryField>
          <InquiryField label="Doctor Name" htmlFor="inquiry-doctor">
            <InquiryInput id="inquiry-doctor" value={values.doctorName} onChange={(event) => updateValue('doctorName', event.target.value)} placeholder="Optional treating doctor" />
          </InquiryField>
          <InquiryField label="Medical Condition" htmlFor="inquiry-condition" required error={errors.medicalCondition}>
            <InquiryTextarea id="inquiry-condition" value={values.medicalCondition} onChange={(event) => updateValue('medicalCondition', event.target.value)} placeholder="Diagnosis, current symptoms, discharge status, or care concerns" className="min-h-[132px]" aria-invalid={Boolean(errors.medicalCondition)} />
          </InquiryField>
          <InquiryField label="Additional Notes" htmlFor="inquiry-notes">
            <InquiryTextarea id="inquiry-notes" value={values.additionalNotes} onChange={(event) => updateValue('additionalNotes', event.target.value)} placeholder="Anything else the care team should know before calling you" className="min-h-[132px]" />
          </InquiryField>
        </div>

        <InquiryFileUpload
          id="medical-reports-upload"
          label="Upload Medical Reports"
          accept=".pdf,.jpg,.jpeg,.png"
          files={values.medicalReports}
          onChange={handleFileChange('medicalReports')}
          onRemove={handleFileRemove('medicalReports')}
          hint="Upload reports, scans, discharge summaries or lab results for faster triage."
          error={errors.medicalReports}
        />

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={values.privacyAccepted} onChange={(event) => updateValue('privacyAccepted', event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
            <span className="text-sm leading-7 text-slate-600">
              I authorize InstantCare to review this enquiry, contact me by phone, email or WhatsApp, and let the care coordination team review uploaded medical documents.
            </span>
          </label>
          {errors.privacyAccepted ? <p className="mt-2 text-xs text-red-600">{errors.privacyAccepted}</p> : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading} className="rounded-full bg-[#7C3AED] px-6 py-5 text-base font-semibold text-white hover:bg-[#6D28D9]">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting inquiry...</> : 'Submit Inquiry'}
          </Button>
          <Button type="button" variant="outline" className="rounded-full border-slate-200 bg-white px-6 py-5 text-base font-semibold text-slate-700 hover:bg-slate-50" onClick={handleReset}>
            Reset form
          </Button>
        </div>
      </form>
    </>
  );

  return hideContainer ? content : <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-10">{content}</div>;
};

export default InquiryForm;