import { MindNode, MindEdge, MapLayout, NodeStyle } from '../types';

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 70;

export const PALETTES = [
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

export function parseHierarchyAsBranch(
  rawRoot: any,
  mapId: string,
  parentNodeId: string,
  branchIdx: number = 0
): { nodes: MindNode[]; edges: MindEdge[]; branchRootId: string } {
  const nodes: MindNode[] = [];
  const edges: MindEdge[] = [];
  const now = Date.now();
  const palette = PALETTES[branchIdx % PALETTES.length];

  const branchRootId = 'node-' + Math.random().toString(36).substr(2, 9);
  const branchRootNode: MindNode = {
    id: branchRootId,
    mapId,
    parentId: parentNodeId,
    title: rawRoot.title || 'Document Ingestion',
    description: rawRoot.description || '',
    type: 'idea',
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

  nodes.push(branchRootNode);
  edges.push({
    id: 'edge-' + Math.random().toString(36).substr(2, 9),
    mapId,
    sourceId: parentNodeId,
    targetId: branchRootId,
    style: {
      color: palette.border,
      width: 2.5,
    },
  });

  function traverse(parent: any, parentId: string, depth: number, subIdx: number) {
    if (!parent.children || !Array.isArray(parent.children)) return;

    parent.children.forEach((child: any, idx: number) => {
      const childId = 'node-' + Math.random().toString(36).substr(2, 9);
      const childPalette = PALETTES[(branchIdx + subIdx + idx) % PALETTES.length];

      const childNode: MindNode = {
        id: childId,
        mapId,
        parentId,
        title: child.title || `Concept ${idx + 1}`,
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
          backgroundColor: depth === 1 ? '#ffffff' : childPalette.bg,
          textColor: depth === 1 ? '#0f172a' : childPalette.text,
          borderColor: childPalette.border,
          borderWidth: depth === 1 ? 2 : 1.5,
          fontSize: depth === 1 ? 'base' : 'sm',
          fontWeight: depth === 1 ? 'semibold' : 'medium',
          textAlign: 'center',
          shadow: depth === 1 ? 'sm' : 'none',
          accentColor: childPalette.accent,
        },
        createdAt: now,
        updatedAt: now,
      };

      nodes.push(childNode);
      edges.push({
        id: 'edge-' + Math.random().toString(36).substr(2, 9),
        mapId,
        sourceId: parentId,
        targetId: childId,
        style: {
          color: childPalette.border,
          width: depth === 1 ? 2.5 : 1.8,
        },
      });

      traverse(child, childId, depth + 1, subIdx + idx);
    });
  }

  traverse(rawRoot, branchRootId, 1, 0);

  return { nodes, edges, branchRootId };
}

// Auto layout engine
export function applyLayout(
  nodes: MindNode[],
  edges: MindEdge[],
  layout: MapLayout = 'tree',
  rootId?: string
): MindNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, MindNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  // Build tree relationships: support both parentId and edges
  const childrenMap = new Map<string, string[]>();
  const parentOf = new Map<string, string>();

  // 1. From parentId
  nodes.forEach((n) => {
    if (n.parentId && nodeMap.has(n.parentId)) {
      const list = childrenMap.get(n.parentId) || [];
      if (!list.includes(n.id)) list.push(n.id);
      childrenMap.set(n.parentId, list);
      parentOf.set(n.id, n.parentId);
    }
  });

  // 2. Augment from edges if target has no parentId set
  edges.forEach((e) => {
    if (nodeMap.has(e.sourceId) && nodeMap.has(e.targetId)) {
      if (!parentOf.has(e.targetId)) {
        const list = childrenMap.get(e.sourceId) || [];
        if (!list.includes(e.targetId)) list.push(e.targetId);
        childrenMap.set(e.sourceId, list);
        parentOf.set(e.targetId, e.sourceId);
      }
    }
  });

  // Determine Primary Root
  let root: MindNode | undefined;
  if (rootId && nodeMap.has(rootId)) {
    root = nodeMap.get(rootId);
  }
  if (!root) {
    root = nodes.find((n) => !parentOf.has(n.id)) || nodes[0];
  }

  const visited = new Set<string>();

  switch (layout) {
    case 'radial':
      layoutRadial(root.id, nodeMap, childrenMap, visited);
      break;
    case 'left-to-right':
      layoutHierarchicalHorizontal(root.id, nodeMap, childrenMap, visited, 1);
      break;
    case 'right-to-left':
      layoutHierarchicalHorizontal(root.id, nodeMap, childrenMap, visited, -1);
      break;
    case 'bottom-to-top':
      layoutHierarchicalVertical(root.id, nodeMap, childrenMap, visited, -1);
      break;
    case 'top-to-bottom':
    case 'tree':
    default:
      layoutHierarchicalVertical(root.id, nodeMap, childrenMap, visited, 1);
      break;
  }

  // Handle any disconnected / orphan nodes gracefully by placing them in an orderly grid below
  const unvisitedNodes = nodes.filter((n) => !visited.has(n.id));
  if (unvisitedNodes.length > 0) {
    let orphanY = 320;
    let orphanX = -((unvisitedNodes.length - 1) * 230) / 2;
    unvisitedNodes.forEach((orphan) => {
      const live = nodeMap.get(orphan.id);
      if (live) {
        live.x = orphanX;
        live.y = orphanY;
        orphanX += 230;
      }
    });
  }

  const updatedNodes: MindNode[] = [];
  nodeMap.forEach((n) => updatedNodes.push(n));
  return updatedNodes;
}

