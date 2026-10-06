import React, { useState, useRef, useEffect } from 'react';

export default function Header({
  activeTab,
  setActiveTab,
  totalFiles,
  onOpenFileNetModal,
  selectedLocation,
  setSelectedLocation,
  notifications,
  onClearNotifications
}) {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const locRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const locations = [
    { id: 'atl', name: 'ATL - Hartsfield Fleet Hub', region: 'Southeast' },
    { id: 'lax', name: 'LAX - Los Angeles Fleet Ops', region: 'West' },
    { id: 'ord', name: 'ORD - Chicago Logistics Hub', region: 'Midwest' },
    { id: 'dfw', name: 'DFW - Dallas Fleet Terminal', region: 'South' },
    { id: 'ewr', name: 'EWR - Newark Operations', region: 'Northeast' }
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (locRef.current && !locRef.current.contains(e.target)) setShowLocationMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      {/* Left: Brand & Tenant Switcher */}
      <div className="header-left">
        <div className="brand-wrapper" onClick={() => setActiveTab('files')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="IntelliExtract" className="brand-logo" />
          <span className="brand-tag">ENTERPRISE</span>
        </div>

        <div className="tenant-divider"></div>

        {/* Tenant / Location Selector */}
        <div className="tenant-selector" ref={locRef}>
          <button 
            className="tenant-btn" 
            onClick={() => setShowLocationMenu(!showLocationMenu)}
            title="Switch Fleet Operating Center"
          >
            <div className="tenant-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="tenant-info">
              <span className="tenant-label">Hertz Global Fleet</span>
              <span className="tenant-current">{selectedLocation.name}</span>
            </div>
            <svg className={`chevron-icon ${showLocationMenu ? 'rotated' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showLocationMenu && (
            <div className="tenant-dropdown-menu">
              <div className="dropdown-menu-header">
                <span>Select Fleet Facility</span>
                <span className="badge-micro">US-PROD</span>
              </div>
              {locations.map(loc => (
                <div 
                  key={loc.id} 
                  className={`tenant-dropdown-item ${selectedLocation.id === loc.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationMenu(false);
                  }}
                >
                  <div className="item-details">
                    <span className="item-name">{loc.name}</span>
                    <span className="item-region">{loc.region} Region</span>
                  </div>
                  {selectedLocation.id === loc.id && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Module Navigation Pills */}
      <nav className="header-nav">
        <button 
          className={`nav-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>Document Queue</span>
          <span className="nav-badge">{totalFiles}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Batch Ingestion</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span>Executive Analytics</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'filenet' ? 'active' : ''}`}
          onClick={onOpenFileNetModal}
        >
          <div className="status-dot-pulse"></div>
          <span>FileNet ECM</span>
        </button>
      </nav>

      {/* Right: Status, Notifications & Auditor Profile */}
      <div className="header-right">
        {/* Connection Status Pill */}
        <div className="connection-pill" onClick={onOpenFileNetModal} title="Click to open FileNet ECM Console">
          <span className="connection-dot"></span>
          <span className="connection-text">FileNet P8: <strong>CONNECTED</strong></span>
        </div>

        {/* Notifications Center */}
        <div className="header-action-wrapper" ref={notifRef}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Notifications & Audit Alerts"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications && notifications.length > 0 && (
              <span className="notif-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notifications-dropdown">
              <div className="notif-header">
                <div>
                  <h4>Audit & Pipeline Events</h4>
                  <p>{notifications.length} real-time alerts</p>
                </div>
                {notifications.length > 0 && (
                  <button className="text-btn" onClick={onClearNotifications}>Clear all</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No unread notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item ${n.type}`}>
                      <div className="notif-icon">
                        {n.type === 'success' && '✓'}
                        {n.type === 'warning' && '⚠'}
                        {n.type === 'info' && 'ℹ'}
                      </div>
                      <div className="notif-content">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-time">{n.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="user-profile-wrapper" ref={userRef}>
          <button 
            className="user-profile-btn" 
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">SC</div>
            <div className="user-info">
              <span className="user-name">Sarah Chen</span>
              <span className="user-role">Lead Fleet Auditor</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-menu-header">
                <strong>Sarah Chen</strong>
                <span>s.chen@hertz.com</span>
                <span className="badge-role">Operations Administrator</span>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-item" onClick={() => setActiveTab('files')}>
                <span>All Documents</span>
              </div>
              <div className="user-menu-item" onClick={() => setActiveTab('analytics')}>
                <span>SLA Dashboard</span>
              </div>
              <div className="user-menu-item" onClick={onOpenFileNetModal}>
                <span>FileNet Gateway Configuration</span>
              </div>
              <div className="user-menu-divider"></div>
              <div className="user-menu-item logout">
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
