export interface ReportActionsProps {
  onExportPdf: () => void;
  onCopyLink: () => void;
}

export function ReportActions({ onExportPdf, onCopyLink }: ReportActionsProps) {
  return (
    <div className="no-print mb-6 flex gap-2">
      <button type="button" className="scale-btn-secondary text-[13px]" onClick={onExportPdf}>
        Export PDF
      </button>
      <button type="button" className="scale-btn-secondary text-[13px]" onClick={onCopyLink}>
        Copy link
      </button>
    </div>
  );
}
