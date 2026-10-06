import React from 'react';
import { SYSTEM_STATS } from '../data/mockData';

export default function AnalyticsView({ onNavigateToQueue }) {
  const classAccuracies = [
    { name: 'CA Rental Agreement', accuracy: 99.6, count: 48 },
    { name: 'Bill of Lading (BOL)', accuracy: 96.8, count: 82 },
    { name: 'VDA Invoice', accuracy: 95.4, count: 34 },
    { name: 'Preventative Maintenance', accuracy: 93.1, count: 41 },
    { name: 'Condition Report', accuracy: 91.5, count: 95 },
    { name: 'Vehicle Damage Appraisal (VDA)', accuracy: 89.2, count: 28 },
    { name: 'Shop Repair Order (SRO)', accuracy: 87.4, count: 21 },
    { name: 'Registration', accuracy: 84.1, count: 12 }
  ];

  const errorReasons = [
    { reason: 'Physical barcode crease / smudge', percentage: 41, color: '#ef4444' },
    { reason: 'Handwritten pen overlap on VIN field', percentage: 27, color: '#f59e0b' },
    { reason: 'Fax / thermal paper low-DPI scan (150 DPI)', percentage: 19, color: '#3b82f6' },
    { reason: 'O/0 or I/1 optical character ambiguity', percentage: 13, color: '#8b5cf6' }
  ];

  const throughputDays = [
    { day: 'Mon', count: 184, verified: 172 },
    { day: 'Tue', count: 210, verified: 201 },
    { day: 'Wed', count: 195, verified: 188 },
    { day: 'Thu', count: 240, verified: 229 },
    { day: 'Fri', count: 260, verified: 251 },
    { day: 'Sat', count: 140, verified: 136 },
    { day: 'Sun', count: 191, verified: 183 }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h2>Fleet Operations & OCR Intelligence Dashboard</h2>
          <p>Real-time telemetry, Vision model accuracy metrics, and FileNet SLA monitoring</p>
        </div>
        <button className="view-queue-btn" onClick={onNavigateToQueue}>
          ← Back to Document Queue
        </button>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Ingestion Volume</span>
            <span className="trend-tag positive">+18.4%</span>
          </div>
          <div className="kpi-card-value">{SYSTEM_STATS.totalFiles} Docs</div>
          <div className="kpi-card-sub">3,840 Total VINs processed this week</div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Auto Extraction Accuracy</span>
            <span className="trend-tag positive">+3.2%</span>
          </div>
          <div className="kpi-card-value text-emerald">{SYSTEM_STATS.accuracyRate}%</div>
          <div className="kpi-card-sub">ISO 3779 standard check digit verification</div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Avg Review Latency</span>
            <span className="trend-tag neutral">Within SLA</span>
          </div>
          <div className="kpi-card-value text-blue">{SYSTEM_STATS.avgProcessingTime}</div>
          <div className="kpi-card-sub">Target SLA: &lt; 5.00s per document</div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">FileNet ECM Sync Rate</span>
            <span className="trend-tag positive">Operational</span>
          </div>
          <div className="kpi-card-value text-emerald">{SYSTEM_STATS.fileNetSyncRate}%</div>
          <div className="kpi-card-sub">0 failed syncs across 5 fleet facilities</div>
        </div>
      </div>

      {/* Two Column Visual Analytics */}
      <div className="analytics-charts-grid">
        {/* Left: Accuracy by Document Class */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Accuracy by Document Class</h3>
            <span className="chart-badge">Fleet Ops Benchmark</span>
          </div>
          <div className="class-accuracy-bars">
            {classAccuracies.map((item, idx) => (
              <div key={idx} className="class-bar-row">
                <div className="class-bar-labels">
                  <span className="class-name">{item.name}</span>
                  <span className="class-pct">{item.accuracy}% ({item.count} docs)</span>
                </div>
                <div className="class-bar-track">
                  <div
                    className="class-bar-fill"
                    style={{
                      width: `${item.accuracy}%`,
                      backgroundColor: item.accuracy >= 95 ? '#10b981' : item.accuracy >= 90 ? '#f59e0b' : '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Daily Throughput & Error Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>7-Day Fleet Intake & Verification Throughput</h3>
            <span className="chart-badge">Volume</span>
          </div>
          <div className="throughput-chart">
            {throughputDays.map((d, i) => {
              const maxVal = 280;
              const heightPct = Math.round((d.count / maxVal) * 100);
              return (
                <div key={i} className="throughput-col">
                  <div className="col-bar-wrap" style={{ height: '140px' }}>
                    <div
                      className="col-bar-fill"
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.count} ingested (${d.verified} verified)`}
                    ></div>
                  </div>
                  <span className="col-day-label">{d.day}</span>
                  <span className="col-count-label">{d.count}</span>
                </div>
              );
            })}
          </div>

          <div className="error-analysis-box">
            <h4>Root Causes of Unmatched VINs</h4>
            <div className="error-reasons-list">
              {errorReasons.map((err, idx) => (
                <div key={idx} className="error-reason-item">
                  <div className="reason-left">
                    <span className="reason-dot" style={{ backgroundColor: err.color }}></span>
                    <span className="reason-text">{err.reason}</span>
                  </div>
                  <span className="reason-pct font-mono">{err.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
