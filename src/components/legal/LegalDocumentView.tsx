import React from 'react';
import { LegalDocument, LegalSection } from '../../data/legalData';
import {
  Info,
  AlertTriangle,
  FileCheck,
  Printer,
  Share2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface LegalDocumentViewProps {
  document: LegalDocument;
  onNavigateToContact?: () => void;
  onOpenCookiePreferences?: () => void;
}

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({
  document,
  onNavigateToContact,
  onOpenCookiePreferences,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <article className="space-y-8 font-sans text-slate-800 selection:bg-indigo-100">
      {/* Lawyer Review & Structure Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-900">Legal Notice & Structured Policy Framework</span>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            This document outlines the current operational standards and compliance policies of MindFlow AI Inc. as of {document.lastUpdated}. Structured for transparency, user verification, and continuous regulatory review.
          </p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="space-y-10">
        {document.sections.map((section: LegalSection) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 pt-4 first:pt-0 border-t border-slate-200/70 first:border-0"
          >
            {/* Section Heading */}
            <div className="flex items-baseline gap-3 mb-4">
              {section.number && (
                <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg shrink-0">
                  § {section.number}
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {section.title}
              </h3>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {section.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Subsections if present */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="mt-5 space-y-4 pl-3 sm:pl-4 border-l-2 border-indigo-100">
                {section.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="space-y-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {sub.title}
                    </h4>
                    <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {sub.content.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Callout Box if present */}
            {section.callout && (
              <div
                className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  section.callout.type === 'warning'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                }`}
              >
                {section.callout.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-bold">{section.callout.title}</span>
                  <p className="leading-relaxed text-[11px] opacity-90">{section.callout.text}</p>
                </div>
              </div>
            )}

            {/* Table if present */}
            {section.table && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono text-[11px]">
                    <tr>
                      {section.table.headers.map((h, hIdx) => (
                        <th key={hIdx} className="p-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-sans">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/60">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 font-medium">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* If this is the Cookies section with interactive banner trigger */}
            {document.id === 'cookies' && section.id === 'cookie-management' && onOpenCookiePreferences && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onOpenCookiePreferences}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Cookie Preferences Manager</span>
                </button>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Bottom Contact Help Box */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Have questions about this policy?</h4>
          <p className="text-xs text-slate-600">
            Our legal compliance team and Data Protection Officer are available to assist you.
          </p>
        </div>

        {onNavigateToContact && (
          <button
            type="button"
            onClick={onNavigateToContact}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Contact Legal Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
