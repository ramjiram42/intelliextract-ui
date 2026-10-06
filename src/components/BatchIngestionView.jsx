import React, { useState } from 'react';
import { DOCUMENT_CLASSES } from '../data/mockData';

export default function BatchIngestionView({
  onAddFiles,
  onShowToast,
  onNavigateToQueue
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Condition Report');

  const samplePresets = [
    {
      name: '20260325_142010_BOL_ATL_34units.pdf',
      docClass: 'Bill of Lading (BOL)',
      totalVin: 34,
      pages: 3,
      size: '2.8 MB',
      sampleVins: ['1FTFW1ED4NFA19024', '3C6UR5DJXTG234631', '2HGFC2F69NH501928']
    },
    {
      name: '20260325_160219_HERTZ_DAMAGE_APPRAISAL_CA.pdf',
      docClass: 'Vehicle Damage Appraisal (VDA)',
      totalVin: 8,
      pages: 2,
      size: '1.9 MB',
      sampleVins: ['3KPF24AD3RE109284', 'KM8K12AA8RU401923']
    },
    {
      name: '20260325_173000_SHOP_REPAIR_ORD_ORD.pdf',
      docClass: 'Shop Repair Order (SRO)',
      totalVin: 16,
      pages: 4,
      size: '3.4 MB',
      sampleVins: ['3FA6P0HD9KR182049', '1G1ZE5ST8MF109283']
    }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFilesToQueue(droppedFiles);
  };

  const handleFileInput = (e) => {
    const chosenFiles = Array.from(e.target.files);
    addFilesToQueue(chosenFiles);
  };

  const addFilesToQueue = (fileList) => {
    const queueItems = fileList.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      docClass: selectedClass,
      progress: 0,
      status: 'Ready'
    }));
    setUploadQueue(prev => [...prev, ...queueItems]);
    onShowToast(`Added ${queueItems.length} document(s) to ingestion queue`, 'info');
  };

  const handleLoadSample = (sample) => {
    const sampleItem = {
      id: `sample-${Date.now()}`,
      name: sample.name,
      size: sample.size,
      docClass: sample.docClass,
      progress: 0,
      status: 'Ready',
      preset: sample
    };
    setUploadQueue(prev => [...prev, sampleItem]);
    onShowToast(`Loaded preset: ${sample.name}`, 'info');
  };

  const handleStartIngestion = () => {
    if (uploadQueue.length === 0) return;
    setIsProcessing(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadQueue(prev => prev.map(item => ({
        ...item,
        progress: Math.min(100, progress),
        status: progress >= 100 ? 'Completed' : 'Processing OCR...'
      })));

      if (progress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);

        // Convert uploadQueue items into real file objects for the document queue
        const newFiles = uploadQueue.map((item, idx) => {
          const isVerified = Math.random() > 0.3;
          const totalVin = item.preset ? item.preset.totalVin : 12;
          const found = isVerified ? totalVin : Math.floor(totalVin * 0.7);
          const needManual = totalVin - found;
          const accuracy = Math.round((found / totalVin) * 100);

          return {
            id: Date.now() + idx,
            name: item.name,
            docClass: item.docClass,
            totalVin,
            pages: item.preset ? item.preset.pages : 2,
            found,
            needManual,
            accuracy,
            status: needManual === 0 ? 'Verified' : 'Action Required',
            processingTime: '1.45s',
            confidence: '95.8%',
            fileSize: item.size,
            fileNetStatus: 'Pending',
            fileNetId: `FN-20260325-${Math.floor(10000 + Math.random() * 90000)}`,
            account: 'HERTZ VEHICLES LLC',
            location: 'ATL - Hartsfield Fleet Ops',
            extractedVins: Array.from({ length: found }).map((_, vIdx) => ({
              id: `ext-up-${idx}-${vIdx}`,
              vin: `1FTFW1ED4NFA${10000 + vIdx}`,
              page: 1,
              mileage: '16,200',
              area: 'Intake Bay',
              unit: `HZ-${500 + vIdx}`,
              confidence: 99.2,
              bbox: { x: 58, y: 30 + vIdx * 8, w: 30, h: 3.5 }
            })),
            manualVins: Array.from({ length: needManual }).map((_, mIdx) => ({
              id: `man-up-${idx}-${mIdx}`,
              vin: `3C6UR5DJXTG${20000 + mIdx}`,
              page: 2,
              mileage: '21,000',
              area: 'Review Staging',
              unit: `HZ-REV-${mIdx}`,
              errorReason: 'Check digit validation mismatch',
              confidence: 72.0,
              bbox: { x: 58, y: 55 + mIdx * 8, w: 30, h: 3.5 }
            }))
          };
        });

        onAddFiles(newFiles);
        onShowToast(`Successfully processed & ingested ${newFiles.length} document(s)!`, 'success');
        setUploadQueue([]);
      }
    }, 400);
  };

  return (
    <div className="ingestion-container">
      <div className="ingestion-header">
        <div>
          <h2>Document Batch Ingestion Hub</h2>
          <p>Drag and drop multi-page PDFs, TIFFs, or vehicle appraisal forms for automated Vision OCR extraction</p>
        </div>
        <button className="view-queue-btn" onClick={onNavigateToQueue}>
          ← Back to Document Queue
        </button>
      </div>

      <div className="ingestion-grid">
        {/* Left: Drag and Drop Dropzone */}
        <div className="ingestion-left">
          <div
            className={`dropzone-card ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>Drop Vehicle Documents Here</h3>
            <p>Supports PDF, TIFF, PNG, JPG (Multi-page batch uploads up to 50MB)</p>

            <div className="doc-class-select-row">
              <label>Default Document Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="select-class-dropdown"
              >
                {DOCUMENT_CLASSES.map(dc => (
                  <option key={dc} value={dc}>{dc}</option>
                ))}
              </select>
            </div>

            <label className="browse-files-btn">
              <span>Browse Local Files</span>
              <input type="file" multiple accept=".pdf,.tiff,.png,.jpg" onChange={handleFileInput} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Quick Preset Samples */}
          <div className="sample-presets-block">
            <h4>Quick Demo Presets (1-Click Test):</h4>
            <div className="presets-list">
              {samplePresets.map((sp, idx) => (
                <div key={idx} className="preset-card">
                  <div className="preset-info">
                    <span className="preset-name">{sp.name}</span>
                    <span className="preset-meta">{sp.docClass} • {sp.totalVin} VINs • {sp.size}</span>
                  </div>
                  <button className="load-preset-btn" onClick={() => handleLoadSample(sp)}>
                    + Add to Queue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upload Queue & Pipeline Status */}
        <div className="ingestion-right">
          <div className="queue-card">
            <div className="queue-card-header">
              <h3>Ingestion Queue ({uploadQueue.length})</h3>
              {uploadQueue.length > 0 && !isProcessing && (
                <button className="clear-queue-link" onClick={() => setUploadQueue([])}>
                  Clear All
                </button>
              )}
            </div>

            {uploadQueue.length === 0 ? (
              <div className="queue-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <p>No documents staged for ingestion</p>
                <span>Drop files on the left or select a sample preset above</span>
              </div>
            ) : (
              <div className="queue-items-list">
                {uploadQueue.map(item => (
                  <div key={item.id} className="queue-item">
                    <div className="queue-item-top">
                      <span className="queue-item-name">{item.name}</span>
                      <span className="queue-item-status">{item.status}</span>
                    </div>
                    <div className="queue-item-meta">
                      <span>{item.docClass}</span>
                      <span>{item.size}</span>
                    </div>
                    {item.progress > 0 && (
                      <div className="item-progress-track">
                        <div className="item-progress-fill" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="queue-card-footer">
              <button
                className="start-pipeline-btn"
                disabled={uploadQueue.length === 0 || isProcessing}
                onClick={handleStartIngestion}
              >
                {isProcessing ? 'Processing Vision OCR Pipeline...' : `Run Extraction Pipeline (${uploadQueue.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
