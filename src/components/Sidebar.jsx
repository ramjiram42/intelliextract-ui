import React from 'react';
import { DOCUMENT_CLASSES } from '../data/mockData';

export default function Sidebar({
  isOpen,
  onToggle,
  filters,
  onFilterChange,
  files,
  showNotMatched,
  onToggleShowNotMatched
}) {
  // Compute counts dynamically
  const totalCount = files.length;
  const actionRequiredCount = files.filter(f => f.status === 'Action Required').length;
  const verifiedCount = files.filter(f => f.status === 'Verified').length;
  const pendingCount = files.filter(f => f.status === 'Pending').length;
  const inProgressCount = files.filter(f => f.status === 'In Progress').length;

  const statusFilters = [
    { id: 'All', label: 'All Documents', count: totalCount, icon: 'folder' },
    { id: 'Action Required', label: 'Action Required', count: actionRequiredCount, color: '#ef4444', icon: 'alert' },
    { id: 'Verified', label: 'Verified & Synced', count: verifiedCount, color: '#10b981', icon: 'check' },
    { id: 'Pending', label: 'Pending Queue', count: pendingCount, color: '#f59e0b', icon: 'clock' },
    { id: 'In Progress', label: 'In Extraction', count: inProgressCount, color: '#3b82f6', icon: 'loader' }
  ];

  return (
    <aside className={`custom-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="sidebar-toggle-btn" 
        onClick={onToggle}
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          {isOpen ? (
            <polyline points="15 18 9 12 15 6" />
          ) : (
            <polyline points="9 18 15 12 9 6" />
          )}
        </svg>
      </button>

      <div className="sidebar-content">
        {/* Navigation & Status Filters Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            {isOpen ? (
              <span className="section-title">Queue Views</span>
            ) : (
              <span className="section-title-dot" title="Queue Views">•</span>
            )}
          </div>

          <div className="sidebar-nav">
            {statusFilters.map(sf => {
              const isActive = filters.status === sf.id;
              return (
                <div
                  key={sf.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onFilterChange('status', sf.id)}
                  title={`${sf.label} (${sf.count})`}
                >
                  <div className="nav-item-icon">
                    {sf.icon === 'folder' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                      </svg>
                    )}
                    {sf.icon === 'alert' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                    {sf.icon === 'check' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    )}
                    {sf.icon === 'clock' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                    {sf.icon === 'loader' && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    )}
                  </div>

                  {isOpen && (
                    <>
                      <span className="nav-item-label">{sf.label}</span>
                      <span className={`nav-item-count ${sf.color ? 'highlight' : ''}`} style={sf.color ? { color: sf.color, borderColor: sf.color } : {}}>
                        {sf.count}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Toggle: Show Not Matched VINs */}
        <div className="sidebar-section">
          <div 
            className={`not-matched-toggle-card ${showNotMatched ? 'active' : ''}`}
            onClick={onToggleShowNotMatched}
            title="Filter documents containing unmatched VINs requiring manual review"
          >
            <div className="toggle-header">
              <div className="toggle-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              </div>
              {isOpen && (
                <div className="toggle-text">
                  <span className="toggle-title">Unmatched VINs</span>
                  <span className="toggle-desc">Isolate review queue</span>
                </div>
              )}
            </div>
            {isOpen && (
              <div className={`switch-track ${showNotMatched ? 'on' : 'off'}`}>
                <div className="switch-thumb"></div>
              </div>
            )}
          </div>
        </div>

        {/* Document Class Quick Picker */}
        {isOpen && (
          <div className="sidebar-section flex-1 overflow-auto">
            <div className="sidebar-section-header">
              <span className="section-title">Document Classes</span>
              <button 
                className="clear-class-btn"
                onClick={() => onFilterChange('docClass', 'All')}
                style={{ display: filters.docClass === 'All' ? 'none' : 'block' }}
              >
                Reset
              </button>
            </div>
            <div className="class-pills-list">
              <button
                className={`class-pill-btn ${filters.docClass === 'All' ? 'active' : ''}`}
                onClick={() => onFilterChange('docClass', 'All')}
              >
                <span>All Classes</span>
                <span className="pill-badge">{totalCount}</span>
              </button>
              {DOCUMENT_CLASSES.slice(0, 8).map(dc => {
                const count = files.filter(f => f.docClass === dc).length;
                return (
                  <button
                    key={dc}
                    className={`class-pill-btn ${filters.docClass === dc ? 'active' : ''}`}
                    onClick={() => onFilterChange('docClass', dc)}
                  >
                    <span className="truncate">{dc}</span>
                    {count > 0 && <span className="pill-badge">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live KPI Metric Cards in Footer */}
        {isOpen && (
          <div className="sidebar-footer">
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-label">Auto Accuracy</span>
                <span className="kpi-val text-emerald">94.2%</span>
              </div>
              <div className="kpi-meter-bg">
                <div className="kpi-meter-fill" style={{ width: '94.2%' }}></div>
              </div>
              <div className="kpi-sub">FileNet SLA: <strong>99.8%</strong></div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