// Specialized Hierarchical Tree Layout helper
export function applyHierarchicalTreeLayout(
  nodes: MindNode[],
  edges: MindEdge[],
  rootId?: string,
  orientation: 'top-to-bottom' | 'left-to-right' = 'top-to-bottom'
): MindNode[] {
  return applyLayout(nodes, edges, orientation === 'top-to-bottom' ? 'tree' : 'left-to-right', rootId);
}

// Clean Vertical Hierarchical Tree Layout (Top-to-Bottom / Bottom-to-Top)
function layoutHierarchicalVertical(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>,
  direction: 1 | -1 = 1
) {
  const root = nodeMap.get(rootId);
  if (!root) return;

  const SIBLING_GAP = 36;
  const LEVEL_GAP = 110;

  // Memoized subtree width calculation
  const subtreeWidthMemo = new Map<string, number>();

  function calculateSubtreeWidth(nodeId: string, path = new Set<string>()): number {
    if (path.has(nodeId)) return 0; // prevent cycle
    if (subtreeWidthMemo.has(nodeId)) return subtreeWidthMemo.get(nodeId)!;

    const node = nodeMap.get(nodeId);
    const nodeWidth = node?.width || DEFAULT_NODE_WIDTH;
    const children = (childrenMap.get(nodeId) || []).filter((c) => !path.has(c));

    if (!children.length || node?.collapsed) {
      const width = nodeWidth + SIBLING_GAP;
      subtreeWidthMemo.set(nodeId, width);
      return width;
    }

    path.add(nodeId);
    let totalChildrenWidth = 0;
    for (const childId of children) {
      totalChildrenWidth += calculateSubtreeWidth(childId, path);
    }
    path.delete(nodeId);

    const result = Math.max(totalChildrenWidth, nodeWidth + SIBLING_GAP);
    subtreeWidthMemo.set(nodeId, result);
    return result;
  }

  // Position node and its children symmetrically
  function positionSubtree(nodeId: string, startX: number, parentCenterY: number) {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    visited.add(nodeId);

    const subWidth = calculateSubtreeWidth(nodeId);
    const nodeCenterX = startX + subWidth / 2;
    const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
    const nodeHeight = node.height || DEFAULT_NODE_HEIGHT;

    node.x = Math.round(nodeCenterX - nodeWidth / 2);
    node.y = Math.round(parentCenterY - nodeHeight / 2);

    const children = (childrenMap.get(nodeId) || []).filter((c) => !visited.has(c));
    if (!children.length || node.collapsed) return;

    let totalChildrenWidth = 0;
    for (const childId of children) {
      totalChildrenWidth += calculateSubtreeWidth(childId);
    }

    // Children are centered directly under this parent
    let currentChildX = nodeCenterX - totalChildrenWidth / 2;
    const nextLevelCenterY = parentCenterY + direction * (nodeHeight / 2 + LEVEL_GAP + DEFAULT_NODE_HEIGHT / 2);

    for (const childId of children) {
      const childSubWidth = calculateSubtreeWidth(childId);
      positionSubtree(childId, currentChildX, nextLevelCenterY);
      currentChildX += childSubWidth;
    }
  }

  // Root starts centered at X = 0, Y = 0
  const totalTreeWidth = calculateSubtreeWidth(rootId);
  const rootStartX = -totalTreeWidth / 2;
  positionSubtree(rootId, rootStartX, 0);
}

