import React from 'react';
import { AlertCircle, Paperclip, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const baseInputClassName = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-[#7C3AED]/10';

const InquiryField = ({ label, htmlFor, required = false, error, hint, children }) => (
  <div className="space-y-2">
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">
      {label}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
    {children}
    {error ? (
      <p className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3.5 w-3.5" />
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-slate-500">{hint}</p>
    ) : null}
  </div>
);

const InquiryInput = ({ className, ...props }) => (
  <input {...props} className={cn(baseInputClassName, className)} />
);

const InquirySelect = ({ className, children, ...props }) => (
  <select {...props} className={cn(baseInputClassName, className)}>
    {children}
  </select>
);

const InquiryTextarea = ({ className, ...props }) => (
  <textarea {...props} className={cn(baseInputClassName, 'min-h-[120px] resize-none', className)} />
);

const InquiryFileUpload = ({ id, label, accept, files, onChange, onRemove, hint, error }) => (
  <InquiryField label={label} htmlFor={id} hint={hint} error={error}>
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">Drop files here or browse manually</p>
        <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG and common document formats up to 2 MB each.</p>
        <input id={id} type="file" accept={accept} multiple className="hidden" onChange={onChange} />
        <label htmlFor={id} className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9]">
          <Paperclip className="h-4 w-4" /> Choose files
        </label>
      </div>

      {files.length ? (
        <div className="mt-5 space-y-3">
          {files.map((file) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <div>
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</p>
              </div>
              <button type="button" onClick={() => onRemove(file)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500" aria-label={`Remove ${file.name}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </InquiryField>
);

export {
  InquiryField,
  InquiryFileUpload,
  InquiryInput,
  InquirySelect,
  InquiryTextarea,
};