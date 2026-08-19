import React, { useState } from 'react';
import { NotificationAttachment } from '../../types';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  Archive,
  File,
  X,
} from 'lucide-react';

interface Props {
  attachment: NotificationAttachment;
  onPreviewImage?: (attachment: NotificationAttachment) => void;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileCategory(name: string, mimeType: string): {
  type: 'image' | 'pdf' | 'excel' | 'word' | 'archive' | 'code' | 'other';
  label: string;
  color: string;
  bg: string;
  borderColor: string;
} {
  const lowerName = (name || '').toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (
    lowerMime.startsWith('image/') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.webp') ||
    lowerName.endsWith('.gif') ||
    lowerName.endsWith('.svg')
  ) {
    return {
      type: 'image',
      label: 'IMAGE',
      color: '#22D39F',
      bg: '#102D30',
      borderColor: '#22D39F',
    };
  }

  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) {
    return {
      type: 'pdf',
      label: 'PDF',
      color: '#F43F5E',
      bg: '#4C0519',
      borderColor: '#881337',
    };
  }

  if (
    lowerMime.includes('spreadsheet') ||
    lowerMime.includes('excel') ||
    lowerMime.includes('csv') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv')
  ) {
    return {
      type: 'excel',
      label: 'EXCEL',
      color: '#22D39F',
      bg: '#102D30',
      borderColor: '#22D39F',
    };
  }

  if (
    lowerMime.includes('word') ||
    lowerMime.includes('document') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.rtf')
  ) {
    return {
      type: 'word',
      label: 'DOCX',
      color: '#60A5FA',
      bg: '#1E3A8A',
      borderColor: '#2563EB',
    };
  }

  if (
    lowerName.endsWith('.zip') ||
    lowerName.endsWith('.rar') ||
    lowerName.endsWith('.7z') ||
    lowerName.endsWith('.tar')
  ) {
    return {
      type: 'archive',
      label: 'ARCHIVE',
      color: '#FBBF24',
      bg: '#451A03',
      borderColor: '#B45309',
    };
  }

  if (
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.xml') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.html')
  ) {
    return {
      type: 'code',
      label: 'TEXT',
      color: '#AEB8CC',
      bg: '#1E293B',
      borderColor: '#334155',
    };
  }

  return {
    type: 'other',
    label: 'FILE',
    color: '#AEB8CC',
    bg: '#0B0F18',
    borderColor: '#263047',
  };
}

export const NotificationAttachmentItem: React.FC<Props> = ({
  attachment,
  onPreviewImage,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const category = getFileCategory(attachment.name, attachment.mimeType);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!attachment.url) return;

    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = () => {
    if (category.type === 'image') {
      if (onPreviewImage) {
        onPreviewImage(attachment);
      } else {
        setShowLightbox(true);
      }
    } else {
      handleDownload({ stopPropagation: () => {} } as any);
    }
  };

  const renderIcon = () => {
    switch (category.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#22D39F]" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-[#22D39F]" />;
      case 'word':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-slate-300" />;
      default:
        return <File className="w-4 h-4 text-[#AEB8CC]" />;
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#0B0F18] hover:bg-[#102D30] border border-[#263047] hover:border-[#22D39F] shadow-inner transition-all cursor-pointer select-none max-w-full overflow-hidden"
        title={`Click to ${category.type === 'image' ? 'view preview' : 'download'} ${attachment.name}`}
      >
        {/* THUMBNAIL OR CATEGORY ICON */}
        {category.type === 'image' && attachment.url ? (
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#161D2F] border border-[#263047] shrink-0 shadow-inner">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#0E1120]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-4 h-4 text-[#22D39F] drop-shadow-sm" />
            </div>
          </div>
        ) : (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner border"
            style={{
              backgroundColor: category.bg,
              borderColor: category.borderColor,
            }}
          >
            {renderIcon()}
          </div>
        )}

        {/* DETAILS */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="text-[9px] font-black px-1.5 py-0.2 rounded-md tracking-wider uppercase border"
              style={{
                backgroundColor: category.bg,
                color: category.color,
                borderColor: category.borderColor,
              }}
            >
              {category.label}
            </span>
            <span className="text-[10px] text-[#7F8BA3] font-semibold">
              {formatFileSize(attachment.size)}
            </span>
          </div>
          <p className="text-xs font-bold text-[#F0F4FF] truncate group-hover:text-[#22D39F] transition-colors">
            {attachment.name}
          </p>
        </div>

        {/* DOWNLOAD ACTION BUTTON */}
        <button
          type="button"
          onClick={handleDownload}
          className="p-2 rounded-xl bg-[#161D2F] group-hover:bg-[#22D39F] group-hover:text-[#0E1120] text-[#AEB8CC] border border-[#263047] transition-all cursor-pointer shrink-0 shadow-inner"
          title="Download File"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* LIGHTBOX MODAL IF IMAGE */}
      {showLightbox && category.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-[#0E1120]/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#161D2F] rounded-3xl p-4 sm:p-6 border border-[#263047] shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-[#263047] mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#22D39F]" />
                <span className="text-xs font-black text-[#F0F4FF] truncate max-w-xs sm:max-w-md">
                  {attachment.name}
                </span>
                <span className="text-[10px] font-bold text-[#7F8BA3]">
                  ({formatFileSize(attachment.size)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-full bg-[#22D39F] text-[#0E1120] text-xs font-bold flex items-center gap-1.5 hover:bg-[#19C99A] transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLightbox(false)}
                  className="p-1.5 rounded-full bg-[#0B0F18] text-[#AEB8CC] hover:text-[#F0F4FF] hover:bg-[#263047] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1 flex items-center justify-center overflow-auto rounded-2xl bg-[#0B0F18] p-2 border border-[#263047]">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
