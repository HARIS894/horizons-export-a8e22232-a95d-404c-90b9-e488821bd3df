import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { automationTagCatalog, automationTagLabels } from '../../automation/data/tagCatalog';
import { CONDITION_LOGIC_OPTIONS, CONDITION_OPERATORS, FLOW_BRANCH_KEYS, FLOW_VARIABLE_CATALOG, META_TEMPLATE_READINESS, WAIT_UNITS } from '../../automation/types/automationTypes';

const NativeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
  >
    {options.map((option) => {
      const nextValue = typeof option === 'string' ? option : option.value;
      const nextLabel = typeof option === 'string' ? option : option.label;
      return (
        <option key={nextValue} value={nextValue}>{nextLabel}</option>
      );
    })}
  </select>
);

const InspectorField = ({ label, children }) => (
  <div>
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
    {children}
  </div>
);

const updateRule = (selectedNode, index, changes, onNodeConfigChange) => {
  const rules = [...(selectedNode.config.rules || [])];
  rules[index] = { ...rules[index], ...changes };
  onNodeConfigChange(selectedNode.id, { rules });
};

const FlowBuilderInspector = ({
  selectedNode,
  selectedEdge,
  nodes,
  templates,
  templateFilters,
  onTemplateFilterChange,
  selectableTemplates,
  onNodeConfigChange,
  onNodeRename,
  onDeleteNode,
  onDuplicateNode,
  onEdgeChange,
}) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      {!selectedNode && !selectedEdge ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">Inspector Ready</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Select a node or edge to configure templates, conditions, waits, handoff states, or branch routing.</p>
        </div>
      ) : null}

      {selectedNode ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Node Inspector</p>
              <Input value={selectedNode.label} onChange={(event) => onNodeRename(selectedNode.id, event.target.value)} className="mt-3 h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{selectedNode.id} • {selectedNode.type} • {selectedNode.subtype}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300" onClick={() => onDuplicateNode(selectedNode.id)}>Duplicate</button>
              <button type="button" className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:border-rose-900 dark:text-rose-300" onClick={() => onDeleteNode(selectedNode.id)}>Delete</button>
            </div>
          </div>

          {selectedNode.subtype === 'Send Template' ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Template Selector</p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">Search by name, Template Code, tag, category, language, and Meta status. Only flow-valid templates are shown here.</p>
                <div className="mt-4 grid gap-3">
                  <InspectorField label="Search">
                    <Input value={templateFilters.search} onChange={(event) => onTemplateFilterChange('search', event.target.value)} placeholder="Search code, name, or tag" className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                  </InspectorField>
                  <InspectorField label="Category">
                    <NativeSelect value={templateFilters.category} onChange={(value) => onTemplateFilterChange('category', value)} options={['All', ...new Set(templates.map((template) => template.internalCategory))]} />
                  </InspectorField>
                  <InspectorField label="Language">
                    <NativeSelect value={templateFilters.language} onChange={(value) => onTemplateFilterChange('language', value)} options={['All', ...new Set(templates.map((template) => template.language))]} />
                  </InspectorField>
                  <InspectorField label="Tag">
                    <NativeSelect value={templateFilters.tag} onChange={(value) => onTemplateFilterChange('tag', value)} options={['All', ...automationTagLabels]} />
                  </InspectorField>
                  <InspectorField label="Meta Status">
                    <NativeSelect value={templateFilters.metaStatus} onChange={(value) => onTemplateFilterChange('metaStatus', value)} options={['All', ...Object.values(META_TEMPLATE_READINESS)]} />
                  </InspectorField>
                </div>
              </div>

              <InspectorField label="Template">
                <NativeSelect
                  value={selectedNode.config.templateCode || ''}
                  onChange={(value) => {
                    const match = selectableTemplates.find((template) => template.templateCode === value);
                    onNodeConfigChange(selectedNode.id, {
                      templateCode: match?.templateCode || '',
                      templateName: match?.name || '',
                      language: match?.language || '',
                      category: match?.internalCategory || match?.category || '',
                      metaStatus: match?.metaStatus || '',
                      variableMappings: (match?.variables || []).map((variable, index) => ({
                        token: variable.token || `{{${index + 1}}}`,
                        variableRef: FLOW_VARIABLE_CATALOG[index] || FLOW_VARIABLE_CATALOG[0],
                      })),
                    });
                  }}
                  options={selectableTemplates.map((template) => ({ label: `${template.templateCode} • ${template.name}`, value: template.templateCode }))}
                />
              </InspectorField>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Template Code</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{selectedNode.config.templateCode || 'Select a template'}</p>
                </div>
                <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Validation</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{selectedNode.config.metaStatus === META_TEMPLATE_READINESS.APPROVED ? 'Template eligible for local execution model' : 'Template is not Meta-approved yet'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Variable Mapping</p>
                {(selectedNode.config.variableMappings || []).map((mapping, index) => (
                  <div key={`${selectedNode.id}-mapping-${mapping.token}-${index}`} className="grid gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <InspectorField label="Template Token">
                      <Input value={mapping.token} onChange={(event) => {
                        const variableMappings = [...(selectedNode.config.variableMappings || [])];
                        variableMappings[index] = { ...variableMappings[index], token: event.target.value };
                        onNodeConfigChange(selectedNode.id, { variableMappings });
                      }} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                    </InspectorField>
                    <InspectorField label="Flow Variable">
                      <NativeSelect
                        value={mapping.variableRef?.path || ''}
                        onChange={(value) => {
                          const variableRef = FLOW_VARIABLE_CATALOG.find((variable) => variable.path === value) || FLOW_VARIABLE_CATALOG[0];
                          const variableMappings = [...(selectedNode.config.variableMappings || [])];
                          variableMappings[index] = { ...variableMappings[index], variableRef };
                          onNodeConfigChange(selectedNode.id, { variableMappings });
                        }}
                        options={FLOW_VARIABLE_CATALOG.map((variable) => ({ value: variable.path, label: `${variable.label} • ${variable.path}` }))}
                      />
                    </InspectorField>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedNode.subtype === 'Condition' ? (
            <div className="space-y-4">
              <InspectorField label="Join Logic">
                <NativeSelect value={selectedNode.config.logicJoin || CONDITION_LOGIC_OPTIONS[0]} onChange={(value) => onNodeConfigChange(selectedNode.id, { logicJoin: value })} options={CONDITION_LOGIC_OPTIONS} />
              </InspectorField>
              {(selectedNode.config.rules || []).map((rule, index) => (
                <div key={`${selectedNode.id}-rule-${index}`} className="grid gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <InspectorField label="Flow Variable">
                    <NativeSelect value={rule.fieldRef?.path || rule.field || ''} onChange={(value) => {
                      const variableRef = FLOW_VARIABLE_CATALOG.find((variable) => variable.path === value) || null;
                      updateRule(selectedNode, index, { fieldRef: variableRef, field: value }, onNodeConfigChange);
                    }} options={FLOW_VARIABLE_CATALOG.map((variable) => ({ value: variable.path, label: `${variable.label} • ${variable.path}` }))} />
                  </InspectorField>
                  <InspectorField label="Field">
                    <Input value={rule.field} onChange={(event) => updateRule(selectedNode, index, { field: event.target.value }, onNodeConfigChange)} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                  </InspectorField>
                  <InspectorField label="Operator">
                    <NativeSelect value={rule.operator} onChange={(value) => updateRule(selectedNode, index, { operator: value }, onNodeConfigChange)} options={CONDITION_OPERATORS} />
                  </InspectorField>
                  <InspectorField label="Value">
                    <Input value={rule.value} onChange={(event) => updateRule(selectedNode, index, { value: event.target.value }, onNodeConfigChange)} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                  </InspectorField>
                </div>
              ))}
            </div>
          ) : null}

          {selectedNode.subtype === 'Quick Reply' ? (
            <div className="space-y-4">
              <InspectorField label="Question">
                <Input value={selectedNode.config.question || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { question: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              {(selectedNode.config.buttons || []).map((button, index) => (
                <div key={`${selectedNode.id}-button-${button.quickReplyId}-${index}`} className="grid gap-3 rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <InspectorField label="Button Label">
                    <Input value={button.label} onChange={(event) => {
                      const buttons = [...(selectedNode.config.buttons || [])];
                      buttons[index] = { ...buttons[index], label: event.target.value };
                      onNodeConfigChange(selectedNode.id, { buttons });
                    }} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                  </InspectorField>
                  <InspectorField label="Button Value">
                    <Input value={button.value} onChange={(event) => {
                      const buttons = [...(selectedNode.config.buttons || [])];
                      buttons[index] = { ...buttons[index], value: event.target.value };
                      onNodeConfigChange(selectedNode.id, { buttons });
                    }} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
                  </InspectorField>
                  <InspectorField label="Route To Node">
                    <NativeSelect value={button.nextNodeId || ''} onChange={(value) => {
                      const buttons = [...(selectedNode.config.buttons || [])];
                      buttons[index] = { ...buttons[index], nextNodeId: value };
                      onNodeConfigChange(selectedNode.id, { buttons });
                    }} options={nodes.map((node) => ({ value: node.id, label: node.label }))} />
                  </InspectorField>
                </div>
              ))}
            </div>
          ) : null}

          {['Wait', 'Delay', 'Schedule'].includes(selectedNode.subtype) ? (
            <div className="space-y-4">
              <InspectorField label="Duration">
                <Input type="number" value={selectedNode.config.duration || 0} onChange={(event) => onNodeConfigChange(selectedNode.id, { duration: Number(event.target.value) })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              <InspectorField label="Unit">
                <NativeSelect value={selectedNode.config.unit || WAIT_UNITS[1]} onChange={(value) => onNodeConfigChange(selectedNode.id, { unit: value })} options={WAIT_UNITS} />
              </InspectorField>
              <InspectorField label="Business Hours Placeholder">
                <NativeSelect value={selectedNode.config.businessHoursPlaceholder ? 'Enabled' : 'Disabled'} onChange={(value) => onNodeConfigChange(selectedNode.id, { businessHoursPlaceholder: value === 'Enabled' })} options={['Enabled', 'Disabled']} />
              </InspectorField>
            </div>
          ) : null}

          {['Add Tag', 'Remove Tag', 'Check Tag'].includes(selectedNode.subtype) ? (
            <div className="space-y-4">
              <InspectorField label="Tag">
                <NativeSelect value={selectedNode.config.tagId || ''} onChange={(value) => {
                  const tag = automationTagCatalog.find((entry) => entry.id === value);
                  onNodeConfigChange(selectedNode.id, { tagId: value, tagLabel: tag?.label || '' });
                }} options={automationTagCatalog.map((tag) => ({ value: tag.id, label: `${tag.label} • ${tag.id}` }))} />
              </InspectorField>
            </div>
          ) : null}

          {selectedNode.type === 'INTEGRATION' ? (
            <div className="space-y-4">
              <InspectorField label="Backend Execution">
                <NativeSelect value={selectedNode.config.backendExecutionRequired ? 'Required' : 'Optional'} onChange={(value) => onNodeConfigChange(selectedNode.id, { backendExecutionRequired: value === 'Required' })} options={['Required', 'Optional']} />
              </InspectorField>
              <InspectorField label="Connection State">
                <Input value={selectedNode.config.connectionState || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { connectionState: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
            </div>
          ) : null}

          {selectedNode.type === 'AI' ? (
            <div className="space-y-4">
              <InspectorField label="AI Task">
                <Input value={selectedNode.config.task || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { task: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              <InspectorField label="Fallback Route">
                <Input value={selectedNode.config.fallback || 'Backend execution required'} onChange={(event) => onNodeConfigChange(selectedNode.id, { fallback: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
            </div>
          ) : null}

          {selectedNode.subtype === 'Human Handoff' ? (
            <div className="space-y-4">
              <InspectorField label="Assigned Team">
                <Input value={selectedNode.config.team || selectedNode.config.assignedTeam || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { team: event.target.value, assignedTeam: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              <InspectorField label="Assigned Agent">
                <Input value={selectedNode.config.agent || selectedNode.config.assignedAgent || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { agent: event.target.value, assignedAgent: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              <InspectorField label="Priority">
                <NativeSelect value={selectedNode.config.priority || 'Normal'} onChange={(value) => onNodeConfigChange(selectedNode.id, { priority: value })} options={['Low', 'Normal', 'High', 'Critical']} />
              </InspectorField>
              <InspectorField label="Reason">
                <Input value={selectedNode.config.reason || ''} onChange={(event) => onNodeConfigChange(selectedNode.id, { reason: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
              </InspectorField>
              <InspectorField label="Automation Pause">
                <NativeSelect value={selectedNode.config.pauseAutomation ? 'Pause' : 'Continue'} onChange={(value) => onNodeConfigChange(selectedNode.id, { pauseAutomation: value === 'Pause' })} options={['Pause', 'Continue']} />
              </InspectorField>
            </div>
          ) : null}
        </div>
      ) : null}

      {selectedEdge ? (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-700 dark:text-sky-200">Edge Inspector</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Reconnect branch targets or rename branch labels without editing the underlying flow code manually.</p>
          </div>
          <InspectorField label="Branch Label">
            <Input value={selectedEdge.branchLabel || ''} onChange={(event) => onEdgeChange(selectedEdge.id, { branchLabel: event.target.value })} className="h-11 rounded-2xl border-slate-200 dark:border-slate-800" />
          </InspectorField>
          <InspectorField label="Branch Key">
            <NativeSelect value={selectedEdge.branchKey || FLOW_BRANCH_KEYS.DEFAULT} onChange={(value) => onEdgeChange(selectedEdge.id, { branchKey: value })} options={Object.values(FLOW_BRANCH_KEYS)} />
          </InspectorField>
          <InspectorField label="Source Node">
            <NativeSelect value={selectedEdge.source} onChange={(value) => onEdgeChange(selectedEdge.id, { source: value })} options={nodes.map((node) => ({ label: node.label, value: node.id }))} />
          </InspectorField>
          <InspectorField label="Target Node">
            <NativeSelect value={selectedEdge.target} onChange={(value) => onEdgeChange(selectedEdge.id, { target: value })} options={nodes.map((node) => ({ label: node.label, value: node.id }))} />
          </InspectorField>
          <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Branch Summary</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">{selectedEdge.source}</Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">{selectedEdge.target}</Badge>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FlowBuilderInspector;