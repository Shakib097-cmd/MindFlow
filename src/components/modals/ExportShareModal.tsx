import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { createOrUpdatePublicShare } from '../../services/firestoreSyncService';
import { canExportFormat } from '../../services/entitlementsService';
import { getShareUrl } from '../../config/domain';
import {
  Share2,
  FileText,
  Image as ImageIcon,
  Code,
  Copy,
  Check,
  Globe,
  Printer,
  FileCode,
  Lock,
  Loader2,
} from 'lucide-react';

export const ExportShareModal: React.FC = () => {
  const { isExportShareOpen, setIsExportShareOpen, activeMap, nodes, edges, setIsPricingOpen } = useWorkspace();
  const { user, profile } = useAuth();
  const activePlan = profile?.plan || 'pro';

  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareRole, setShareRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [sharePublished, setSharePublished] = useState(false);

  if (!isExportShareOpen || !activeMap) return null;

  const shareToken = activeMap.shareToken || activeMap.id;
  const shareUrl = getShareUrl(shareToken);

  const handleCopyLink = async () => {
    setIsPublishing(true);
    try {
      // Persist to Cloud public registry & local backend
      await createOrUpdatePublicShare(
        profile?.id || user?.uid || 'guest-user',
        shareToken,
        activeMap,
        nodes,
        edges,
        shareRole
      );

      await fetch('/api/share/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareToken,
          map: activeMap,
          nodes,
          edges,
          role: shareRole,
        }),
      }).catch(() => {});

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setSharePublished(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Share publication note:', err);
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportMarkdown = () => {
    const root = nodes.find((n) => !n.parentId) || nodes[0];
    let md = `# ${activeMap.title}\n\n`;
    if (activeMap.description) {
      md += `> ${activeMap.description}\n\n`;
    }

    const appendChildren = (parentId: string, depth: number) => {
      const children = nodes.filter((n) => n.parentId === parentId);
      children.forEach((c) => {
        const indent = '  '.repeat(depth);
        const prefix = c.type === 'task' ? (c.status === 'done' ? '[x]' : '[ ]') : '-';
        md += `${indent}${prefix} **${c.title}**${c.description ? `: ${c.description}` : ''}\n`;
        appendChildren(c.id, depth + 1);
      });
    };

    if (root) {
      appendChildren(root.id, 0);
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMap.title.replace(/\s+/g, '-').toLowerCase()}-mindmap.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      map: activeMap,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMap.title.replace(/\s+/g, '-').toLowerCase()}.mindflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Standalone vector SVG generator from nodes and edges
  const generateStandaloneSVG = (): string => {
    if (nodes.length === 0) return '';
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y < minY) minY = n.y;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    const padding = 60;
    const width = Math.max(maxX - minX + padding * 2, 400);
    const height = Math.max(maxY - minY + padding * 2, 300);
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svgContent += `<rect width="100%" height="100%" fill="#f8fafc"/>`;
    svgContent += `<style>
      .node-text { font-family: system-ui, -apple-system, sans-serif; font-size: 13px; }
      .title-text { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 600; }
    </style>`;

    // Render Bezier Edges
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.sourceId);
      const target = nodes.find((n) => n.id === edge.targetId);
      if (!source || !target) return;

      const sx = source.x + source.width + offsetX;
      const sy = source.y + source.height / 2 + offsetY;
      const tx = target.x + offsetX;
      const ty = target.y + target.height / 2 + offsetY;
      const dx = Math.abs(tx - sx) * 0.5;
      const pathData = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
      const color = edge.style?.color || '#94a3b8';
      const strokeWidth = edge.style?.width || 2;

      svgContent += `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
    });

    // Render Nodes
    nodes.forEach((node) => {
      const nx = node.x + offsetX;
      const ny = node.y + offsetY;
      const nw = node.width;
      const nh = node.height;
      const bgColor = node.style?.backgroundColor || '#ffffff';
      const borderColor = node.style?.borderColor || '#cbd5e1';
      const textColor = node.style?.textColor || '#0f172a';
      const rx = node.style?.shape === 'pill' ? nh / 2 : 12;

      svgContent += `<g transform="translate(${nx}, ${ny})">`;
      svgContent += `<rect width="${nw}" height="${nh}" rx="${rx}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"/>`;
      svgContent += `<text x="${nw / 2}" y="${nh / 2 + 5}" fill="${textColor}" text-anchor="middle" class="title-text">${node.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
      svgContent += `</g>`;
    });

    svgContent += `</svg>`;
    return svgContent;
  };

  // Real Native SVG Export
  const handleExportSVG = () => {
    if (!canExportFormat('svg', activePlan)) {
      setIsPricingOpen(true);
      return;
    }

    const svgData = generateStandaloneSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeMap.title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Real Native 2x Retina PNG Export
  const handleExportPNG = () => {
    const svgData = generateStandaloneSVG();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const scale = 2; // 2x Retina resolution
      const width = (image.naturalWidth || 1200) * scale;
      const height = (image.naturalHeight || 800) * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#f8fafc';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${activeMap.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        a.click();
      }
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Share & Export Mind Map
              </h2>
              <p className="text-xs text-slate-500">
                Export high-resolution documents or generate live share links
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExportShareOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Share Link Section */}
        <div className="mb-6 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Public Live Share Link</span>
            </div>
            <div className="flex items-center gap-1.5">
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as any)}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 focus:outline-hidden"
              >
                <option value="viewer">Can View</option>
                <option value="commenter">Can Comment</option>
                <option value="editor">Can Edit</option>
              </select>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {sharePublished ? 'Synced' : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono text-slate-600 focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Share & Copy'}</span>
            </button>
          </div>
        </div>

        {/* Export Formats Grid */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Export Formats:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PNG Image */}
            <button
              onClick={handleExportPNG}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Retina PNG Image</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">High-res 2x presentation graphic</p>
              </div>
            </button>

            {/* Vector SVG */}
            <button
              onClick={handleExportSVG}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 shadow-xs group relative"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-900">Vector SVG</h4>
                  {!canExportFormat('svg', activePlan) && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Pro
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Infinite scale vector graphic</p>
              </div>
            </button>

            {/* Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Markdown (.md)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Notion, Obsidian, or GitHub outline
                </p>
              </div>
            </button>

            {/* PDF / Print */}
            <button
              onClick={handlePrintPDF}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Print / PDF Vector</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Printable vector document</p>
              </div>
            </button>

            {/* JSON */}
            <button
              onClick={handleExportJSON}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-start gap-3 shadow-xs group sm:col-span-2"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">JSON Blueprint Schema</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Full backup with nodes, coordinates, styling and connections</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsExportShareOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
