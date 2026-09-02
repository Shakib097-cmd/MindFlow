import { MindNode, MindEdge, MapLayout, NodeStyle } from '../types';

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 70;

const PALETTES = [
  { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a', accent: '#2563eb' }, // Blue
  { bg: '#f5f3ff', border: '#8b5cf6', text: '#4c1d95', accent: '#7c3aed' }, // Purple
  { bg: '#ecfdf5', border: '#10b981', text: '#064e3b', accent: '#059669' }, // Emerald
  { bg: '#fff7ed', border: '#f97316', text: '#7c2d12', accent: '#ea580c' }, // Orange
  { bg: '#fdf2f8', border: '#ec4899', text: '#831843', accent: '#db2777' }, // Pink
  { bg: '#f0fdfa', border: '#14b8a6', text: '#134e4a', accent: '#0d9488' }, // Teal
  { bg: '#fefce8', border: '#eab308', text: '#713f12', accent: '#ca8a04' }, // Yellow
  { bg: '#f1f5f9', border: '#64748b', text: '#0f172a', accent: '#475569' }, // Slate
];

export function parseHierarchyToCanvas(
  rawRoot: any,
  mapId: string,
  layout: MapLayout = 'left-to-right'
): { nodes: MindNode[]; edges: MindEdge[]; rootId: string } {
  const nodes: MindNode[] = [];
  const edges: MindEdge[] = [];

  const rootId = 'node-' + Math.random().toString(36).substr(2, 9);
  const now = Date.now();

  const rootNode: MindNode = {
    id: rootId,
    mapId,
    parentId: null,
    title: rawRoot.title || 'Central Topic',
    description: rawRoot.description || '',
    type: 'standard',
    x: 0,
    y: 0,
    width: 240,
    height: 80,
    style: {
      shape: 'rounded',
      backgroundColor: '#4f46e5',
      textColor: '#ffffff',
      borderColor: '#4338ca',
      borderWidth: 2,
      fontSize: 'xl',
      fontWeight: 'bold',
      textAlign: 'center',
      shadow: 'md',
    },
    createdAt: now,
    updatedAt: now,
  };

  nodes.push(rootNode);

  // Traverse children
  function traverse(parent: any, parentNodeId: string, depth: number, branchIdx: number) {
    if (!parent.children || !Array.isArray(parent.children)) return;

    parent.children.forEach((child: any, idx: number) => {
      const childId = 'node-' + Math.random().toString(36).substr(2, 9);
      const palette = PALETTES[(branchIdx + idx) % PALETTES.length];

      const childNode: MindNode = {
        id: childId,
        mapId,
        parentId: parentNodeId,
        title: child.title || `Idea ${idx + 1}`,
        description: child.description || '',
        type: child.type || (depth === 1 ? 'idea' : 'task'),
        x: 0,
        y: 0,
        width: depth === 1 ? 210 : 180,
        height: depth === 1 ? 70 : 60,
        priority: child.priority,
        status: child.status || (child.type === 'task' ? 'todo' : undefined),
        style: {
          shape: depth === 1 ? 'rounded' : 'pill',
          backgroundColor: depth === 1 ? '#ffffff' : palette.bg,
          textColor: depth === 1 ? '#0f172a' : palette.text,
          borderColor: palette.border,
          borderWidth: depth === 1 ? 2 : 1.5,
          fontSize: depth === 1 ? 'base' : 'sm',
          fontWeight: depth === 1 ? 'semibold' : 'medium',
          textAlign: 'center',
          shadow: depth === 1 ? 'sm' : 'none',
          accentColor: palette.accent,
        },
        createdAt: now,
        updatedAt: now,
      };

      nodes.push(childNode);

      edges.push({
        id: 'edge-' + Math.random().toString(36).substr(2, 9),
        mapId,
        sourceId: parentNodeId,
        targetId: childId,
        style: {
          color: palette.border,
          width: depth === 1 ? 2.5 : 1.8,
        },
      });

      traverse(child, childId, depth + 1, branchIdx + idx);
    });
  }

  if (rawRoot.children && Array.isArray(rawRoot.children)) {
    rawRoot.children.forEach((branch: any, bIdx: number) => {
      const branchId = 'node-' + Math.random().toString(36).substr(2, 9);
      const palette = PALETTES[bIdx % PALETTES.length];

      const branchNode: MindNode = {
        id: branchId,
        mapId,
        parentId: rootId,
        title: branch.title || `Main Branch ${bIdx + 1}`,
        description: branch.description || '',
        type: branch.type || 'idea',
        x: 0,
        y: 0,
        width: 220,
        height: 74,
        style: {
          shape: 'rounded',
          backgroundColor: '#ffffff',
          textColor: '#0f172a',
          borderColor: palette.border,
          borderWidth: 2,
          fontSize: 'lg',
          fontWeight: 'semibold',
          textAlign: 'center',
          shadow: 'md',
          accentColor: palette.accent,
        },
        createdAt: now,
        updatedAt: now,
      };

      nodes.push(branchNode);

      edges.push({
        id: 'edge-' + Math.random().toString(36).substr(2, 9),
        mapId,
        sourceId: rootId,
        targetId: branchId,
        style: {
          color: palette.border,
          width: 3,
        },
      });

      traverse(branch, branchId, 2, bIdx);
    });
  }

  // Calculate layout coordinates
  const arrangedNodes = applyLayout(nodes, edges, layout, rootId);
  return { nodes: arrangedNodes, edges, rootId };
}

// Auto layout engine
export function applyLayout(
  nodes: MindNode[],
  edges: MindEdge[],
  layout: MapLayout,
  rootId?: string
): MindNode[] {
  if (nodes.length === 0) return [];

  const root = rootId
    ? nodes.find((n) => n.id === rootId) || nodes[0]
    : nodes.find((n) => !n.parentId) || nodes[0];

  const nodeMap = new Map<string, MindNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  // Build tree
  const childrenMap = new Map<string, string[]>();
  nodes.forEach((n) => {
    if (n.parentId) {
      const list = childrenMap.get(n.parentId) || [];
      list.push(n.id);
      childrenMap.set(n.parentId, list);
    }
  });

  const updatedNodes: MindNode[] = [];

  switch (layout) {
    case 'radial':
      layoutRadial(root.id, nodeMap, childrenMap);
      break;
    case 'left-to-right':
      layoutHorizontal(root.id, nodeMap, childrenMap, 1);
      break;
    case 'right-to-left':
      layoutHorizontal(root.id, nodeMap, childrenMap, -1);
      break;
    case 'top-to-bottom':
    case 'tree':
      layoutVertical(root.id, nodeMap, childrenMap, 1);
      break;
    case 'bottom-to-top':
      layoutVertical(root.id, nodeMap, childrenMap, -1);
      break;
    default:
      layoutHorizontal(root.id, nodeMap, childrenMap, 1);
  }

  nodeMap.forEach((n) => updatedNodes.push(n));
  return updatedNodes;
}

// Left-to-Right / Right-to-Left Layout
function layoutHorizontal(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  direction: 1 | -1 = 1
) {
  const root = nodeMap.get(rootId);
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const HORIZONTAL_GAP = 280;
  const VERTICAL_GAP = 85;

  function calculateSubtreeHeight(nodeId: string): number {
    const children = childrenMap.get(nodeId) || [];
    const node = nodeMap.get(nodeId);
    if (!children.length || node?.collapsed) {
      return (node?.height || DEFAULT_NODE_HEIGHT) + VERTICAL_GAP;
    }

    let total = 0;
    for (const childId of children) {
      total += calculateSubtreeHeight(childId);
    }
    return Math.max(total, (node?.height || DEFAULT_NODE_HEIGHT) + VERTICAL_GAP);
  }

  function positionChildren(nodeId: string, currentX: number, startY: number) {
    const children = childrenMap.get(nodeId) || [];
    const node = nodeMap.get(nodeId);
    if (!children.length || node?.collapsed) return;

    let currentY = startY;

    for (const childId of children) {
      const child = nodeMap.get(childId);
      if (!child) continue;

      const subHeight = calculateSubtreeHeight(childId);
      child.x = currentX + direction * HORIZONTAL_GAP;
      child.y = currentY + subHeight / 2 - (child.height || DEFAULT_NODE_HEIGHT) / 2;

      positionChildren(childId, child.x, currentY);
      currentY += subHeight;
    }
  }

  const rootChildren = childrenMap.get(rootId) || [];
  let totalRootHeight = 0;
  for (const cId of rootChildren) {
    totalRootHeight += calculateSubtreeHeight(cId);
  }

  let startY = -totalRootHeight / 2;
  positionChildren(rootId, root.x, startY);
}

// Vertical / Top-to-Bottom Layout
function layoutVertical(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  direction: 1 | -1 = 1
) {
  const root = nodeMap.get(rootId);
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const VERTICAL_GAP = 160;
  const HORIZONTAL_GAP = 240;

  function calculateSubtreeWidth(nodeId: string): number {
    const children = childrenMap.get(nodeId) || [];
    const node = nodeMap.get(nodeId);
    if (!children.length || node?.collapsed) {
      return (node?.width || DEFAULT_NODE_WIDTH) + HORIZONTAL_GAP;
    }

    let total = 0;
    for (const childId of children) {
      total += calculateSubtreeWidth(childId);
    }
    return Math.max(total, (node?.width || DEFAULT_NODE_WIDTH) + HORIZONTAL_GAP);
  }

  function positionChildren(nodeId: string, startX: number, currentY: number) {
    const children = childrenMap.get(nodeId) || [];
    const node = nodeMap.get(nodeId);
    if (!children.length || node?.collapsed) return;

    let currentX = startX;

    for (const childId of children) {
      const child = nodeMap.get(childId);
      if (!child) continue;

      const subWidth = calculateSubtreeWidth(childId);
      child.x = currentX + subWidth / 2 - (child.width || DEFAULT_NODE_WIDTH) / 2;
      child.y = currentY + direction * VERTICAL_GAP;

      positionChildren(childId, currentX, child.y);
      currentX += subWidth;
    }
  }

  const rootChildren = childrenMap.get(rootId) || [];
  let totalRootWidth = 0;
  for (const cId of rootChildren) {
    totalRootWidth += calculateSubtreeWidth(cId);
  }

  let startX = -totalRootWidth / 2;
  positionChildren(rootId, startX, root.y);
}

// Radial Layout
function layoutRadial(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>
) {
  const root = nodeMap.get(rootId);
  if (!root) return;

  root.x = 0;
  root.y = 0;

  const rootChildren = childrenMap.get(rootId) || [];
  if (rootChildren.length === 0) return;

  const RADIUS_STEP = 320;
  const angleStep = (2 * Math.PI) / rootChildren.length;

  rootChildren.forEach((childId, idx) => {
    const child = nodeMap.get(childId);
    if (!child) return;

    const angle = idx * angleStep;
    child.x = Math.cos(angle) * RADIUS_STEP;
    child.y = Math.sin(angle) * (RADIUS_STEP * 0.75);

    // Layout subchildren outward
    layoutRadialSubtree(childId, angle, angleStep * 0.8, RADIUS_STEP + 260, nodeMap, childrenMap);
  });
}

function layoutRadialSubtree(
  nodeId: string,
  baseAngle: number,
  spreadAngle: number,
  radius: number,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>
) {
  const children = childrenMap.get(nodeId) || [];
  const node = nodeMap.get(nodeId);
  if (!children.length || node?.collapsed) return;

  const count = children.length;
  const step = count > 1 ? spreadAngle / (count - 1) : 0;
  const startAngle = baseAngle - spreadAngle / 2;

  children.forEach((childId, idx) => {
    const child = nodeMap.get(childId);
    if (!child) return;

    const angle = count === 1 ? baseAngle : startAngle + idx * step;
    child.x = Math.cos(angle) * radius;
    child.y = Math.sin(angle) * (radius * 0.75);

    layoutRadialSubtree(childId, angle, spreadAngle * 0.6, radius + 220, nodeMap, childrenMap);
  });
}
