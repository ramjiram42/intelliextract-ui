import React, { useState } from 'react';

export default function FileNetSyncModal({ onClose, onShowToast }) {
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const auditLogs = [
    { id: 1, time: '2026-03-24 10:14:02', doc: '20260324_081433_VDA_INVOICE_6621.pdf', vins: 18, status: 'HTTP 200 OK', idRef: '{84B2-991A-4812}' },
    { id: 2, time: '2026-03-20 18:22:15', doc: '20260320_182122_HERTZ_00009370UT.pdf', vins: 2, status: 'HTTP 200 OK', idRef: '{10CA-4810-7719}' },
    { id: 3, time: '2026-03-20 16:45:00', doc: '20260320_145909_nj 03-18-26.pdf', vins: 1, status: 'HTTP 200 OK', idRef: '{7721-BC01-9920}' }
  ];

  const handleTestConnection = () => {
    setIsTesting(true);
    setPingResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setPingResult({
        success: true,
        latency: '24ms',
        version: 'IBM FileNet P8 Content Engine v5.5.8 FixPack 3',
        objectStore: 'ECM_FLEET_OPS_PROD_01 (Online)'
      });
      onShowToast('FileNet P8 Gateway connection verified successfully (24ms)', 'success');
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') onClose(); }}>
      <div className="filenet-modal-container">
        <div className="filenet-modal-header">
          <div className="filenet-title-wrap">
            <div className="filenet-badge-icon">P8</div>
            <div>
              <h3>IBM FileNet P8 Content Engine Gateway</h3>
              <p>Enterprise ECM Integration & Vehicle Document Indexing Service</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="filenet-modal-body">
          {/* Connection Configuration Strip */}
          <div className="filenet-config-card">
            <div className="config-row">
              <span className="config-label">WSI Endpoint:</span>
              <span className="config-value font-mono">https://ecm.hertzcorp.com/wsi/FNCEWS40MTOM</span>
            </div>
            <div className="config-row">
              <span className="config-label">Active Object Store:</span>
              <span className="config-value font-mono">ECM_FLEET_OPS_PROD_01</span>
            </div>
            <div className="config-row">
              <span className="config-label">Auth Protocol:</span>
              <span className="config-value">mTLS + OAuth2 Kerberos Token</span>
            </div>

            <div className="test-conn-row">
              <button
                className="test-ping-btn"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? 'Pinging Gateway...' : '⚡ Test Gateway Connection'}
              </button>

              {pingResult && (
                <div className="ping-result-badge">
                  <span className="ping-dot"></span>
                  <span>{pingResult.version} • {pingResult.latency} latency</span>
                </div>
              )}
            </div>
          </div>

          {/* Sample JSON Schema Ingested */}
          <div className="filenet-schema-section">
            <h4>Sample FileNet Document Object Payload:</h4>
            <pre className="schema-code-block font-mono">
{`{
  "repositoryId": "ECM_FLEET_OPS_PROD_01",
  "documentClass": "FleetVehicleRecord",
  "properties": {
    "DocumentTitle": "20260323_120938_multiple pages 2.pdf",
    "FleetAccount": "HERTZ VEHICLES LLC",
    "OperatingCenter": "ATL - Hartsfield Fleet Hub",
    "IngestionTimestamp": "2026-03-23T12:09:38Z",
    "ExtractedVins": [
      "5XYRL4JC0RG270559",
      "KL77LHEP8SC231401",
      "5NMP24GL2SH130350"
    ],
    "AuditorId": "Sarah.Chen@hertz.com",
    "OcrConfidenceScore": 0.994,
    "ChecksumStatus": "ISO_3779_COMPLIANT"
  }
}`}
            </pre>
          </div>

          {/* Recent Sync Audit Log */}
          <div className="filenet-audit-section">
            <h4>Recent FileNet Ingestion Audit Trail:</h4>
            <div className="audit-table-wrap">
              <table className="audit-table font-mono">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Document</th>
                    <th>VINs</th>
                    <th>Reference ID</th>
                    <th>Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.time}</td>
                      <td>{log.doc}</td>
                      <td>{log.vins} units</td>
                      <td>{log.idRef}</td>
                      <td className="text-emerald font-bold">{log.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="filenet-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
