import { useState, useEffect, useRef } from 'react'
import './index.css'

const DOCUMENT_CLASSES = [
  "Accident Report",
  "Attachments",
  "Bill of Lading (BOL)",
  "CA Rental Agreement",
  "Condition Report",
  "Manual Rental Agreement",
  "Preventative Maintenance",
  "Registration",
  "Shuttle Ticket",
  "Shop Repair Order (SRO)",
  "Thermal",
  "Tow Ticket",
  "Vehicle Damage Appraisal (VDA)",
  "Vehicle Damage Appraisal Invoice (VDA Invoice)",
  "Vehicle Maintenance History File (VHMF)"
];

// Mock data based on the screenshot, but updated to include the classes requested
const MOCK_FILES = [
  {
    id: 1,
    name: '20260323_120938_multiple pages 2.pdf',
    docClass: 'Condition Report',
    totalVin: 56,
    pages: 14,
    found: 0,
    needManual: 56,
    accuracy: 0,
    status: 'Action Required'
  },
  {
    id: 2,
    name: '20260323_120909_BOL YB 1_20 41units.pdf',
    docClass: 'Bill of Lading (BOL)',
    totalVin: 41,
    pages: 4,
    found: 0,
    needManual: 41,
    accuracy: 0,
    status: 'Action Required'
  },
  {
    id: 3,
    name: '20260323_115419_DOC001.pdf',
    docClass: 'Accident Report',
    totalVin: 5,
    pages: 1,
    found: 0,
    needManual: 5,
    accuracy: 0,
    status: 'Action Required'
  },
  {
    id: 4,
    name: '20260320_182122_HERTZ_00009370UT.pdf',
    docClass: 'CA Rental Agreement',
    totalVin: 2,
    pages: 1,
    found: 2,
    needManual: 0,
    accuracy: 100,
    status: 'Verified'
  },
  {
    id: 5,
    name: '20260320_182047_HERTZ_00009369CA.pdf',
    docClass: 'Vehicle Damage Appraisal (VDA)',
    totalVin: 9,
    pages: 1,
    found: 3,
    needManual: 6,
    accuracy: 33,
    status: 'Action Required'
  },
  {
    id: 6,
    name: '20260320_145909_nj 03-18-26.pdf',
    docClass: 'Registration',
    totalVin: 44,
    pages: 3,
    found: 1,
    needManual: 43,
    accuracy: 2,
    status: 'Action Required'
  },
  {
    id: 7,
    name: '20260320_122426_Multiple pages.pdf',
    docClass: 'Shop Repair Order (SRO)',
    totalVin: 57,
    pages: 14,
    found: 32,
    needManual: 25,
    accuracy: 56,
    status: 'Action Required'
  },
  {
    id: 8,
    name: '20260321_102030_PENDING_DOC.pdf',
    docClass: 'Condition Report',
    totalVin: 12,
    pages: 3,
    found: 0,
    needManual: 12,
    accuracy: 0,
    status: 'Pending'
  },
  {
    id: 9,
    name: '20260322_091522_INPROGRESS_DOC.pdf',
    docClass: 'Preventative Maintenance',
    totalVin: 5,
    pages: 2,
    found: 2,
    needManual: 3,
    accuracy: 40,
    status: 'In Progress'
  },
  {
    id: 10,
    name: '20260320_081010_INVALID_FILE.pdf',
    docClass: 'Thermal',
    totalVin: 0,
    pages: 1,
    found: 0,
    needManual: 0,
    accuracy: 0,
    status: 'Invalid'
  }
];

const HighlightText = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <span key={i} style={{ color: '#ea580c', fontWeight: '900' }}>{part}</span> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

