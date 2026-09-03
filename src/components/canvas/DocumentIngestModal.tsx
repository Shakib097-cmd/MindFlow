import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { convertDocumentToMap } from '../../services/aiService';
import {
  FileUp,
  FileText,
  Sparkles,
  Loader2,
  X,
  PlusCircle,
  GitBranch,
  ListTodo,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
} from 'lucide-react';

interface DocumentIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFile?: File | null;
  initialHoverNodeId?: string | null;
}

export const DocumentIngestModal: React.FC<DocumentIngestModalProps> = ({
  isOpen,
  onClose,
  initialFile,
  initialHoverNodeId,
}) => {
  const {
    activeMap,
    nodes,
    selectedNodeId,
    createMapFromHierarchy,
    appendHierarchyToNode,
    triggerCelebration,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [fileTypeLabel, setFileTypeLabel] = useState('');
  const [rawText, setRawText] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [previewSnippet, setPreviewSnippet] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Ingestion configuration
  const [targetMode, setTargetMode] = useState<'new_map' | 'append_branch'>(
    activeMap && nodes.length > 0 ? 'append_branch' : 'new_map'
  );
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [focusMode, setFocusMode] = useState<'comprehensive' | 'tasks' | 'study' | 'strategy'>(
    'comprehensive'
  );

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<1 | 2 | 3>(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Determine target node when opening
  useEffect(() => {
    if (isOpen) {
      const defaultNodeId =
        initialHoverNodeId ||
        selectedNodeId ||
        nodes.find((n) => !n.parentId)?.id ||
        nodes[0]?.id ||
        '';
      setTargetNodeId(defaultNodeId);
      setTargetMode(activeMap && nodes.length > 0 ? 'append_branch' : 'new_map');
      setErrorMessage(null);
      setStatusMessage('');
      setIsLoading(false);
    }
  }, [isOpen, initialHoverNodeId, selectedNodeId, activeMap, nodes]);

  // Load initial file if provided
  useEffect(() => {
    if (initialFile) {
      processFile(initialFile);
    } else {
      setFile(null);
      setFileName('');
      setRawText('');
      setPdfBase64(null);
      setPreviewSnippet('');
    }
  }, [initialFile]);

  const processFile = (uploadedFile: File) => {
    if (uploadedFile.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25MB limit. Please upload a smaller document.');
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setFileSizeStr(formatSize(uploadedFile.size));
    setErrorMessage(null);
    setIsReadingFile(true);

    const name = uploadedFile.name.toLowerCase();
    const type = uploadedFile.type;

    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      setFileTypeLabel('PDF Document');
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPdfBase64(base64);
        setRawText(`[PDF Document: ${uploadedFile.name}, ${formatSize(uploadedFile.size)}]`);
        setPreviewSnippet(
          `Document: ${uploadedFile.name}\nSize: ${formatSize(uploadedFile.size)}\nType: PDF Binary Stream\nMultimodal Analysis: Gemini 3.8 Flash will read the native document layout, text, tables, and headers.`
        );
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read PDF document.');
        setIsReadingFile(false);
      };
      reader.readAsDataURL(uploadedFile);
    } else if (type.startsWith('image/')) {
      setFileTypeLabel('Image / Diagram');
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPdfBase64(base64);
        setRawText(`[Image Document: ${uploadedFile.name}]`);
        setPreviewSnippet(`Image Asset: ${uploadedFile.name}\nVisual OCR and diagram synthesis will be performed.`);
        setIsReadingFile(false);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      // Text, Markdown, CSV, JSON, Code, etc.
      if (name.endsWith('.md') || name.endsWith('.markdown')) {
        setFileTypeLabel('Markdown');
      } else if (name.endsWith('.json')) {
        setFileTypeLabel('JSON Document');
      } else if (name.endsWith('.csv') || name.endsWith('.tsv')) {
        setFileTypeLabel('Tabular Data');
      } else if (
        name.endsWith('.ts') ||
        name.endsWith('.js') ||
        name.endsWith('.py') ||
        name.endsWith('.html') ||
        name.endsWith('.css')
      ) {
        setFileTypeLabel('Source Code');
      } else {
        setFileTypeLabel('Text Document');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        setRawText(text);
        setPdfBase64(null);
        setPreviewSnippet(text.substring(0, 800) + (text.length > 800 ? '...' : ''));
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read text file.');
        setIsReadingFile(false);
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleManualFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = async () => {
    if (!file && !rawText && !pdfBase64) {
      setErrorMessage('Please provide a document to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisStep(1);
    setStatusMessage('Reading document structure & tokenizing content...');

    try {
      // Step 2: AI synthesis
      setAnalysisStep(2);
      setStatusMessage('Extracting conceptual hierarchy with Gemini 3.8 Flash...');

      const result = await convertDocumentToMap(
        rawText,
        fileName || 'Document Analysis',
        pdfBase64 || undefined,
        focusMode
      );

      // Step 3: Layout generation
      setAnalysisStep(3);
      setStatusMessage('Constructing mind map nodes and applying layout...');

      if (targetMode === 'append_branch' && activeMap && nodes.length > 0) {
        appendHierarchyToNode(targetNodeId, result);
      } else {
        createMapFromHierarchy(result);
      }

      triggerCelebration();
      onClose();
    } catch (err: any) {
      console.error('Document ingestion error:', err);
      setErrorMessage(err?.message || 'Failed to analyze document with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const targetNode = nodes.find((n) => n.id === targetNodeId);

  return (
    <div
      id="document-ingest-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        id="document-ingest-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Document Ingestion & AI Synthesis</h2>
              <p className="text-xs text-slate-500">
                Transform documents into structured, interactive mind maps with Gemini 3.8
              </p>
            </div>
          </div>
          <button
            id="close-ingest-modal-btn"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* File summary or Dropzone */}
          {file ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 truncate">{fileName}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">
                      {fileTypeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {fileSizeStr} • Ready for multimodal analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {previewSnippet && (
                  <button
                    id="toggle-file-preview-btn"
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Toggle Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{showPreview ? 'Hide' : 'Preview'}</span>
                  </button>
                )}
                <button
                  id="change-file-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <div
              id="ingest-file-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleModalDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer hover:bg-indigo-50/30 transition-all group"
            >
              <FileUp className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drop a document here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, Markdown (.md), Word (.docx), TXT, Code, JSON, CSV (Max 25MB)
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleManualFileInput}
            className="hidden"
            accept=".pdf,.txt,.md,.markdown,.json,.csv,.tsv,.docx,.doc,.ts,.js,.py,.html,.css,image/*"
          />

          {/* Collapsible Text Preview */}
          {showPreview && previewSnippet && (
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
              {previewSnippet}
            </div>
          )}

          {/* Ingestion Target Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Ingestion Destination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="target-new-map-btn"
                onClick={() => setTargetMode('new_map')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  targetMode === 'new_map'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    targetMode === 'new_map' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Create New Mind Map</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Generate an independent mind map dedicated to this document.
                  </div>
                </div>
              </button>

              <button
                type="button"
                id="target-append-branch-btn"
                onClick={() => setTargetMode('append_branch')}
                disabled={!activeMap || nodes.length === 0}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  !activeMap || nodes.length === 0
                    ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                    : targetMode === 'append_branch'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 cursor-pointer'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    targetMode === 'append_branch'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Attach to Active Map</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {activeMap
                      ? `Append branch into "${activeMap.title.substring(0, 20)}..."`
                      : 'Open a map first to attach branches'}
                  </div>
                </div>
              </button>
            </div>

            {/* Target Node dropdown if attaching as branch */}
            {targetMode === 'append_branch' && nodes.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-600 shrink-0">Attach under node:</span>
                <select
                  id="target-node-select"
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 truncate max-w-[240px]"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.parentId ? `↳ ${n.title}` : `[Central Topic] ${n.title}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Analysis Focus Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Analysis Focus & Schema
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFocusMode('comprehensive')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  focusMode === 'comprehensive'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs block">Comprehensive</span>
                <span className="text-[10px] text-slate-500 block">Full Hierarchy</span>
              </button>

              <button
                type="button"
                onClick={() => setFocusMode('tasks')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  focusMode === 'tasks'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ListTodo className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block">Action Items</span>
                <span className="text-[10px] text-slate-500 block">Kanban Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => setFocusMode('study')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  focusMode === 'study'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                <span className="text-xs block">Study Guide</span>
                <span className="text-[10px] text-slate-500 block">Concepts & Terms</span>
              </button>

              <button
                type="button"
                onClick={() => setFocusMode('strategy')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  focusMode === 'strategy'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">Strategy</span>
                <span className="text-[10px] text-slate-500 block">SWOT & Vision</span>
              </button>
            </div>
          </div>

          {/* Loading progress / Step feedback */}
          {isLoading && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>{statusMessage}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(analysisStep / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span className={analysisStep >= 1 ? 'text-indigo-700 font-bold' : ''}>
                  1. Extraction
                </span>
                <span className={analysisStep >= 2 ? 'text-indigo-700 font-bold' : ''}>
                  2. Gemini Reasoning
                </span>
                <span className={analysisStep >= 3 ? 'text-indigo-700 font-bold' : ''}>
                  3. Canvas Mapping
                </span>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Ensure the document contains readable text or valid PDF formatting.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <button
            id="cancel-ingest-btn"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="start-ingest-btn"
            type="button"
            onClick={handleStartAnalysis}
            disabled={isLoading || (!file && !rawText && !pdfBase64)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingesting Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Synthesize Mind Map</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
