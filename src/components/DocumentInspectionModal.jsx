import React, { useState, useEffect } from 'react';
import { validateVIN, autoCorrectVIN } from '../utils/vinValidator';

export default function DocumentInspectionModal({
  file,
  onClose,
  onUpdateFile,
  onPushToFileNet,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState(file.needManual > 0 ? 'manual' : 'found');
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [highlightedVinId, setHighlightedVinId] = useState(null);

  // Local state for manual verification editable inputs
  const [manualVins, setManualVins] = useState(file.manualVins || []);
  const [extractedVins, setExtractedVins] = useState(file.extractedVins || []);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSyncingFileNet, setIsSyncingFileNet] = useState(false);

  // New VIN manual add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVinText, setNewVinText] = useState('');
  const [newVinMileage, setNewVinMileage] = useState('');

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Recalculate file metrics when VINs change
  const syncFileChanges = (newExtracted, newManual) => {
    setExtractedVins(newExtracted);
    setManualVins(newManual);

    const total = newExtracted.length + newManual.length;
    const found = newExtracted.length;
    const needManual = newManual.length;
    const accuracy = total > 0 ? Math.round((found / total) * 100) : 100;
    const status = needManual === 0 ? 'Verified' : 'Action Required';

    onUpdateFile({
      ...file,
      extractedVins: newExtracted,
      manualVins: newManual,
      totalVin: total,
      found,
      needManual,
      accuracy,
      status
    });
  };

  // Handle manual VIN text input changes & validation
  const handleManualVinChange = (id, newText) => {
    const updated = manualVins.map(item => {
      if (item.id === id) {
        const valRes = validateVIN(newText);
        return {
          ...item,
          vin: newText.toUpperCase(),
          validation: valRes
        };
      }
      return item;
    });
    setManualVins(updated);
  };

  // Auto-correct a specific manual VIN
  const handleAutoCorrect = (id) => {
    const target = manualVins.find(m => m.id === id);
    if (!target) return;

    const fixed = autoCorrectVIN(target.vin);
    handleManualVinChange(id, fixed);
    onShowToast(`AI suggested correction applied for VIN: ${fixed}`, 'info');
  };

  // Resolve / verify an individual manual VIN
  const handleResolveManualVin = (item) => {
    const valRes = validateVIN(item.vin);
    if (!valRes.isValid) {
      onShowToast(`Cannot resolve: ${valRes.reason}`, 'warning');
      return;
    }

    const newManual = manualVins.filter(m => m.id !== item.id);
    const newExtracted = [
      ...extractedVins,
      {
        id: `resolved-${item.id}`,
        vin: item.vin,
        page: item.page,
        mileage: item.mileage || '14,200',
        area: item.area || 'Verified Staging',
        unit: item.unit || 'HZ-VERIFIED',
        confidence: 99.8,
        make: item.make || 'Verified Fleet',
        model: item.model || 'Standard',
        year: item.year || 2025,
        bbox: item.bbox || { x: 58, y: 35, w: 30, h: 4 }
      }
    ];

    syncFileChanges(newExtracted, newManual);
    onShowToast(`VIN ${item.vin} verified and added to matched set`, 'success');
  };

  // Delete an individual manual VIN
  const handleDeleteManualVin = (id) => {
    const newManual = manualVins.filter(m => m.id !== id);
    syncFileChanges(extractedVins, newManual);
    onShowToast('Flagged VIN item removed', 'info');
  };

  // Delete all unresolved manual VINs
  const handleDeleteAllManual = () => {
    syncFileChanges(extractedVins, []);
    onShowToast('All unresolved VIN items cleared', 'info');
  };

  // Add a new manual VIN
  const handleAddNewVin = () => {
    if (!newVinText.trim()) return;
    const valRes = validateVIN(newVinText);
    const newItem = {
      id: `manual-custom-${Date.now()}`,
      vin: newVinText.trim().toUpperCase(),
      page: currentPage,
      mileage: newVinMileage || '0',
      area: 'Manual Intake',
      unit: 'ADD-01',
      errorReason: valRes.isValid ? null : valRes.reason,
      confidence: 100,
      bbox: { x: 58, y: 40, w: 30, h: 4 }
    };

    if (valRes.isValid) {
      const newExtracted = [...extractedVins, newItem];
      syncFileChanges(newExtracted, manualVins);
      onShowToast(`Valid VIN ${newItem.vin} added directly to matched set!`, 'success');
    } else {
      const newManual = [...manualVins, newItem];
      syncFileChanges(extractedVins, newManual);
      onShowToast(`VIN ${newItem.vin} added to manual review queue: ${valRes.reason}`, 'warning');
    }

    setNewVinText('');
    setNewVinMileage('');
    setShowAddForm(false);
  };

  // Deep AI Re-scan simulation
  const handleDeepScan = () => {
    setIsScanning(true);
    setScanProgress(10);

    const step1 = setTimeout(() => setScanProgress(35), 400);
    const step2 = setTimeout(() => setScanProgress(70), 800);
    const step3 = setTimeout(() => {
      setScanProgress(100);

      // Convert all manual VINs into verified VINs with auto-correction
      const repairedManuals = manualVins.map(m => {
        const fixed = autoCorrectVIN(m.vin);
        return {
          id: `ai-repaired-${m.id}`,
          vin: fixed,
          page: m.page,
          mileage: m.mileage || '18,500',
          area: m.area || 'AI Verified',
          unit: m.unit || 'HZ-AI',
          confidence: 99.4,
          make: m.make || 'Fleet Unit',
          model: m.model || 'Standard',
          year: m.year || 2025,
          bbox: m.bbox
        };
      });

      const allExtracted = [...extractedVins, ...repairedManuals];
      syncFileChanges(allExtracted, []);
      setIsScanning(false);
      setActiveTab('found');
      onShowToast(`AI Vision OCR scan completed: ${repairedManuals.length} VIN(s) rectified & verified!`, 'success');
    }, 1300);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  // Push to FileNet ECM directly from modal
  const handleFileNetPush = () => {
    setIsSyncingFileNet(true);
    setTimeout(() => {
      setIsSyncingFileNet(false);
      onPushToFileNet(file);
      onShowToast(`Document #${file.name} successfully indexed in FileNet P8 Content Engine!`, 'success');
    }, 900);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    onShowToast(`Copied to clipboard: ${text}`, 'info');
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') onClose(); }}>
      <div className="modal-container">
        {/* Modal Top Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="doc-title-row">
              <span className="doc-type-icon">PDF</span>
              <h2 className="modal-doc-title" title={file.name}>{file.name}</h2>
              <button 
                className="copy-doc-btn" 
                onClick={() => copyToClipboard(file.name)}
                title="Copy file name"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              <span className="doc-class-pill-header">{file.docClass}</span>
            </div>

            {/* Metadata Pills Strip */}
            <div className="modal-pills-strip">
              <span className="metric-pill">
                <strong>Total VINs:</strong> {extractedVins.length + manualVins.length}
              </span>
              <span className="metric-pill success">
                <strong>Found:</strong> {extractedVins.length}
              </span>
              <span className={`metric-pill ${manualVins.length > 0 ? 'danger' : 'neutral'}`}>
                <strong>Manual Review:</strong> {manualVins.length}
              </span>
              <span className="metric-pill info">
                <strong>Latency:</strong> {file.processingTime || '1.12s'}
              </span>
              <span className="metric-pill muted">
                <strong>Pages:</strong> {file.pages}
              </span>
              <span className="metric-pill muted">
                <strong>Engine:</strong> Gemini 2.5 Vision OCR
              </span>
            </div>
          </div>

          <div className="modal-header-actions">
            <button 
              className={`filenet-sync-btn ${isSyncingFileNet ? 'syncing' : ''}`}
              onClick={handleFileNetPush}
              disabled={isSyncingFileNet}
              title="Push verified metadata to IBM FileNet P8 Content Engine"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{isSyncingFileNet ? 'Syncing...' : 'Sync to FileNet'}</span>
            </button>

            <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Main Split Body */}
        <div className="modal-body-split">
          {/* Left Pane: Extraction Data & Verification Workspace */}
          <div className="inspection-pane-left">
            {/* Tabs Bar */}
            <div className="inspection-tabs-bar">
              <button
                className={`inspection-tab ${activeTab === 'found' ? 'active' : ''}`}
                onClick={() => setActiveTab('found')}
              >
                <span>Found VINs</span>
                <span className="tab-count-badge found">{extractedVins.length}</span>
              </button>

              <button
                className={`inspection-tab ${activeTab === 'manual' ? 'active' : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                <span>Manual Verification</span>
                <span className={`tab-count-badge ${manualVins.length > 0 ? 'review' : 'zero'}`}>
                  {manualVins.length}
                </span>
              </button>

              <button
                className={`inspection-tab ${activeTab === 'metadata' ? 'active' : ''}`}
                onClick={() => setActiveTab('metadata')}
              >
                <span>FileNet ECM Tags</span>
              </button>
            </div>

            {/* TAB 1: FOUND VINS TABLE */}
            {activeTab === 'found' && (
              <div className="tab-pane-content">
                <div className="pane-section-header">
                  <div>
                    <h3 className="section-title">Verified & Extracted VINs</h3>
                    <p className="section-subtitle">High-confidence OCR extractions with valid ISO 3779 checksums</p>
                  </div>
                  <button 
                    className="add-vin-trigger-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    + Add Missing VIN
                  </button>
                </div>

                {/* Inline Add VIN Box */}
                {showAddForm && (
                  <div className="inline-add-vin-box">
                    <div className="add-vin-inputs">
                      <input
                        type="text"
                        placeholder="Enter 17-character VIN..."
                        value={newVinText}
                        onChange={(e) => setNewVinText(e.target.value.toUpperCase())}
                        maxLength={17}
                        className="font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Mileage (e.g. 14,200)"
                        value={newVinMileage}
                        onChange={(e) => setNewVinMileage(e.target.value)}
                        style={{ width: '140px' }}
                      />
                    </div>
                    <div className="add-vin-btns">
                      <button className="confirm-add-btn" onClick={handleAddNewVin}>
                        Validate & Insert
                      </button>
                      <button className="cancel-add-btn" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {extractedVins.length > 0 ? (
                  <div className="vins-table-scroll">
                    <table className="inspection-sub-table">
                      <thead>
                        <tr>
                          <th>Pg</th>
                          <th>VIN (17-Digit)</th>
                          <th>Vehicle / Spec</th>
                          <th>Mileage</th>
                          <th>Area / Unit</th>
                          <th>Confidence</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedVins.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className={`vin-table-row ${highlightedVinId === item.id ? 'highlighted' : ''}`}
                            onMouseEnter={() => setHighlightedVinId(item.id)}
                            onMouseLeave={() => setHighlightedVinId(null)}
                          >
                            <td className="text-center font-mono">
                              <span className="page-pill">P.{item.page || 1}</span>
                            </td>
                            <td>
                              <div className="vin-cell">
                                <span className="vin-text font-mono">{item.vin}</span>
                                <button
                                  className="copy-tiny-btn"
                                  onClick={() => copyToClipboard(item.vin)}
                                  title="Copy VIN"
                                >
                                  📋
                                </button>
                              </div>
                            </td>
                            <td>
                              <span className="vehicle-desc">
                                {item.year ? `${item.year} ` : ''}{item.make || ''} {item.model || ''}
                              </span>
                            </td>
                            <td className="font-mono text-muted">{item.mileage || '-'}</td>
                            <td>
                              <span className="unit-badge">{item.unit || item.area || 'Zone A'}</span>
                            </td>
                            <td>
                              <div className="confidence-pill high">
                                <span>{item.confidence || 99.4}%</span>
                              </div>
                            </td>
                            <td className="text-right">
                              <span className="verified-check-pill" title="ISO 3779 Validated">
                                ✓ Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-sub-state">
                    <p>No VINs extracted yet. Run deep OCR scan or manually verify flagged items.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MANUAL VERIFICATION REQUIRED */}
            {activeTab === 'manual' && (
              <div className="tab-pane-content">
                <div className="pane-section-header">
                  <div>
                    <h3 className="section-title text-danger">Unresolved Extractions</h3>
                    <p className="section-subtitle">
                      Review low-confidence OCR tokens, validate check digits, or trigger AI deep OCR re-scan
                    </p>
                  </div>
                  {manualVins.length > 0 && (
                    <button className="delete-all-btn" onClick={handleDeleteAllManual}>
                      Delete All Unresolved
                    </button>
                  )}
                </div>

                {isScanning && (
                  <div className="scanning-banner">
                    <div className="scan-top">
                      <span><strong>AI Vision OCR Re-scan in progress...</strong></span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="scan-bar-track">
                      <div className="scan-bar-fill" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                    <span className="scan-sub">
                      Re-segmenting document bounding boxes, applying check digit transliteration...
                    </span>
                  </div>
                )}

                {manualVins.length > 0 ? (
                  <div className="manual-vins-list">
                    {manualVins.map((item) => {
                      const valResult = validateVIN(item.vin);
                      return (
                        <div key={item.id} className="manual-review-card">
                          <div className="card-top-row">
                            <div className="page-indicator">
                              <span className="pg-badge">Page {item.page || 2}</span>
                              <span className="error-reason-tag">
                                ⚠ {item.errorReason || valResult.reason || 'Check digit mismatch'}
                              </span>
                            </div>
                            <div className="card-actions-quick">
                              <button
                                className="auto-correct-btn"
                                onClick={() => handleAutoCorrect(item.id)}
                                title="Auto-fix OCR character confusions (e.g. O->0, I->1)"
                              >
                                ⚡ AI Auto-Fix
                              </button>
                              <button
                                className="remove-item-btn"
                                onClick={() => handleDeleteManualVin(item.id)}
                                title="Remove this flagged entry"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          <div className="manual-input-row">
                            <div className="input-with-validation">
                              <label className="input-label">Extracted VIN (Editable):</label>
                              <div className="input-field-wrap">
                                <input
                                  type="text"
                                  value={item.vin}
                                  onChange={(e) => handleManualVinChange(item.id, e.target.value)}
                                  className={`vin-editor-input font-mono ${valResult.isValid ? 'valid' : 'invalid'}`}
                                  maxLength={17}
                                />
                                <span className={`validation-status-icon ${valResult.isValid ? 'valid' : 'invalid'}`}>
                                  {valResult.isValid ? '✓ Valid Checksum' : '✗ Invalid'}
                                </span>
                              </div>
                              {!valResult.isValid && (
                                <span className="validation-hint-text">
                                  {valResult.reason}
                                </span>
                              )}
                            </div>

                            <button
                              className="accept-resolve-btn"
                              onClick={() => handleResolveManualVin(item)}
                              disabled={!valResult.isValid}
                              title={valResult.isValid ? "Accept and mark verified" : "Enter a valid 17-digit VIN first"}
                            >
                              Verify & Resolve
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="all-clear-box">
                    <div className="all-clear-icon">✓</div>
                    <h4>All VINs verified!</h4>
                    <p>No manual verification required for this document. It is ready for FileNet sync.</p>
                  </div>
                )}

                {/* Bottom Trigger: Run Deep AI Scan */}
                {manualVins.length > 0 && (
                  <div className="pane-footer-action">
                    <button
                      className="run-deep-scan-btn"
                      onClick={handleDeepScan}
                      disabled={isScanning}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>
                        {isScanning ? 'Deep Scanning...' : 'Run AI VIN Lookup & Deep OCR Rectification'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FILENET ECM METADATA */}
            {activeTab === 'metadata' && (
              <div className="tab-pane-content">
                <div className="pane-section-header">
                  <div>
                    <h3 className="section-title">Enterprise FileNet ECM Properties</h3>
                    <p className="section-subtitle">IBM FileNet P8 Content Engine class mapping & indexing taxonomy</p>
                  </div>
                </div>

                <div className="metadata-grid">
                  <div className="meta-item">
                    <span className="meta-key">Object Store</span>
                    <span className="meta-val font-mono">ECM_FLEET_OPS_PROD_01</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Document Class</span>
                    <span className="meta-val font-mono">{file.docClass}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">FileNet Document ID</span>
                    <span className="meta-val font-mono">{file.fileNetId || 'FN-20260323-90412'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Fleet Account</span>
                    <span className="meta-val">{file.account || 'HERTZ VEHICLES LLC'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Facility Location</span>
                    <span className="meta-val">{file.location || 'ATL - Hartsfield Fleet Hub'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-key">Sync Status</span>
                    <span className={`meta-status-pill ${file.status === 'Verified' ? 'synced' : 'pending'}`}>
                      {file.status === 'Verified' ? 'SYNCED TO FILENET' : 'READY FOR SYNC'}
                    </span>
                  </div>
                  <div className="meta-item col-span-2">
                    <span className="meta-key">Indexed VIN Array ({extractedVins.length} items)</span>
                    <div className="meta-vin-tokens">
                      {extractedVins.map(v => (
                        <span key={v.id} className="vin-token font-mono">{v.vin}</span>
                      ))}
                      {extractedVins.length === 0 && <span className="text-muted">None indexed yet</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Pane: High-Fidelity Document Viewer Simulation */}
          <div className="inspection-pane-right">
            {/* Viewer Controls Toolbar */}
            <div className="viewer-toolbar">
              <div className="viewer-page-nav">
                <button
                  className="viewer-tool-icon"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  ◀
                </button>
                <span className="page-indicator-text">
                  Page <strong>{currentPage}</strong> of <strong>{file.pages || 1}</strong>
                </span>
                <button
                  className="viewer-tool-icon"
                  disabled={currentPage >= (file.pages || 1)}
                  onClick={() => setCurrentPage(p => Math.min(file.pages || 1, p + 1))}
                  title="Next page"
                >
                  ▶
                </button>
              </div>

              <div className="viewer-tools-group">
                <button
                  className="viewer-tool-btn"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  title="Rotate 90°"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  <span>{rotation}°</span>
                </button>

                <button
                  className="viewer-tool-btn"
                  onClick={() => setZoomLevel(z => Math.max(50, z - 25))}
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="zoom-text">{zoomLevel}%</span>
                <button
                  className="viewer-tool-btn"
                  onClick={() => setZoomLevel(z => Math.min(200, z + 25))}
                  title="Zoom In"
                >
                  +
                </button>

                <button
                  className={`viewer-toggle-btn ${showBoundingBoxes ? 'active' : ''}`}
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  title="Toggle OCR Bounding Boxes overlay"
                >
                  Bounding Boxes: <strong>{showBoundingBoxes ? 'ON' : 'OFF'}</strong>
                </button>
              </div>
            </div>

            {/* Document Canvas Container */}
            <div className="viewer-canvas-scroll">
              <div
                className="document-paper-sheet"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.25s ease'
                }}
              >
                {/* Simulated Enterprise Vehicle Document Header */}
                <div className="paper-doc-header">
                  <div className="paper-logo-block">
                    <div className="paper-emblem">HERTZ</div>
                    <span className="paper-corp">FLEET OPERATIONS & LOGISTICS</span>
                  </div>
                  <div className="paper-form-title">
                    <h3>{file.docClass.toUpperCase()}</h3>
                    <span>FORM REF: HZ-P8-{file.id.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="paper-barcode-mock">
                    ||| | |||| | ||| |||| | |||
                  </div>
                </div>

                <div className="paper-meta-table">
                  <div className="meta-cell">
                    <strong>LOCATION:</strong> {file.location || 'ATL FLEET HUB'}
                  </div>
                  <div className="meta-cell">
                    <strong>DATE:</strong> 2026-03-23
                  </div>
                  <div className="meta-cell">
                    <strong>ACCOUNT:</strong> HERTZ VEHICLES LLC
                  </div>
                  <div className="meta-cell">
                    <strong>PAGE:</strong> {currentPage} / {file.pages}
                  </div>
                </div>

                {/* Simulated Document Table of Units */}
                <div className="paper-units-table">
                  <div className="paper-th-row">
                    <span style={{ width: '40px' }}>LINE</span>
                    <span style={{ width: '90px' }}>UNIT #</span>
                    <span style={{ flex: 1 }}>VEHICLE IDENTIFICATION NUMBER (VIN)</span>
                    <span style={{ width: '80px' }}>MILEAGE</span>
                    <span style={{ width: '70px' }}>STATUS</span>
                  </div>

                  {/* Render simulated rows matching extracted VINs */}
                  {extractedVins.map((item, i) => (
                    <div
                      key={item.id || i}
                      className={`paper-td-row ${highlightedVinId === item.id ? 'highlight-box-match' : ''}`}
                    >
                      <span style={{ width: '40px' }}>{i + 1}</span>
                      <span style={{ width: '90px' }}>{item.unit || `HZ-${400 + i}`}</span>
                      <span style={{ flex: 1 }} className="font-mono vin-paper-cell">
                        {item.vin}
                        {showBoundingBoxes && (
                          <span className="bbox-verified-tag" title="Matched & Verified">
                            [OCR 99.4%]
                          </span>
                        )}
                      </span>
                      <span style={{ width: '80px' }}>{item.mileage || '18,420'}</span>
                      <span style={{ width: '70px', color: '#16a34a' }}>VERIFIED</span>
                    </div>
                  ))}

                  {/* Render simulated manual verification rows */}
                  {manualVins.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="paper-td-row paper-row-warning"
                    >
                      <span style={{ width: '40px' }}>{extractedVins.length + i + 1}</span>
                      <span style={{ width: '90px' }}>{item.unit || `HZ-REV`}</span>
                      <span style={{ flex: 1 }} className="font-mono vin-paper-cell warning">
                        {item.vin}
                        {showBoundingBoxes && (
                          <span className="bbox-manual-tag" title="Review Required">
                            [OCR REVIEW REQ]
                          </span>
                        )}
                      </span>
                      <span style={{ width: '80px' }}>{item.mileage || '14,300'}</span>
                      <span style={{ width: '70px', color: '#dc2626' }}>FLAGGED</span>
                    </div>
                  ))}

                  {/* Filler rows for realism */}
                  {Array.from({ length: Math.max(0, 8 - (extractedVins.length + manualVins.length)) }).map((_, fIdx) => (
                    <div key={`fill-${fIdx}`} className="paper-td-row filler">
                      <span style={{ width: '40px' }}>{extractedVins.length + manualVins.length + fIdx + 1}</span>
                      <span style={{ width: '90px' }}>HZ-STANDBY</span>
                      <span style={{ flex: 1 }} className="font-mono text-muted">-----------------</span>
                      <span style={{ width: '80px' }}>--</span>
                      <span style={{ width: '70px' }}>N/A</span>
                    </div>
                  ))}
                </div>

                {/* Footer Certification */}
                <div className="paper-footer-sig">
                  <div>
                    <span className="sig-line">AUDITOR SIGNATURE: Sarah Chen</span>
                    <span className="sig-date">PROCESSED VIA INTELLIEXTRACT ENGINE</span>
                  </div>
                  <div className="paper-stamp">
                    HERTZ FLEET ECM CERTIFIED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
