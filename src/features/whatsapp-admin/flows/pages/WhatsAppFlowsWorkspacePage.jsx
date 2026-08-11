import React, { useEffect, useMemo, useState } from 'react';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { defaultFlowDefinition, executionLogEntries, exportJobMocks, flowCatalog, flowPreviewScenarios, flowTestPayloads, importPreviewPayloads, providerAdapterSnapshots } from '../../automation/data/automationMockData';
import { importExportSchemas } from '../../automation/data/importExportSchemas';
import { filterTemplatesForFlowSelector, mockTemplates } from '../../templates/data/templateMockData';
import { validateFlowDefinition } from '../../automation/validation/importExportValidation';
import { FLOW_BRANCH_KEYS, FLOW_VARIABLE_CATALOG, FLOW_NODE_TYPES, WAIT_UNITS } from '../../automation/types/automationTypes';
import FlowBuilderToolbar from '../components/FlowBuilderToolbar';
import FlowBuilderCanvas from '../components/FlowBuilderCanvas';
import FlowBuilderInspector from '../components/FlowBuilderInspector';
import FlowExecutionLogsPanel from '../components/FlowExecutionLogsPanel';
import ImportExportFoundationPanel from '../components/ImportExportFoundationPanel';
import FlowPreviewPanel from '../components/FlowPreviewPanel';
import FlowTestRunnerPanel from '../components/FlowTestRunnerPanel';

const createNodeId = () => `node-${Math.random().toString(36).slice(2, 9)}`;
const createEdgeId = () => `edge-${Math.random().toString(36).slice(2, 9)}`;

const variableRefForIndex = (index) => FLOW_VARIABLE_CATALOG[index] || FLOW_VARIABLE_CATALOG[0];

const createNodeFromPalette = (payload, position) => ({
  id: createNodeId(),
  type: payload.paletteType,
  subtype: payload.subtype,
  label: payload.label,
  position,
  config: payload.subtype === 'Condition'
    ? { logicJoin: 'AND', rules: [{ id: `rule-${Date.now()}`, fieldRef: variableRefForIndex(0), field: variableRefForIndex(0).path, operator: 'equals', value: '' }] }
    : ['Wait', 'Delay', 'Schedule'].includes(payload.subtype)
      ? { duration: 60, unit: WAIT_UNITS[1], businessHoursPlaceholder: true }
      : payload.subtype === 'Quick Reply'
        ? { question: 'How can we help?', buttons: [{ quickReplyId: `qr-${Date.now()}`, label: 'Talk to agent', value: 'talk_to_agent', nextNodeId: '' }] }
        : payload.subtype === 'Human Handoff'
          ? { team: 'Care Coordination', agent: 'Shift Supervisor', pauseAutomation: true, priority: 'High', reason: 'Manual review required' }
          : payload.subtype === 'Send Template'
            ? { templateCode: '', templateName: '', language: '', variableMappings: [{ token: '{{1}}', variableRef: variableRefForIndex(0) }] }
            : ['Add Tag', 'Remove Tag', 'Check Tag'].includes(payload.subtype)
              ? { tagId: '', tagLabel: '' }
              : payload.paletteType === FLOW_NODE_TYPES.INTEGRATION
                ? { backendExecutionRequired: true, connectionState: 'Backend execution required' }
                : payload.paletteType === FLOW_NODE_TYPES.AI
                  ? { task: payload.label, fallback: 'Backend execution required' }
                  : {},
});

const cloneNode = (node) => ({
  ...node,
  id: createNodeId(),
  label: `${node.label} Copy`,
  position: { x: node.position.x + 40, y: node.position.y + 40 },
  config: JSON.parse(JSON.stringify(node.config || {})),
});

const tabOptions = ['Builder', 'Preview', 'Test', 'Execution Logs', 'Import / Export'];