// Clean Horizontal Hierarchical Tree Layout (Left-to-Right / Right-to-Left)
function layoutHierarchicalHorizontal(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>,
  direction: 1 | -1 = 1
) {
  const root = nodeMap.get(rootId);
  if (!root) return;

  const SIBLING_GAP = 28;
  const LEVEL_GAP = 90;

  const subtreeHeightMemo = new Map<string, number>();

  function calculateSubtreeHeight(nodeId: string, path = new Set<string>()): number {
    if (path.has(nodeId)) return 0;
    if (subtreeHeightMemo.has(nodeId)) return subtreeHeightMemo.get(nodeId)!;

    const node = nodeMap.get(nodeId);
    const nodeHeight = node?.height || DEFAULT_NODE_HEIGHT;
    const children = (childrenMap.get(nodeId) || []).filter((c) => !path.has(c));

    if (!children.length || node?.collapsed) {
      const height = nodeHeight + SIBLING_GAP;
      subtreeHeightMemo.set(nodeId, height);
      return height;
    }

    path.add(nodeId);
    let totalChildrenHeight = 0;
    for (const childId of children) {
      totalChildrenHeight += calculateSubtreeHeight(childId, path);
    }
    path.delete(nodeId);

    const result = Math.max(totalChildrenHeight, nodeHeight + SIBLING_GAP);
    subtreeHeightMemo.set(nodeId, result);
    return result;
  }

  function positionSubtree(nodeId: string, parentCenterX: number, startY: number) {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    visited.add(nodeId);

    const subHeight = calculateSubtreeHeight(nodeId);
    const nodeCenterY = startY + subHeight / 2;
    const nodeWidth = node.width || DEFAULT_NODE_WIDTH;
    const nodeHeight = node.height || DEFAULT_NODE_HEIGHT;

    node.x = Math.round(parentCenterX - nodeWidth / 2);
    node.y = Math.round(nodeCenterY - nodeHeight / 2);

    const children = (childrenMap.get(nodeId) || []).filter((c) => !visited.has(c));
    if (!children.length || node.collapsed) return;

    let totalChildrenHeight = 0;
    for (const childId of children) {
      totalChildrenHeight += calculateSubtreeHeight(childId);
    }

    // Children are centered directly adjacent to this parent
    let currentChildY = nodeCenterY - totalChildrenHeight / 2;
    const nextLevelCenterX = parentCenterX + direction * (nodeWidth / 2 + LEVEL_GAP + DEFAULT_NODE_WIDTH / 2);

    for (const childId of children) {
      const childSubHeight = calculateSubtreeHeight(childId);
      positionSubtree(childId, nextLevelCenterX, currentChildY);
      currentChildY += childSubHeight;
    }
  }

  const totalTreeHeight = calculateSubtreeHeight(rootId);
  const rootStartY = -totalTreeHeight / 2;
  positionSubtree(rootId, 0, rootStartY);
}

// Radial Layout
function layoutRadial(
  rootId: string,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>
) {
  const root = nodeMap.get(rootId);
  if (!root) return;
  visited.add(rootId);

  root.x = Math.round(-(root.width || DEFAULT_NODE_WIDTH) / 2);
  root.y = Math.round(-(root.height || DEFAULT_NODE_HEIGHT) / 2);

  const rootChildren = (childrenMap.get(rootId) || []).filter((c) => !visited.has(c));
  if (rootChildren.length === 0) return;

  const RADIUS_STEP = 280;
  const angleStep = (2 * Math.PI) / rootChildren.length;

  rootChildren.forEach((childId, idx) => {
    const child = nodeMap.get(childId);
    if (!child) return;
    visited.add(childId);

    const angle = idx * angleStep;
    const childWidth = child.width || DEFAULT_NODE_WIDTH;
    const childHeight = child.height || DEFAULT_NODE_HEIGHT;

    child.x = Math.round(Math.cos(angle) * RADIUS_STEP - childWidth / 2);
    child.y = Math.round(Math.sin(angle) * (RADIUS_STEP * 0.75) - childHeight / 2);

    layoutRadialSubtree(childId, angle, angleStep * 0.8, RADIUS_STEP + 220, nodeMap, childrenMap, visited);
  });
}

function layoutRadialSubtree(
  nodeId: string,
  baseAngle: number,
  spreadAngle: number,
  radius: number,
  nodeMap: Map<string, MindNode>,
  childrenMap: Map<string, string[]>,
  visited: Set<string>
) {
  const children = (childrenMap.get(nodeId) || []).filter((c) => !visited.has(c));
  const node = nodeMap.get(nodeId);
  if (!children.length || node?.collapsed) return;

  const count = children.length;
  const step = count > 1 ? spreadAngle / (count - 1) : 0;
  const startAngle = baseAngle - spreadAngle / 2;

  children.forEach((childId, idx) => {
    const child = nodeMap.get(childId);
    if (!child) return;
    visited.add(childId);

    const angle = count === 1 ? baseAngle : startAngle + idx * step;
    const childWidth = child.width || DEFAULT_NODE_WIDTH;
    const childHeight = child.height || DEFAULT_NODE_HEIGHT;

    child.x = Math.round(Math.cos(angle) * radius - childWidth / 2);
    child.y = Math.round(Math.sin(angle) * (radius * 0.75) - childHeight / 2);

    layoutRadialSubtree(childId, angle, spreadAngle * 0.6, radius + 200, nodeMap, childrenMap, visited);
  });
}
