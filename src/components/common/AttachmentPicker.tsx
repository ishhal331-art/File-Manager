import React, { useRef } from 'react';
import { Paperclip, Image as ImageIcon, X, File, FileText, FileSpreadsheet } from 'lucide-react';
import { formatFileSize, getFileCategory } from './NotificationAttachmentItem';

export interface PendingAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string; // base64
  fileObj?: File;
}

interface Props {
  attachments: PendingAttachment[];
  onChange: (attachments: PendingAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const AttachmentPicker: React.FC<Props> = ({
  attachments,
  onChange,
  maxFiles = 5,
  maxSizeMB = 15,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const remainingSlots = maxFiles - attachments.length;
    if (remainingSlots <= 0) {
      alert(`You can attach up to ${maxFiles} files per message.`);
      return;
    }

    const filesArray = Array.from(fileList).slice(0, remainingSlots);

    filesArray.forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the maximum ${maxSizeMB}MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        if (!base64Url) return;

        const newAttachment: PendingAttachment = {
          id: `att_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name || 'attachment',
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          url: base64Url,
          fileObj: file,
        };

        onChange([...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // reset input value so re-selecting same file triggers event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* HIDDEN FILE INPUT SUPPORTING ALL EXTENSIONS */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.json,.zip,.rar"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {/* ATTACHMENT TRIGGER BUTTONS */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachments.length >= maxFiles}
          className="px-3 py-1.5 rounded-full bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] hover:text-[#22D39F] border border-[#263047] hover:border-[#22D39F] text-[11px] font-bold flex items-center gap-1.5 shadow-inner transition-all cursor-pointer disabled:opacity-50"
          title="Attach files (screenshots, JPG, PNG, PDF, Word, Excel, CSV, etc.)"
        >
          <Paperclip className="w-3.5 h-3.5 text-[#22D39F]" />
          <span>Attach File</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.accept = 'image/*';
              fileInputRef.current.click();
              // Reset accept after click
              setTimeout(() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*,.pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.txt,.json,.zip,.rar';
                }
              }, 500);
            }
          }}
          disabled={disabled || attachments.length >= maxFiles}
          className="px-3 py-1.5 rounded-full bg-[#161D2F] hover:bg-[#102D30] text-[#F0F4FF] hover:text-[#22D39F] border border-[#263047] hover:border-[#22D39F] text-[11px] font-bold flex items-center gap-1.5 shadow-inner transition-all cursor-pointer disabled:opacity-50"
          title="Attach Image / Screenshot"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#22D39F]" />
          <span>Image / Screenshot</span>
        </button>

        {attachments.length > 0 && (
          <span className="text-[10px] font-black text-[#22D39F] px-2 py-0.5 rounded-md bg-[#102D30] border border-[#22D39F]/30">
            {attachments.length} of {maxFiles} attached
          </span>
        )}
      </div>

      {/* SELECTED PENDING ATTACHMENTS PREVIEW CHIPS */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 rounded-2xl bg-[#0B0F18] border border-[#263047] shadow-inner">
          {attachments.map((att) => {
            const category = getFileCategory(att.name, att.mimeType);
            const isImage = category.type === 'image';

            return (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#161D2F] border border-[#263047] shadow-inner text-xs font-semibold text-[#F0F4FF] max-w-xs group"
              >
                {isImage && att.url ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-6 h-6 rounded-md object-cover border border-[#263047] shrink-0"
                  />
                ) : (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.2 rounded uppercase shrink-0 border"
                    style={{
                      backgroundColor: category.bg,
                      color: category.color,
                      borderColor: category.borderColor,
                    }}
                  >
                    {category.label}
                  </span>
                )}

                <span className="truncate max-w-[130px] text-[11px] font-bold text-[#F0F4FF]">
                  {att.name}
                </span>

                <span className="text-[10px] text-[#7F8BA3] shrink-0 font-medium">
                  {formatFileSize(att.size)}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="p-1 rounded-full text-[#7F8BA3] hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
