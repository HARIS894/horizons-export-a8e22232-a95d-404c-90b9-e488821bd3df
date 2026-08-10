import React from 'react';
import { AlertTriangle, CheckCircle2, Clock3, PauseCircle, Shield, Sparkles, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { META_STATUS_META, META_TEMPLATE_STATUSES, TEMPLATE_STATUS_META, TEMPLATE_STATUSES } from '../types/templateTypes';

const iconMap = {
  [TEMPLATE_STATUSES.DRAFT]: Sparkles,
  [TEMPLATE_STATUSES.VALIDATING]: Clock3,
  [TEMPLATE_STATUSES.READY_TO_SUBMIT]: Shield,
  [TEMPLATE_STATUSES.SUBMITTED]: Clock3,
  [TEMPLATE_STATUSES.PENDING]: Clock3,
  [TEMPLATE_STATUSES.APPROVED]: CheckCircle2,
  [TEMPLATE_STATUSES.REJECTED]: XCircle,
  [TEMPLATE_STATUSES.PAUSED]: PauseCircle,
  [TEMPLATE_STATUSES.DISABLED]: AlertTriangle,
  [META_TEMPLATE_STATUSES.NOT_SUBMITTED]: Sparkles,
  [META_TEMPLATE_STATUSES.PENDING]: Clock3,
  [META_TEMPLATE_STATUSES.APPROVED]: CheckCircle2,
  [META_TEMPLATE_STATUSES.REJECTED]: XCircle,
  [META_TEMPLATE_STATUSES.PAUSED]: PauseCircle,
  [META_TEMPLATE_STATUSES.DISABLED]: AlertTriangle,
};

const TemplateStatusBadge = ({ status, kind = 'local' }) => {
  const source = kind === 'meta' ? META_STATUS_META : TEMPLATE_STATUS_META;
  const fallbackKey = kind === 'meta' ? META_TEMPLATE_STATUSES.NOT_SUBMITTED : TEMPLATE_STATUSES.DRAFT;
  const config = source[status] || source[fallbackKey];
  const Icon = iconMap[status] || iconMap[fallbackKey];

  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default TemplateStatusBadge;