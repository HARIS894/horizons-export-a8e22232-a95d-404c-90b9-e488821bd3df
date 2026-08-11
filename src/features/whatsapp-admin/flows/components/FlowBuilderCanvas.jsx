import React, { useMemo } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { FLOW_NODE_LIBRARY, FLOW_NODE_TYPE_META } from '../../automation/types/automationTypes';

const nodeWidth = 214;
const nodeHeight = 108;

const getNodeTone = (type) => FLOW_NODE_TYPE_META[type] || FLOW_NODE_TYPE_META.ACTION;

const getHandlePosition = (node, kind) => {
  const x = kind === 'output' ? node.position.x + nodeWidth : node.position.x;
  const y = node.position.y + nodeHeight / 2;
  return { x, y };
};

const buildEdgePath = (source, target) => {
  const dx = Math.max(120, Math.abs(target.x - source.x) * 0.45);
  return `M ${source.x} ${source.y} C ${source.x + dx} ${source.y}, ${target.x - dx} ${target.y}, ${target.x} ${target.y}`;
};

const FlowBuilderCanvas = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  pendingConnection,
  viewport,
  onCanvasMouseDown,
  onNodeMouseDown,
  onSelectNode,
  onSelectEdge,
  onDuplicateNode,
  onDeleteNode,
  onBeginConnection,
  onCompleteConnection,
  onCanvasDrop,
  onCanvasDragOver,
  onZoomChange,
}) => {
  const minimap = useMemo(() => {
    if (!nodes.length) {
      return { bounds: { minX: 0, minY: 0, width: 1, height: 1 }, items: [] };
    }

    const minX = Math.min(...nodes.map((node) => node.position.x));
    const minY = Math.min(...nodes.map((node) => node.position.y));
    const maxX = Math.max(...nodes.map((node) => node.position.x + nodeWidth));
    const maxY = Math.max(...nodes.map((node) => node.position.y + nodeHeight));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    return {
      bounds: { minX, minY, width, height },
      items: nodes.map((node) => ({
        id: node.id,
        x: ((node.position.x - minX) / width) * 180,
        y: ((node.position.y - minY) / height) * 110,
        width: (nodeWidth / width) * 180,
        height: (nodeHeight / height) * 110,
        type: node.type,
      })),
    };
  }, [nodes]);

  return (
    <div className="grid gap-5 xl:grid-cols-[280px,minmax(0,1fr)]">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Node Library</p>
        <div className="mt-4 space-y-4">
          {FLOW_NODE_LIBRARY.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{group.group}</p>
              <div className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.subtype}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', JSON.stringify({
                        paletteType: item.type,
                        label: item.label,
                        subtype: item.subtype,
                      }));
                    }}
                    className="cursor-grab rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
                  >
                    <p>{item.label}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{item.subtype}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">Visual Builder</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Drag from the node library, pan on empty space, drag nodes to reposition, and connect nodes from handle to handle.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300" onClick={() => onZoomChange(Math.max(0.55, viewport.zoom - 0.1))}>-</button>
            <span className="min-w-[68px] text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{Math.round(viewport.zoom * 100)}%</span>
            <button type="button" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300" onClick={() => onZoomChange(Math.min(1.6, viewport.zoom + 0.1))}>+</button>
          </div>
        </div>

        <div
          className="relative h-[760px] overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:32px_32px] dark:border-slate-700"
          onMouseDown={onCanvasMouseDown}
          onDrop={onCanvasDrop}
          onDragOver={onCanvasDragOver}
        >
          <div className="absolute left-4 top-4 z-30 rounded-full border border-amber-300 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900 dark:text-amber-200">
            {pendingConnection ? 'Connection mode active: choose a target node input handle' : 'Canvas ready'}
          </div>

          <div
            className="absolute inset-0"
            style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}
          >
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              {edges.map((edge) => {
                const sourceNode = nodes.find((node) => node.id === edge.source);
                const targetNode = nodes.find((node) => node.id === edge.target);
                if (!sourceNode || !targetNode) {
                  return null;
                }

                const source = getHandlePosition(sourceNode, 'output');
                const target = getHandlePosition(targetNode, 'input');
                const isSelected = selectedEdgeId === edge.id;
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={edge.id}>
                    <path
                      d={buildEdgePath(source, target)}
                      fill="none"
                      stroke={isSelected ? '#0f766e' : '#0f172a'}
                      strokeOpacity={isSelected ? '1' : '0.35'}
                      strokeWidth={isSelected ? '4' : '3'}
                      strokeLinecap="round"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectEdge(edge.id);
                      }}
                    />
                    <foreignObject x={midX - 46} y={midY - 18} width="92" height="36">
                      <div className="flex items-center justify-center">
                        <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {edge.branchLabel || 'edge'}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => {
              const tone = getNodeTone(node.type);
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectNode(node.id);
                  }}
                  onMouseDown={(event) => onNodeMouseDown(event, node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelectNode(node.id);
                    }
                  }}
                  className={`absolute rounded-[24px] border bg-white p-3 shadow-[0_18px_38px_rgba(15,23,42,0.14)] outline-none transition-all dark:bg-slate-950 ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-300/60' : 'border-slate-200 dark:border-slate-800'}`}
                  style={{ width: `${nodeWidth}px`, minHeight: `${nodeHeight}px`, transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
                >
                  <button
                    type="button"
                    title="Target handle"
                    className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 dark:border-slate-950"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCompleteConnection(node.id);
                    }}
                  />
                  <button
                    type="button"
                    title="Source handle"
                    className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-600 dark:border-slate-950"
                    onClick={(event) => {
                      event.stopPropagation();
                      onBeginConnection(node.id);
                    }}
                  />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone.tone}`}>{tone.label}</span>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{node.label}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="rounded-full border border-slate-200 p-1 text-slate-500 dark:border-slate-700 dark:text-slate-300" onClick={(event) => { event.stopPropagation(); onDuplicateNode(node.id); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="rounded-full border border-slate-200 p-1 text-slate-500 dark:border-slate-700 dark:text-slate-300" onClick={(event) => { event.stopPropagation(); onDeleteNode(node.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{node.subtype}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {node.config.templateCode
                      ? `Template: ${node.config.templateCode}`
                      : node.config.backendExecutionRequired
                        ? 'Backend execution required'
                        : node.config.tagId
                          ? `Tag: ${node.config.tagId}`
                          : Object.keys(node.config || {}).length
                            ? `${Object.keys(node.config).length} config fields ready`
                            : 'Needs configuration'}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 right-4 z-30 rounded-[20px] border border-slate-200 bg-white/95 p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950/95">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Minimap</p>
            <svg width="180" height="110" className="mt-2 rounded-2xl bg-slate-100 dark:bg-slate-900">
              {minimap.items.map((item) => (
                <rect
                  key={item.id}
                  x={item.x}
                  y={item.y}
                  width={Math.max(10, item.width)}
                  height={Math.max(8, item.height)}
                  rx="6"
                  fill={item.id === selectedNodeId ? '#06b6d4' : item.type === 'TRIGGER' ? '#0891b2' : item.type === 'LOGIC' ? '#d97706' : '#10b981'}
                  opacity={item.id === selectedNodeId ? '0.95' : '0.72'}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowBuilderCanvas;