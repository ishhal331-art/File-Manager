import React, { useState, useEffect } from 'react';
import { UploadedFile } from '../../types';
import { X, Save, Plus, Trash2, Download, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

interface Props {
  file: UploadedFile | null;
  onClose: () => void;
  onSaved: (updatedFile: UploadedFile) => void;
}

export const FileViewerModal: React.FC<Props> = ({ file, onClose, onSaved }) => {
  if (!file) return null;

  const [extractedData, setExtractedData] = useState<any[]>(file.extractedData || []);
  const [extractedText, setExtractedText] = useState<string>(file.extractedText || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleBackButton = () => {
      onClose();
    };
    window.addEventListener('app:backbutton', handleBackButton);
    return () => window.removeEventListener('app:backbutton', handleBackButton);
  }, [onClose]);

  const handleRowChange = (index: number, field: string, value: any) => {
    const updated = [...extractedData];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedData(updated);
  };

  const handleAddRow = () => {
    setExtractedData([
      ...extractedData,
      {
        date: new Date().toISOString().split('T')[0],
        description: 'New Item Entry',
        amount: 0.0,
        vendor: 'Standard Entity',
        referenceNo: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    setExtractedData(extractedData.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateFileData(file.id, extractedData, extractedText);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      onSaved({
        ...file,
        extractedData,
        extractedText,
      });
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Error updating data'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadOriginal = () => {
    if (!file.fileUrl) return;
    const a = document.createElement('a');
    a.href = file.fileUrl;
    a.download = file.originalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#F3EAE2] rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_rgba(48,33,18,0.25)] border border-white/90 flex flex-col relative overflow-hidden"
        id="file-viewer-card"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/60 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#E5DAD9] text-[#92798B] border border-white/80 flex items-center justify-center shadow-2xs shrink-0">
              <FileText className="w-5 h-5 text-[#CBAF87]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-[#302112] tracking-tight truncate max-w-[200px] sm:max-w-md" id="viewer-file-title" title={file.originalName}>
                  {file.originalName}
                </h3>
                <span className="text-[10px] font-black text-[#92798B] bg-[#E5DAD9] px-2.5 py-0.5 rounded-md border border-white/80 shadow-2xs shrink-0">
                  {file.fileType}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#5A463B] font-semibold mt-0.5 truncate">
                Uploaded {new Date(file.uploadedAt).toLocaleString()} • AI OCR Extracted & Editable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#5A463B] hover:text-[#302112] hover:bg-[#E5DAD9] transition-all shrink-0 cursor-pointer"
            id="btn-close-viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 custom-scrollbar">
          {/* AI SUMMARY BOX */}
          <div className="p-4 rounded-2xl bg-[#E5DAD9]/80 backdrop-blur-md border border-white/80 flex items-start gap-3 shadow-2xs">
            <div className="p-2 rounded-xl bg-white text-[#92798B] shadow-2xs shrink-0 border border-white/80">
              <Sparkles className="w-4 h-4 text-[#CBAF87]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#302112]">AI Document Executive Summary</p>
              <p className="text-xs text-[#5A463B] font-semibold mt-0.5 leading-relaxed">
                {file.summary || 'Document parsed successfully. Structured line items extracted below.'}
              </p>
            </div>
          </div>

          {/* EDITABLE LINE ITEMS DATA TABLE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-black text-[#302112] tracking-tight">
                Extracted Data Line Items
              </h4>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl bg-[#E5DAD9] hover:bg-white text-[#92798B] text-xs font-black flex items-center gap-1 transition-all border border-white/80 cursor-pointer shadow-2xs"
                id="btn-add-table-row"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/90 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#E5DAD9] border-b border-white/80 text-[#302112] font-black">
                    <th className="p-3">Date</th>
                    <th className="p-3">Description / Particulars</th>
                    <th className="p-3">Vendor / Entity</th>
                    <th className="p-3">Reference #</th>
                    <th className="p-3 text-right">Amount ($)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DAD9]/50 font-semibold text-[#302112]">
                  {extractedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#5A463B] font-semibold">
                        No line items parsed. Click "Add Row" to enter custom data.
                      </td>
                    </tr>
                  ) : (
                    extractedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F3EAE2]/50 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.date || ''}
                            onChange={(e) => handleRowChange(idx, 'date', e.target.value)}
                            className="w-full px-2 py-1 bg-[#F3EAE2] border border-white/80 rounded-lg text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.description || ''}
                            onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-[#F3EAE2] border border-white/80 rounded-lg text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.vendor || ''}
                            onChange={(e) => handleRowChange(idx, 'vendor', e.target.value)}
                            className="w-full px-2 py-1 bg-[#F3EAE2] border border-white/80 rounded-lg text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.referenceNo || ''}
                            onChange={(e) => handleRowChange(idx, 'referenceNo', e.target.value)}
                            className="w-full px-2 py-1 bg-[#F3EAE2] border border-white/80 rounded-lg text-xs font-bold text-[#302112] focus:outline-none focus:border-[#92798B]"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={row.amount || 0}
                            onChange={(e) => handleRowChange(idx, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-[#F3EAE2] border border-white/80 rounded-lg text-xs font-black text-right text-[#302112] focus:outline-none focus:border-[#92798B]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RAW OCR TEXT VIEW */}
          {extractedText && (
            <div>
              <h4 className="text-sm font-black text-[#302112] mb-2">Full Document Text Transcript</h4>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={4}
                className="w-full p-3 bg-[#E5DAD9]/80 border border-white/80 rounded-2xl text-xs font-mono text-[#302112] font-semibold focus:outline-none focus:border-[#92798B] shadow-inner"
              />
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-4 border-t border-white/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadOriginal}
            className="px-4 py-2.5 rounded-full bg-[#E5DAD9] hover:bg-white text-[#302112] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/80 shadow-2xs order-2 sm:order-1"
            id="btn-download-raw"
          >
            <Download className="w-4 h-4" />
            <span>Download Raw File</span>
          </button>

          <div className="flex items-center justify-end gap-3 order-1 sm:order-2">
            {savedSuccess && (
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Saved Changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#92798B] hover:bg-[#5A463B] text-[#F3EAE2] text-xs font-black flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              id="btn-save-file-data"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Verify Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