const parseFileName = (fileName) => {
  const match = fileName.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(.+)$/);
  if (match) {
    const [_, year, month, day, hour, minute, second, restOfName] = match;
    const dateObj = new Date(year, parseInt(month) - 1, day);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = `${hour}:${minute}:${second}`;
    
    return {
      isParsed: true,
      originalName: fileName,
      date: dateStr,
      time: timeStr,
      displayName: restOfName
    };
  }
  return {
    isParsed: false,
    originalName: fileName,
    displayName: fileName
  };
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotMatched, setShowNotMatched] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, statusDropdownRef, searchRef]);

  const [filters, setFilters] = useState({
    name: '',
    docClass: 'All',
    status: 'All'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [files] = useState(MOCK_FILES);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredFiles = files.filter(f => {
    const matchName = f.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchClass = filters.docClass === 'All' || f.docClass === filters.docClass;
    const matchStatus = filters.status === 'All' || f.status === filters.status;
    return matchName && matchClass && matchStatus;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src="/logo.png" alt="IntelliExtract Logo" style={{ height: '40px', objectFit: 'contain' }} />
        </div>
        <div className="header-actions">
          <div className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Home
          </div>
          <div className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            FileNet
          </div>
          <div className="header-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </header>

      <div className="main-layout" style={{ position: 'relative', overflowX: 'hidden', display: 'flex' }}>
        {!selectedFile && (
          <aside className={`custom-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                {isSidebarOpen ? (
                  <polyline points="15 18 9 12 15 6"></polyline>
                ) : (
                  <polyline points="9 18 15 12 9 6"></polyline>
                )}
              </svg>
            </button>

            <div className="sidebar-content">
              {/* Extended Items (VIN Toggle & Stats) Moved to Top */}
              <div style={{ padding: '0 12px' }}>
                <div className={`sidebar-section-header ${!isSidebarOpen ? 'collapsed' : ''}`} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isSidebarOpen ? (
                     <div className="nav-item-icon" style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                     </div>
                  ) : (
                     <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insights & Filters</span>
                  )}
                </div>

                <div 
                  className="nav-item" 
                  onClick={() => setShowNotMatched(!showNotMatched)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="nav-item-icon">
                    <div className={`custom-checkbox ${showNotMatched ? 'checked' : ''}`} style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2px solid #ea580c', 
                      borderRadius: '4px', 
                      background: showNotMatched ? '#ea580c' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {showNotMatched && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                  </div>
                  <span className="nav-item-label" style={{ fontSize: '13px', color: '#ea580c', fontWeight: '700' }}>Show Not Matched VINs</span>
                </div>

                {isSidebarOpen && (
                  <div className="stat-cards-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    <div className="stat-card">
                      <div className="stat-title">Total Files</div>
                      <div className="stat-value">361</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Action Required</div>
                      <div className="stat-value danger">282</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Verified Files</div>
                      <div className="stat-value success">64</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
        <main className="content-area" style={{ padding: '24px 32px', flex: 1, minWidth: 0 }}>
          {selectedFile && (
            <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setSelectedFile(null); }}>
              <div className="modal-container">
                <div className="modal-header">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="detail-title" style={{ margin: 0 }}>{selectedFile.name}</h2>
                    <div className="detail-pills" style={{ marginTop: '8px' }}>
                      <span className="detail-pill generic-outline">Total VINs: {selectedFile.totalVin}</span>
                      <span className="detail-pill red-outline">Not found: {selectedFile.needManual}</span>
                      <span className="detail-pill blue-outline">Processing: 0.00s</span>
                      <span className="detail-pill grey-solid">Pages: {selectedFile.pages}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-outline" 
                    onClick={() => setSelectedFile(null)}
                    style={{ padding: '8px 16px', borderRadius: '6px' }}
                  >
                    Close
                  </button>
                </div>

                <div className="modal-body">
                  <div className="modal-pane-left">
                    <h3 className="section-title">Found VINs</h3>
                    <table className="sub-table">
                      <thead>
                        <tr><th>Page</th><th>VIN</th><th>Mileage</th><th>Area</th><th>Unit</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>1</td><td><a href="#" style={{color: '#2563eb', textDecoration: 'underline'}}>5XYRL4JC0RG270559</a></td><td></td><td></td><td></td></tr>
                        <tr><td>1</td><td><a href="#" style={{color: '#2563eb', textDecoration: 'underline'}}>KL77LHEP8SC231401</a></td><td></td><td></td><td></td></tr>
                        <tr><td>1</td><td><a href="#" style={{color: '#2563eb', textDecoration: 'underline'}}>5NMP24GL2SH130350</a></td><td></td><td></td><td></td></tr>
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                         <span>Rows per page:</span>
                         <select style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 4px', background: '#fff' }}>
                           <option>10</option><option>20</option>
                         </select>
                      </div>
                      <div className="pagination-arrows" style={{ padding: 0, gap: '12px' }}>
                         <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>&lt;</button>
                         <span style={{ fontSize: '13px', color: '#1e293b' }}>Page 1 of 1</span>
                         <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#1e293b' }}>&gt;</button>
                      </div>
                    </div>

                    <h3 className="section-title">Manual Verification Required</h3>
                    <table className="sub-table manual-table" style={{ border: '1px solid #f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th>Pg</th><th>Doc</th><th>VIN Extraction (Editable)</th><th>Mileage</th><th>Action</th>
                          <th style={{ textAlign: 'right' }}><button className="delete-btn-header" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>Delete All</button></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>2</td>
                          <td><svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></td>
                          <td><input type="text" className="vin-input-error" defaultValue="3C6UR5DJXTG234631" /></td>
                          <td><span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span></td>
                          <td><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{cursor: 'pointer'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></td>
                          <td style={{ textAlign: 'right' }}><input type="checkbox" style={{width: '16px', height: '16px'}}/></td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td><svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></td>
                          <td><input type="text" className="vin-input-error" defaultValue="3C6UR5DJ8TG234594" /></td>
                          <td><span style={{ color: '#94a3b8', fontSize: '11px' }}>-</span></td>
                          <td><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{cursor: 'pointer'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></td>
                          <td style={{ textAlign: 'right' }}><input type="checkbox" style={{width: '16px', height: '16px'}}/></td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ marginTop: 'auto', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                       <button className="btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '700', background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)', border: 'none' }}>Run VIN Lookup & Extract</button>
                    </div>
                  </div>

                  <div className="modal-pane-right">
                    <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                      <button 
                        className="tool-btn" 
                        style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                        title="Rotate 90°"
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        <span style={{ fontSize: '10px', marginLeft: '4px', fontWeight: '800' }}>{rotation}°</span>
                      </button>
                      <button className="tool-btn" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }} title="Zoom In"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                      <button className="tool-btn" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} title="Zoom Out"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg></button>
                    </div>
                    
                    <div style={{
                      width: '90%', 
                      height: '90%', 
                      border: '1px solid #cbd5e1', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      background: 'white', 
                      borderRadius: '4px', 
                      overflow: 'hidden', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                       <div style={{padding: '12px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', background: '#f8fafc', color: '#475569'}}>DEALER ACCOUNTING REPORT - PAGE 2</div>
                       <div style={{flex: 1, backgroundColor: '#fdfdfd', padding: '24px', overflowY: 'auto'}}>
                         <div style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                           <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '10px'}}>
                              <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                  <th style={{border: '1px solid #cbd5e1', padding: '10px'}}>Date</th>
                                  <th style={{border: '1px solid #cbd5e1', padding: '10px'}}>Customer</th>
                                  <th style={{border: '1px solid #cbd5e1', padding: '10px'}}>VIN</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array(12).fill(0).map((_, i) => (
                                  <tr key={i}>
                                     <td style={{border: '1px solid #cbd5e1', padding: '10px', color: '#64748b'}}>2026-03-19</td>
                                     <td style={{border: '1px solid #cbd5e1', padding: '10px', fontWeight: '500'}}>HERTZ VEHICLES LLC</td>
                                     <td style={{border: '1px solid #cbd5e1', padding: '10px', color: i < 3 ? '#2563eb' : '#dc2626', fontWeight: '600'}}>
                                       {i < 3 ? '5XYRL...0559' : '3C6UR...4631'}
                                     </td>
                                  </tr>
                                ))}
                              </tbody>
                           </table>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="content-header">
            <h1 className="content-title">All Files</h1>
            <div className="header-actions-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              <div className="global-search" ref={searchRef}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Search file names..." 
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                />

                {isSearchFocused && filters.name.length > 0 && (
                  <div className="search-suggestions">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.slice(0, 5).map(file => (
                        <div 
                          key={file.id} 
                          className="suggestion-item"
                          onClick={() => {
                            setSelectedFile(file);
                            setIsSearchFocused(false);
                          }}
                        >
                          <svg className="suggestion-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            <span className="suggestion-name">
                              <HighlightText text={parseFileName(file.name).displayName} highlight={filters.name} />
                            </span>
                            {parseFileName(file.name).isParsed && (
                               <span style={{fontSize: '11px', color: '#94a3b8'}}>{parseFileName(file.name).date}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="suggestion-empty">No matching files found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="custom-dropdown" ref={dropdownRef}>
                <div 
                  className={`dropdown-selected ${isDropdownOpen ? 'open' : ''}`} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="dropdown-label">
                    {filters.docClass === 'All' ? 'All Classes' : filters.docClass}
                  </span>
                  <svg className="caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                <div className={`dropdown-options ${isDropdownOpen ? 'visible' : ''}`}>
                  <div 
                    className={`dropdown-option ${filters.docClass === 'All' ? 'selected' : ''}`}
                    onClick={() => { handleFilterChange('docClass', 'All'); setIsDropdownOpen(false); }}
                  >
                    All Classes
                  </div>
                  {DOCUMENT_CLASSES.map(dc => (
                    <div 
                      key={dc}
                      className={`dropdown-option ${filters.docClass === dc ? 'selected' : ''}`}
                      onClick={() => { handleFilterChange('docClass', dc); setIsDropdownOpen(false); }}
                    >
                      {dc}
                    </div>
                  ))}
                </div>
              </div>

              <div className="custom-dropdown" ref={statusDropdownRef} style={{ width: '180px' }}>
                <div 
                  className={`dropdown-selected ${isStatusDropdownOpen ? 'open' : ''}`} 
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span className="dropdown-label">
                    {filters.status === 'All' ? 'All Statuses' : filters.status}
                  </span>
                  <svg className="caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                <div className={`dropdown-options ${isStatusDropdownOpen ? 'visible' : ''}`}>
                  <div 
                    className={`dropdown-option ${filters.status === 'All' ? 'selected' : ''}`}
                    onClick={() => { handleFilterChange('status', 'All'); setIsStatusDropdownOpen(false); }}
                  >
                    All Statuses
                  </div>
                  {['Action Required', 'Verified', 'Pending', 'In Progress', 'Invalid'].map(st => (
                    <div 
                      key={st}
                      className={`dropdown-option ${filters.status === st ? 'selected' : ''}`}
                      onClick={() => { handleFilterChange('status', st); setIsStatusDropdownOpen(false); }}
                    >
                      {st}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                className="refresh-btn" 
                onClick={handleRefresh}
                style={{ transform: isRefreshing ? 'rotate(180deg)' : 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path></svg>
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>File Name<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Date & Time<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Document Class<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Total VIN<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Pages<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Found<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Manual Verification<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Accuracy<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                  <th style={{ fontWeight: '800' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>Status<svg style={{ marginLeft: '6px', cursor: 'pointer' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => (
                    <tr 
                      key={file.id} 
                      className="clickable-row"
                      style={{animationDelay: `${index * 0.05}s`}}
                      onClick={() => setSelectedFile(file)}
                    >
                      <td>
                        <span className="font-medium" style={{color: '#0f172a', fontSize: '14px'}}>
                          <HighlightText text={file.name} highlight={filters.name} />
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const parsed = parseFileName(file.name);
                          if (parsed.isParsed) {
                            return (
                                <div style={{display: 'flex', flexDirection: 'column', fontSize: '12.5px', color: '#475569', fontWeight: '500'}}>
                                  <span>{parsed.date}</span>
                                  <span style={{color: '#94a3b8'}}>{parsed.time}</span>
                                </div>
                            );
                          }
                          return <span className="text-light">-</span>;
                        })()}
                      </td>
                      <td><span className="file-class-badge">{file.docClass}</span></td>
                      <td className="text-center">
                        <span className="metric-badge vin">{file.totalVin}</span>
                      </td>
                      <td className="text-center">
                        <span className="metric-badge pages">{file.pages}</span>
                      </td>
                      <td className="text-center">
                        <span className="metric-badge found">{file.found}</span>
                      </td>
                      <td className="text-center">
                        <span className="metric-badge manual">{file.needManual}</span>
                      </td>
                      <td className="text-center">
                        <span className="metric-badge accuracy">{file.accuracy}%</span>
                      </td>
                      <td>
                        <div className={`status-badge ${file.status.toLowerCase().replace(' ', '')}`}>
                          {file.status === 'Verified' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>}
                          {file.status === 'Action Required' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>}
                          {file.status === 'Pending' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                          {file.status === 'In Progress' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>}
                          {file.status === 'Invalid' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>}
                          {file.status}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#fff' }}>
                      No files match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
              <div className="pagination-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                 <span>Rows per page:</span>
                 <select style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', outline: 'none', background: 'transparent', cursor: 'pointer', color: '#334155' }}>
                   <option>10</option>
                   <option>20</option>
                   <option>50</option>
                 </select>
              </div>
              <div className="pagination-right" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                 <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '4px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                 <button style={{ border: 'none', background: '#1a73e8', color: 'white', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>1</button>
                 <button style={{ border: 'none', background: 'transparent', color: '#475569', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>2</button>
                 <button style={{ border: 'none', background: 'transparent', color: '#475569', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>3</button>
                 <button style={{ border: 'none', background: 'transparent', color: '#475569', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>4</button>
                 <button style={{ border: 'none', background: 'transparent', color: '#475569', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>5</button>
                 <span style={{ color: '#94a3b8', margin: '0 8px' }}>...</span>
                 <button style={{ border: 'none', background: 'transparent', color: '#475569', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>36</button>
                 <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', padding: '4px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
