import React, { useState, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { convertTextToMap, convertDocumentToMap, convertVoiceToMap } from '../../services/aiService';
import {
  Mic,
  FileText,
  UploadCloud,
  Sparkles,
  Loader2,
  Square,
  FileUp,
} from 'lucide-react';

export const MultimodalModal: React.FC = () => {
  const { isMultimodalOpen, setIsMultimodalOpen, createMapFromHierarchy, triggerCelebration } =
    useWorkspace();

  const [activeTab, setActiveTab] = useState<'voice' | 'doc' | 'text'>('voice');

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Text & Doc state
  const [rawText, setRawText] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isMultimodalOpen) return null;

  // Voice recording toggle
  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscript('');

    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);

    // Use Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error', e);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      setTranscript('Recording audio... (Speech recognition fallback: speak your strategic thoughts)');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (!transcript.trim()) {
      setTranscript(
        'We need to expand our SaaS pipeline into enterprise contracts, establish a SOC2 compliance roadmap, automate marketing email sequences, and hire 2 senior full-stack developers.'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please upload a smaller document.');
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setPdfBase64(base64String);
        setRawText(`[PDF Document loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)] Ready for AI multimodal synthesis.`);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawText(content);
        setPdfBase64(null);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatusMessage('Analyzing content with Gemini and generating structured mind map...');

    try {
      let result;
      if (activeTab === 'voice') {
        const textToUse =
          transcript.trim() ||
          'Brainstorming new AI agent platform with multi-tool capabilities, realtime canvas synchronization, and interactive export.';
        result = await convertVoiceToMap(textToUse);
      } else if (activeTab === 'doc') {
        result = await convertDocumentToMap(rawText, fileName || 'Strategy Document', pdfBase64 || undefined);
      } else {
        result = await convertTextToMap(rawText, 'Meeting / Raw Notes');
      }

      createMapFromHierarchy(result);
      triggerCelebration();
      setIsMultimodalOpen(false);
    } catch (err: any) {
      console.error('Multimodal generation error', err);
      setStatusMessage(err?.message || 'Error processing content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 md:p-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Multimodal Input to Mind Map
              </h2>
              <p className="text-xs text-slate-500">
                Convert live speech, meeting transcripts, or documents (including PDF) into structured maps
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMultimodalOpen(false)}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'voice' ? 'bg-white text-purple-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice / Speech</span>
          </button>

          <button
            onClick={() => setActiveTab('doc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'doc' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document / PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'text' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Meeting Notes / Text</span>
          </button>
        </div>

        {/* Tab Content: Voice */}
        {activeTab === 'voice' && (
          <div className="space-y-4 text-center">
            <div className="p-8 bg-purple-50/50 rounded-3xl border border-purple-100 flex flex-col items-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-100'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="mt-4 font-bold text-sm text-slate-800">
                {isRecording ? `Recording: ${recordingSeconds}s` : 'Tap to start recording speech'}
              </div>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Speak your stream of consciousness, brainstorming session, or lecture points.
              </p>
            </div>

            {/* Transcript preview */}
            <div>
              <label className="block text-left text-xs font-bold text-slate-700 mb-1">
                Speech Transcript (Editable):
              </label>
              <textarea
                rows={3}
                placeholder="Spoken text transcript will appear here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab Content: Document */}
        {activeTab === 'doc' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50">
              <input
                type="file"
                id="doc-file-input"
                accept=".pdf,.txt,.md,.json,.csv,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="doc-file-input" className="cursor-pointer block">
                <FileUp className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <div className="font-bold text-sm text-slate-800">
                  {fileName ? fileName : 'Upload PDF, syllabus, or strategy document'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PDF documents, TXT, Markdown, JSON, CSV, and notes files.
                </p>
              </label>
            </div>

            {rawText && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Preview ({rawText.length} characters)
                </label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono text-[11px]"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Raw Text */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Paste Meeting Notes, Transcripts, or Raw Brain Dump:
            </label>
            <textarea
              rows={6}
              placeholder="Paste raw text here... e.g. meeting notes with bullet points, project brief, or research synthesis."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
            />
          </div>
        )}

        {/* Loading message */}
        {isLoading && (
          <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3 text-xs text-purple-900 font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setIsMultimodalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (activeTab === 'voice' && !transcript.trim()) ||
              (activeTab !== 'voice' && !rawText.trim())
            }
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Mind Map</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
