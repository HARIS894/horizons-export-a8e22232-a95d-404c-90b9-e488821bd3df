import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CONTACT_PATIENT_STATUS_META, WHATSAPP_STATUS_META } from '../types/contactTypes';

const formatDateTime = (value) => {
  if (!value) {
    return 'No activity';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const ContactsTable = ({ contacts, selectedIds, onToggleAll, onToggleOne, onOpenContact, getAssignedStaffName }) => {
  const allSelected = contacts.length > 0 && contacts.every((contact) => selectedIds.includes(contact.id));

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/90 dark:bg-slate-900/70">
            <TableHead className="w-14"><Checkbox checked={allSelected} onCheckedChange={onToggleAll} /></TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>WhatsApp Status</TableHead>
            <TableHead>Contact Type</TableHead>
            <TableHead>Patient Status</TableHead>
            <TableHead>Assigned Staff</TableHead>
            <TableHead>Last Interaction</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => {
            const initials = contact.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
            const whatsappMeta = WHATSAPP_STATUS_META[contact.whatsappStatus] || WHATSAPP_STATUS_META.dormant;
            const patientMeta = CONTACT_PATIENT_STATUS_META[contact.patientStatus] || CONTACT_PATIENT_STATUS_META['not-linked'];

            return (
              <TableRow key={contact.id} className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/45" onClick={() => onOpenContact(contact.id)}>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox checked={selectedIds.includes(contact.id)} onCheckedChange={() => onToggleOne(contact.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <AvatarFallback className="rounded-2xl bg-emerald-600 font-semibold text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-950 dark:text-white">{contact.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{contact.email || 'No email'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em] ${whatsappMeta.className}`}>
                    {whatsappMeta.label}
                  </Badge>
                </TableCell>
                <TableCell>{contact.contactType}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em] ${patientMeta.className}`}>
                    {patientMeta.label}
                  </Badge>
                </TableCell>
                <TableCell>{getAssignedStaffName(contact.assignedStaffId)}</TableCell>
                <TableCell>{formatDateTime(contact.lastInteraction)}</TableCell>
                <TableCell>{contact.source}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <Button type="button" variant="ghost" size="sm" className="rounded-full text-slate-500 dark:text-slate-300" onClick={() => onOpenContact(contact.id)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
