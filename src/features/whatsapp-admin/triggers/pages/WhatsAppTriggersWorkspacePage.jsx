import React, { useMemo, useState } from 'react';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { conversationAutomationStates, executionLogEntries, flowCatalog, triggerEventCatalog, triggerRegistry, triggerWizardDraft, triggerWizardSteps } from '../../automation/data/automationMockData';
import TriggerRegistryTable from '../components/TriggerRegistryTable';
import AutomationHandoffPanel from '../components/AutomationHandoffPanel';
import TriggerWizardPanel from '../components/TriggerWizardPanel';
import FlowExecutionLogsPanel from '../../flows/components/FlowExecutionLogsPanel';

const WhatsAppTriggersWorkspacePage = () => {
  const [selectedTriggerId, setSelectedTriggerId] = useState(triggerRegistry[0]?.id || '');
  const [wizardDraft, setWizardDraft] = useState(triggerWizardDraft);
  const [showExecutionLogs, setShowExecutionLogs] = useState(false);
  const selectedTrigger = triggerRegistry.find((trigger) => trigger.id === selectedTriggerId) || null;
  const relatedLogs = useMemo(() => executionLogEntries.filter((entry) => entry.triggerCode === selectedTrigger?.triggerCode), [selectedTrigger]);

  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200">Trigger Workspace</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Unified Trigger Foundation</h2>
            <span className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">Local / No live execution</span>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">Triggers link stable Trigger Codes to Flow Codes for incoming messages, contacts, patients, appointments, tags, schedules, and payment events. Real event execution stays disabled until a later backend activation phase.</p>
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),420px]">
          <TriggerRegistryTable
            triggers={triggerRegistry}
            selectedTriggerId={selectedTriggerId}
            onSelectTrigger={setSelectedTriggerId}
            onCreateTrigger={() => setWizardDraft(triggerWizardDraft)}
            onViewExecutionLogs={() => setShowExecutionLogs((current) => !current)}
          />
          <AutomationHandoffPanel states={conversationAutomationStates} selectedTrigger={selectedTrigger} />
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),420px]">
          <TriggerWizardPanel
            steps={triggerWizardSteps}
            draft={wizardDraft}
            events={triggerEventCatalog}
            flows={flowCatalog}
            onStepChange={(step) => setWizardDraft((current) => ({ ...current, currentStep: step }))}
            onChange={(field, value) => {
              if (field === 'conditionValue') {
                setWizardDraft((current) => ({
                  ...current,
                  conditions: current.conditions.map((condition, index) => (index === 0 ? { ...condition, value } : condition)),
                  reviewSummary: `When ${current.event} occurs and ${current.conditions[0]?.field || 'condition'} ${current.conditions[0]?.operator || ''} ${value}, route to ${current.flowCode}.`,
                }));
                return;
              }

              setWizardDraft((current) => ({
                ...current,
                [field]: value,
                reviewSummary: `When ${field === 'event' ? value : current.event} occurs and ${current.conditions[0]?.field || 'condition'} ${current.conditions[0]?.operator || ''} ${field === 'conditionValue' ? value : current.conditions[0]?.value || ''}, route to ${field === 'flowCode' ? value : current.flowCode}.`,
              }));
            }}
            onSave={() => setWizardDraft((current) => ({ ...current, currentStep: triggerWizardSteps.length }))}
          />
          {showExecutionLogs ? (
            <FlowExecutionLogsPanel entries={relatedLogs.length ? relatedLogs : executionLogEntries} selectedExecutionId={(relatedLogs[0] || executionLogEntries[0])?.id || ''} onSelectExecution={() => {}} />
          ) : (
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Trigger Relationship</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedTrigger?.triggerCode || 'No trigger selected'}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedTrigger ? `${selectedTrigger.event} routes to ${selectedTrigger.flowCode}.` : 'Select a trigger to inspect its flow relationship.'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppTriggersWorkspacePage;