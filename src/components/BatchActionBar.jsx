import React from 'react';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

export default function BatchActionBar({
  selectedIds,
  files,
  onClearSelection,
  onBatchVerify,
  onBatchPushFileNet,
  onBatchRunExtraction
}) {
  if (!selectedIds || selectedIds.length === 0) return null;

  const selectedFiles = files.filter(f => selectedIds.includes(f.id));

  return (
    <div className="batch-action-bar">
      <div className="batch-info">
        <span className="batch-count-badge">{selectedIds.length}</span>
        <span className="batch-text">
          {selectedIds.length === 1 ? 'document selected' : 'documents selected'}
        </span>
      </div>

      <div className="batch-buttons">
        <button 
          className="batch-btn primary"
          onClick={() => onBatchVerify(selectedIds)}
          title="Mark all selected documents as Verified and ready for FileNet sync"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Batch Verify</span>
        </button>

        <button 
          className="batch-btn secondary"
          onClick={() => onBatchRunExtraction(selectedIds)}
          title="Run AI VIN extraction on selected files"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span>Re-Extract VINs</span>
        </button>

        <button 
          className="batch-btn filenet"
          onClick={() => onBatchPushFileNet(selectedIds)}
          title="Push selected files directly to IBM FileNet P8 Content Engine"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Sync to FileNet</span>
        </button>

        <div className="batch-divider"></div>

        <button 
          className="batch-btn outline"
          onClick={() => exportToCSV(selectedFiles, `IntelliExtract_Selected_${selectedIds.length}.csv`)}
          title="Export selected documents to CSV"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>CSV</span>
        </button>

        <button 
          className="batch-btn outline"
          onClick={() => exportToJSON(selectedFiles, `IntelliExtract_Selected_${selectedIds.length}.json`)}
          title="Export selected documents to JSON"
        >
          <span>JSON</span>
        </button>

        <button 
          className="batch-btn close"
          onClick={onClearSelection}
          title="Deselect all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
