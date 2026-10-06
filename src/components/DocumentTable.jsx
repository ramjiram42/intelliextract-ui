import React, { useState, useMemo } from 'react';
import { DOCUMENT_CLASSES, STATUS_LIST } from '../data/mockData';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

export default function DocumentTable({
  files,
  selectedFile,
  onSelectFile,
  filters,
  onFilterChange,
  showNotMatched,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onRefresh,
  isRefreshing,
  onOpenUpload,
  onPushFileNetSingle
}) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFocused, setSearchFocused] = useState(false);

  // Helper to parse filename timestamp
  const parseFileName = (fileName) => {
    const match = fileName.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_(.+)$/);
    if (match) {
      const [_, year, month, day, hour, minute, second, restOfName] = match;
      const dateObj = new Date(year, parseInt(month) - 1, day, hour, minute, second);
      return {
        isParsed: true,
        displayName: restOfName,
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: `${hour}:${minute}:${second}`,
        rawDate: dateObj.getTime()
      };
    }
    return {
      isParsed: false,
      displayName: fileName,
      date: '-',
      time: '-',
      rawDate: 0
    };
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // Name or VIN search
      const q = filters.name.toLowerCase().trim();
      let matchesSearch = true;
      if (q) {
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesClass = f.docClass.toLowerCase().includes(q);
        const matchesVins = (f.extractedVins || []).some(v => v.vin.toLowerCase().includes(q)) ||
                            (f.manualVins || []).some(v => v.vin.toLowerCase().includes(q));
        matchesSearch = matchesName || matchesClass || matchesVins;
      }

      // Class filter
      const matchesClass = filters.docClass === 'All' || f.docClass === filters.docClass;

      // Status filter
      const matchesStatus = filters.status === 'All' || f.status === filters.status;

      // Unmatched VINs toggle filter
      const matchesNotMatched = !showNotMatched || f.needManual > 0;

      return matchesSearch && matchesClass && matchesStatus && matchesNotMatched;
    });
  }, [files, filters, showNotMatched]);

  // Sorted files
  const sortedFiles = useMemo(() => {
    const sorted = [...filteredFiles].sort((a, b) => {
      let valA, valB;

      if (sortField === 'date') {
        valA = parseFileName(a.name).rawDate;
        valB = parseFileName(b.name).rawDate;
      } else if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'accuracy') {
        valA = a.accuracy;
        valB = b.accuracy;
      } else if (sortField === 'totalVin') {
        valA = a.totalVin;
        valB = b.totalVin;
      } else if (sortField === 'found') {
        valA = a.found;
        valB = b.found;
      } else if (sortField === 'needManual') {
        valA = a.needManual;
        valB = b.needManual;
      } else if (sortField === 'pages') {
        valA = a.pages;
        valB = b.pages;
      } else if (sortField === 'status') {
        valA = a.status;
        valB = b.status;
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredFiles, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedFiles.length / rowsPerPage) || 1;
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (clampedPage - 1) * rowsPerPage;
  const currentFiles = sortedFiles.slice(startIndex, startIndex + rowsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isAllCurrentPageSelected = currentFiles.length > 0 && currentFiles.every(f => selectedIds.includes(f.id));

  return (
    <div className="table-workspace">
      {/* Table Header & Controls Bar */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="title-block">
            <h1 className="content-title">Fleet Document Queue</h1>
            <span className="queue-meta">
              Showing {sortedFiles.length} of {files.length} active documents
              {showNotMatched && <span className="active-tag"> • Filtered by Unmatched VINs</span>}
            </span>
          </div>
        </div>

        <div className="toolbar-right">
          {/* Global Search with Dropdown Suggestions */}
          <div className="search-bar-wrapper">
            <div className="search-input-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search file name, VIN, or class..."
                value={filters.name}
                onChange={(e) => onFilterChange('name', e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {filters.name && (
                <button className="clear-search-btn" onClick={() => onFilterChange('name', '')}>
                  ×
                </button>
              )}
            </div>

            {/* Suggestions Popup */}
            {searchFocused && filters.name.length > 0 && (
              <div className="search-suggestions-dropdown">
                {filteredFiles.slice(0, 5).map(f => (
                  <div
                    key={f.id}
                    className="suggestion-row"
                    onMouseDown={() => onSelectFile(f)}
                  >
                    <div className="sug-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      </svg>
                    </div>
                    <div className="sug-info">
                      <span className="sug-name">{parseFileName(f.name).displayName}</span>
                      <span className="sug-meta">{f.docClass} • {f.totalVin} VINs • {f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Class Select */}
          <div className="custom-select-wrapper">
            <select
              value={filters.docClass}
              onChange={(e) => onFilterChange('docClass', e.target.value)}
              className="toolbar-select"
            >
              <option value="All">All Classes ({files.length})</option>
              {DOCUMENT_CLASSES.map(dc => (
                <option key={dc} value={dc}>{dc}</option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="custom-select-wrapper">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="toolbar-select"
            >
              <option value="All">All Statuses</option>
              {STATUS_LIST.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Export & Refresh */}
          <div className="toolbar-btn-group">
            <button
              className="toolbar-action-btn"
              onClick={() => exportToCSV(sortedFiles)}
              title="Download filtered documents as CSV"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export</span>
            </button>

            <button
              className="toolbar-action-btn primary"
              onClick={onOpenUpload}
              title="Upload new documents to extraction pipeline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Ingest</span>
            </button>

            <button
              className={`refresh-btn-icon ${isRefreshing ? 'spinning' : ''}`}
              onClick={onRefresh}
              title="Refresh queue"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main High-Performance Data Table */}
      <div className="table-container">
        <table className="enterprise-data-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  onChange={() => onToggleSelectAll(currentFiles.map(f => f.id))}
                />
              </th>

              <th className="sortable-th" onClick={() => handleSort('name')}>
                <div className="th-content">
                  <span>File Name</span>
                  <SortIcon active={sortField === 'name'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th" onClick={() => handleSort('date')}>
                <div className="th-content">
                  <span>Timestamp</span>
                  <SortIcon active={sortField === 'date'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th" onClick={() => handleSort('docClass')}>
                <div className="th-content">
                  <span>Document Class</span>
                  <SortIcon active={sortField === 'docClass'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th text-center" onClick={() => handleSort('totalVin')}>
                <div className="th-content justify-center">
                  <span>Total VINs</span>
                  <SortIcon active={sortField === 'totalVin'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th text-center" onClick={() => handleSort('pages')}>
                <div className="th-content justify-center">
                  <span>Pages</span>
                  <SortIcon active={sortField === 'pages'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th text-center" onClick={() => handleSort('found')}>
                <div className="th-content justify-center">
                  <span>Found</span>
                  <SortIcon active={sortField === 'found'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th text-center" onClick={() => handleSort('needManual')}>
                <div className="th-content justify-center">
                  <span>Review Req.</span>
                  <SortIcon active={sortField === 'needManual'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th" onClick={() => handleSort('accuracy')}>
                <div className="th-content">
                  <span>Accuracy</span>
                  <SortIcon active={sortField === 'accuracy'} dir={sortDirection} />
                </div>
              </th>

              <th className="sortable-th" onClick={() => handleSort('status')}>
                <div className="th-content">
                  <span>Workflow Status</span>
                  <SortIcon active={sortField === 'status'} dir={sortDirection} />
                </div>
              </th>

              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentFiles.length > 0 ? (
              currentFiles.map((file) => {
                const parsed = parseFileName(file.name);
                const isSelected = selectedIds.includes(file.id);

                return (
                  <tr
                    key={file.id}
                    className={`table-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => onSelectFile(file)}
                  >
                    <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(file.id)}
                      />
                    </td>

                    <td className="td-name">
                      <div className="file-name-cell">
                        <svg className="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div className="file-names">
                          <span className="file-display-name" title={file.name}>
                            {parsed.displayName}
                          </span>
                          <span className="file-full-name">{file.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="td-date">
                      {parsed.isParsed ? (
                        <div className="date-time-stack">
                          <span className="date-str">{parsed.date}</span>
                          <span className="time-str">{parsed.time}</span>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    <td>
                      <span className="doc-class-tag" title={file.docClass}>
                        {file.docClass}
                      </span>
                    </td>

                    <td className="text-center font-mono">
                      <span className="num-pill total">{file.totalVin}</span>
                    </td>

                    <td className="text-center font-mono">
                      <span className="num-pill pages">{file.pages}</span>
                    </td>

                    <td className="text-center font-mono">
                      <span className="num-pill found">{file.found}</span>
                    </td>

                    <td className="text-center font-mono">
                      <span className={`num-pill ${file.needManual > 0 ? 'review' : 'zero'}`}>
                        {file.needManual}
                      </span>
                    </td>

                    <td>
                      <div className="accuracy-cell">
                        <div className="accuracy-bar-track">
                          <div
                            className={`accuracy-bar-fill ${file.accuracy >= 90 ? 'high' : file.accuracy >= 50 ? 'med' : 'low'}`}
                            style={{ width: `${file.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="accuracy-label">{file.accuracy}%</span>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={file.status} />
                    </td>

                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions-group">
                        <button
                          className="row-action-btn view"
                          onClick={() => onSelectFile(file)}
                          title="Inspect document & VINs"
                        >
                          Inspect
                        </button>

                        <button
                          className="row-action-btn icon"
                          onClick={() => onPushFileNetSingle(file)}
                          title="Direct sync to FileNet"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="empty-table-state">
                  <div className="empty-box">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h4>No documents found matching filters</h4>
                    <p>Try clearing search keywords or selecting "All Classes"</p>
                    <button
                      className="reset-filters-btn"
                      onClick={() => onFilterChange('docClass', 'All')}
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="table-pagination">
        <div className="pagination-info">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="pagination-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-muted">
            Showing {sortedFiles.length === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + rowsPerPage, sortedFiles.length)} of {sortedFiles.length}
          </span>
        </div>

        <div className="pagination-controls">
          <button
            className="page-nav-btn"
            disabled={clampedPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            title="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - clampedPage) <= 1)
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="page-ellipsis">…</span>
                  )}
                  <button
                    className={`page-num-btn ${clampedPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button
            className="page-nav-btn"
            disabled={clampedPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            title="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ active, dir }) {
  return (
    <span className={`sort-caret ${active ? 'active' : ''}`}>
      {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  );
}

function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase().replace(/\s+/g, '');
  return (
    <div className={`status-pill ${norm}`}>
      <span className="status-dot"></span>
      <span className="status-text">{status}</span>
    </div>
  );
}
