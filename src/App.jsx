import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DocumentTable from './components/DocumentTable';
import DocumentInspectionModal from './components/DocumentInspectionModal';
import BatchActionBar from './components/BatchActionBar';
import BatchIngestionView from './components/BatchIngestionView';
import AnalyticsView from './components/AnalyticsView';
import FileNetSyncModal from './components/FileNetSyncModal';
import ToastContainer from './components/ToastContainer';
import { INITIAL_FILES } from './data/mockData';
import './index.css';

export default function App() {
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'upload' | 'analytics' | 'filenet'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotMatched, setShowNotMatched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFileNetModal, setShowFileNetModal] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState({
    id: 'atl',
    name: 'ATL - Hartsfield Fleet Hub',
    region: 'Southeast'
  });

  const [filters, setFilters] = useState({
    name: '',
    docClass: 'All',
    status: 'All'
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [toasts, setToasts] = useState([]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Batch BOL 41units ingested from ORD Hub', time: '10m ago', type: 'info' },
    { id: 2, title: '64 documents synced to FileNet Object Store', time: '35m ago', type: 'success' },
    { id: 3, title: 'Manual verification queue backlog: 2 files pending', time: '1h ago', type: 'warning' }
  ]);

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    const newToast = { id: Date.now() + Math.random(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Document queue refreshed with latest fleet telemetry', 'info');
    }, 700);
  };

  // Multi-select row handlers
  const handleToggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (idsOnPage) => {
    const allSelected = idsOnPage.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...idsOnPage])]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Batch operations
  const handleBatchVerify = (ids) => {
    setFiles(prev => prev.map(f => {
      if (ids.includes(f.id)) {
        return {
          ...f,
          status: 'Verified',
          accuracy: 100,
          found: f.totalVin,
          needManual: 0,
          fileNetStatus: 'Ready for Sync'
        };
      }
      return f;
    }));
    setSelectedIds([]);
    showToast(`Marked ${ids.length} document(s) as Verified!`, 'success');
  };

  const handleBatchPushFileNet = (ids) => {
    setFiles(prev => prev.map(f => {
      if (ids.includes(f.id)) {
        return {
          ...f,
          fileNetStatus: 'Synced'
        };
      }
      return f;
    }));
    setSelectedIds([]);
    showToast(`Successfully pushed ${ids.length} document(s) to IBM FileNet P8 Content Engine!`, 'success');
  };

  const handleBatchRunExtraction = (ids) => {
    showToast(`Re-running AI Vision OCR model on ${ids.length} document(s)...`, 'info');
    setTimeout(() => {
      setFiles(prev => prev.map(f => {
        if (ids.includes(f.id) && f.needManual > 0) {
          const recovered = Math.ceil(f.needManual * 0.5);
          const newFound = f.found + recovered;
          const newManual = f.needManual - recovered;
          const newAccuracy = Math.round((newFound / f.totalVin) * 100);
          return {
            ...f,
            found: newFound,
            needManual: newManual,
            accuracy: newAccuracy,
            status: newManual === 0 ? 'Verified' : 'Action Required'
          };
        }
        return f;
      }));
      showToast(`Extraction completed. Accuracy improved across selected documents.`, 'success');
    }, 1000);
  };

  // Single file update from inspection modal
  const handleUpdateFile = (updatedFile) => {
    setFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
    setSelectedFile(updatedFile);
  };

  const handlePushFileNetSingle = (file) => {
    setFiles(prev => prev.map(f => {
      if (f.id === file.id) {
        return { ...f, fileNetStatus: 'Synced' };
      }
      return f;
    }));
    showToast(`Document #${file.name} synced to IBM FileNet P8!`, 'success');
  };

  const handleAddFiles = (newFiles) => {
    setFiles(prev => [...newFiles, ...prev]);
    setActiveTab('files');
    showToast(`Added ${newFiles.length} newly ingested document(s) to active queue`, 'success');
  };

  return (
    <div className="app-container">
      {/* Enterprise Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalFiles={files.length}
        onOpenFileNetModal={() => setShowFileNetModal(true)}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
      />

      {/* Main Workspace Body */}
      <div className="main-layout">
        {/* Collapsible Sidebar (active on Files tab) */}
        {activeTab === 'files' && (
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            filters={filters}
            onFilterChange={handleFilterChange}
            files={files}
            showNotMatched={showNotMatched}
            onToggleShowNotMatched={() => setShowNotMatched(!showNotMatched)}
          />
        )}

        {/* Dynamic Content Views */}
        <main className={`content-area ${activeTab !== 'files' ? 'full-width' : ''}`}>
          {activeTab === 'files' && (
            <DocumentTable
              files={files}
              selectedFile={selectedFile}
              onSelectFile={(f) => setSelectedFile(f)}
              filters={filters}
              onFilterChange={handleFilterChange}
              showNotMatched={showNotMatched}
              selectedIds={selectedIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              onOpenUpload={() => setActiveTab('upload')}
              onPushFileNetSingle={handlePushFileNetSingle}
            />
          )}

          {activeTab === 'upload' && (
            <BatchIngestionView
              onAddFiles={handleAddFiles}
              onShowToast={showToast}
              onNavigateToQueue={() => setActiveTab('files')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              onNavigateToQueue={() => setActiveTab('files')}
            />
          )}
        </main>
      </div>

      {/* Floating Multi-Select Batch Actions Bar */}
      <BatchActionBar
        selectedIds={selectedIds}
        files={files}
        onClearSelection={handleClearSelection}
        onBatchVerify={handleBatchVerify}
        onBatchPushFileNet={handleBatchPushFileNet}
        onBatchRunExtraction={handleBatchRunExtraction}
      />

      {/* Detailed Document Inspection & VIN Verification Modal */}
      {selectedFile && (
        <DocumentInspectionModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onUpdateFile={handleUpdateFile}
          onPushToFileNet={handlePushFileNetSingle}
          onShowToast={showToast}
        />
      )}

      {/* Enterprise FileNet ECM Integration Modal */}
      {showFileNetModal && (
        <FileNetSyncModal
          onClose={() => setShowFileNetModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* Enterprise Floating Toast Notification Stack */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />
    </div>
  );
}