const WhatsAppFlowsWorkspacePage = () => {
  const [activeTab, setActiveTab] = useState('Builder');
  const [flow, setFlow] = useState(defaultFlowDefinition);
  const [selectedNodeId, setSelectedNodeId] = useState(defaultFlowDefinition.nodes[1]?.id || '');
  const [selectedEdgeId, setSelectedEdgeId] = useState('');
  const [selectedExecutionId, setSelectedExecutionId] = useState(executionLogEntries[0]?.id || '');
  const [selectedPreviewId, setSelectedPreviewId] = useState(flowPreviewScenarios[0]?.id || '');
  const [selectedTestInput, setSelectedTestInput] = useState(Object.keys(flowTestPayloads)[0] || '');
  const [testResult, setTestResult] = useState(null);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [notice, setNotice] = useState('Local builder is active. Provider execution, WhatsApp sends, and external adapters remain backend-owned placeholders in this phase.');
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.72 });
  const [dragState, setDragState] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState('Patients');
  const [templateFilters, setTemplateFilters] = useState({
    search: '',
    category: 'All',
    language: 'All',
    tag: 'All',
    metaStatus: 'All',
    sendContext: flow.trigger?.event?.toLowerCase().replace(/ /g, '_') || 'appointment_created',
  });

  const selectedNode = flow.nodes.find((node) => node.id === selectedNodeId) || null;
  const selectedEdge = flow.edges.find((edge) => edge.id === selectedEdgeId) || null;

  const selectableTemplates = useMemo(() => filterTemplatesForFlowSelector(mockTemplates, templateFilters), [templateFilters]);
  const flowValidation = useMemo(() => validateFlowDefinition(flow), [flow]);
  const currentImportPayload = importPreviewPayloads[selectedEntity];
  const currentSchema = importExportSchemas[selectedEntity];
  const selectedExecution = executionLogEntries.find((entry) => entry.id === selectedExecutionId) || executionLogEntries[0] || null;

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      if (dragState.type === 'node') {
        const deltaX = (event.clientX - dragState.startX) / viewport.zoom;
        const deltaY = (event.clientY - dragState.startY) / viewport.zoom;
        setFlow((current) => ({
          ...current,
          nodes: current.nodes.map((node) => (
            node.id === dragState.nodeId
              ? { ...node, position: { x: dragState.originX + deltaX, y: dragState.originY + deltaY } }
              : node
          )),
        }));
      }

      if (dragState.type === 'pan') {
        setViewport((current) => ({
          ...current,
          x: dragState.originX + (event.clientX - dragState.startX),
          y: dragState.originY + (event.clientY - dragState.startY),
        }));
      }
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, viewport.zoom]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedNodeId) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteNode(selectedNodeId);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        handleDuplicateNode(selectedNodeId);
      }

      const increments = {
        ArrowUp: { x: 0, y: -8 },
        ArrowDown: { x: 0, y: 8 },
        ArrowLeft: { x: -8, y: 0 },
        ArrowRight: { x: 8, y: 0 },
      };
      if (increments[event.key]) {
        event.preventDefault();
        const delta = increments[event.key];
        setFlow((current) => ({
          ...current,
          nodes: current.nodes.map((node) => (
            node.id === selectedNodeId
              ? { ...node, position: { x: node.position.x + delta.x, y: node.position.y + delta.y } }
              : node
          )),
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  const handleDeleteNode = (nodeId) => {
    setFlow((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== nodeId),
      edges: current.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    }));
    setSelectedNodeId('');
    setNotice('Node deleted and dependent edges were removed from the local flow graph.');
  };

  const handleDuplicateNode = (nodeId) => {
    const sourceNode = flow.nodes.find((node) => node.id === nodeId);
    if (!sourceNode) {
      return;
    }

    const nextNode = cloneNode(sourceNode);
    setFlow((current) => ({ ...current, nodes: [...current.nodes, nextNode] }));
    setSelectedNodeId(nextNode.id);
    setNotice(`Duplicated ${sourceNode.label}.`);
  };

  const handleToolbarAction = (action) => {
    if (action === 'validate') {
      setNotice(flowValidation.isValid ? 'Flow validation passed for the local data model.' : flowValidation.errors.join(' '));
      return;
    }

    if (action === 'publish') {
      if (!flowValidation.canPublish) {
        setNotice(flowValidation.errors.join(' ') || 'Flow has validation errors and cannot be published.');
        return;
      }
      setFlow((current) => ({ ...current, status: 'PUBLISHED' }));
      setNotice('Flow marked as published in the local foundation. Real backend publication remains disabled.');
      return;
    }

    if (action === 'saveAs') {
      setFlow((current) => ({
        ...current,
        id: `flow-${Date.now()}`,
        name: `${current.name} Copy`,
        status: 'DRAFT',
      }));
      setNotice('Flow duplicated locally with the same immutable flow code reference for workspace modeling.');
      return;
    }

    if (action === 'save') {
      setFlow((current) => ({ ...current, status: 'DRAFT' }));
      setNotice('Flow saved locally. Backend persistence remains disabled in this phase.');
      return;
    }

    if (action === 'preview') {
      setActiveTab('Preview');
      setNotice('Flow preview opened in simulation mode.');
      return;
    }

    if (action === 'test') {
      setActiveTab('Test');
      setNotice('Flow test runner opened with mock trigger payloads.');
      return;
    }

    setNotice(`${action} is staged as a local admin action only in this phase.`);
  };

  const handleCanvasMouseDown = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    setSelectedNodeId('');
    setSelectedEdgeId('');
    setDragState({ type: 'pan', startX: event.clientX, startY: event.clientY, originX: viewport.x, originY: viewport.y });
  };

  const handleNodeMouseDown = (event, nodeId) => {
    const node = flow.nodes.find((entry) => entry.id === nodeId);
    if (!node) {
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedEdgeId('');
    setDragState({ type: 'node', nodeId, startX: event.clientX, startY: event.clientY, originX: node.position.x, originY: node.position.y });
  };

  const handleBeginConnection = (sourceId) => {
    setSelectedNodeId(sourceId);
    setPendingConnection(sourceId);
    setNotice('Select a target node handle to complete the edge.');
  };

  const handleCompleteConnection = (targetId) => {
    if (!pendingConnection || pendingConnection === targetId) {
      setPendingConnection(null);
      return;
    }

    setFlow((current) => ({
      ...current,
      edges: [...current.edges, { id: createEdgeId(), source: pendingConnection, target: targetId, branchKey: FLOW_BRANCH_KEYS.DEFAULT, branchLabel: 'branch' }],
    }));
    setPendingConnection(null);
    setNotice('Edge created in the local flow graph.');
  };

  const handleCanvasDrop = (event) => {
    event.preventDefault();
    const payload = JSON.parse(event.dataTransfer.getData('text/plain'));
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (event.clientY - rect.top - viewport.y) / viewport.zoom;
    const nextNode = createNodeFromPalette(payload, { x, y });
    setFlow((current) => ({ ...current, nodes: [...current.nodes, nextNode] }));
    setSelectedNodeId(nextNode.id);
    setSelectedEdgeId('');
    setNotice(`Added ${payload.label} node to the canvas.`);
  };

  const handleNodeConfigChange = (nodeId, partialConfig) => {
    setFlow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (
        node.id === nodeId
          ? { ...node, config: { ...node.config, ...partialConfig } }
          : node
      )),
    }));
  };

  const handleNodeRename = (nodeId, label) => {
    setFlow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, label } : node)),
    }));
  };

  const handleEdgeChange = (edgeId, changes) => {
    setFlow((current) => ({
      ...current,
      edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...changes } : edge)),
    }));
  };

  const handleRunTest = () => {
    const payload = flowTestPayloads[selectedTestInput] || {};
    setTestResult({
      status: flowValidation.canPublish ? 'PASS' : 'WARNING',
      steps: [
        { label: 'Trigger payload loaded', outcome: 'PASS', detail: `Loaded ${payload.triggerType || selectedTestInput} mock payload.` },
        { label: 'Flow validation', outcome: flowValidation.canPublish ? 'PASS' : 'WARNING', detail: flowValidation.canPublish ? 'Flow is publish-ready in local validation.' : (flowValidation.errors[0] || 'Flow has warnings or errors.') },
        { label: 'Execution routing', outcome: 'PASS', detail: `${flow.nodes.length} nodes and ${flow.edges.length} edges evaluated in simulation only.` },
      ],
      finalResult: selectedExecution?.error || 'Simulation complete. Backend execution remains disabled.',
    });
  };

  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <FlowBuilderToolbar
          flow={flow}
          onAction={handleToolbarAction}
          onBack={() => setNotice('Back navigation is intentionally scoped to the local workspace shell in this phase.')}
          onNameChange={(name) => setFlow((current) => ({ ...current, name }))}
          notice={notice}
          validation={flowValidation}
        />

        <div className="flex flex-wrap gap-2">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${activeTab === tab ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Builder' ? (
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),380px]">
            <FlowBuilderCanvas
              nodes={flow.nodes}
              edges={flow.edges}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              pendingConnection={pendingConnection}
              viewport={viewport}
              onCanvasMouseDown={handleCanvasMouseDown}
              onNodeMouseDown={handleNodeMouseDown}
              onSelectNode={(nodeId) => { setSelectedNodeId(nodeId); setSelectedEdgeId(''); }}
              onSelectEdge={(edgeId) => { setSelectedEdgeId(edgeId); setSelectedNodeId(''); }}
              onDuplicateNode={handleDuplicateNode}
              onDeleteNode={handleDeleteNode}
              onBeginConnection={handleBeginConnection}
              onCompleteConnection={handleCompleteConnection}
              onCanvasDrop={handleCanvasDrop}
              onCanvasDragOver={(event) => event.preventDefault()}
              onZoomChange={(zoom) => setViewport((current) => ({ ...current, zoom }))}
            />

            <FlowBuilderInspector
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              nodes={flow.nodes}
              templates={mockTemplates}
              templateFilters={templateFilters}
              onTemplateFilterChange={(key, value) => setTemplateFilters((current) => ({ ...current, [key]: value }))}
              selectableTemplates={selectableTemplates}
              onNodeConfigChange={handleNodeConfigChange}
              onNodeRename={handleNodeRename}
              onDeleteNode={handleDeleteNode}
              onDuplicateNode={handleDuplicateNode}
              onEdgeChange={handleEdgeChange}
            />
          </div>
        ) : null}

        {activeTab === 'Preview' ? (
          <FlowPreviewPanel flow={flow} scenarios={flowPreviewScenarios} selectedScenarioId={selectedPreviewId} onSelectScenario={setSelectedPreviewId} />
        ) : null}

        {activeTab === 'Test' ? (
          <FlowTestRunnerPanel selectedInputType={selectedTestInput} onSelectInputType={setSelectedTestInput} payloads={flowTestPayloads} result={testResult} onRunTest={handleRunTest} />
        ) : null}

        {activeTab === 'Execution Logs' ? (
          <FlowExecutionLogsPanel entries={executionLogEntries} selectedExecutionId={selectedExecutionId} onSelectExecution={setSelectedExecutionId} />
        ) : null}

        {activeTab === 'Import / Export' ? (
          <ImportExportFoundationPanel
            selectedEntity={selectedEntity}
            onEntityChange={setSelectedEntity}
            importPayload={currentImportPayload}
            exportJobs={exportJobMocks}
            providerSnapshots={providerAdapterSnapshots}
            schema={currentSchema}
          />
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Flow Catalog</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {flowCatalog.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.name}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.flowCode} • {item.status}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{tag}</span>)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(item.templatesUsed || []).map((templateCode) => <span key={templateCode} className="rounded-full border border-cyan-300 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-900 dark:text-cyan-200">{templateCode}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-700 dark:text-amber-200">Validation</p>
            <div className="mt-4 rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{flowValidation.isValid ? 'Flow structure valid' : 'Flow structure needs fixes'}</p>
              <div className="mt-3 space-y-2">
                {(flowValidation.issues?.length ? flowValidation.issues.map((issue) => `${issue.severity}: ${issue.message}`) : ['Stable Flow Code, nodes, and branch edges are present in the local model.']).map((message) => (
                  <p key={message} className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppFlowsWorkspacePage;