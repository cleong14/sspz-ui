/**
 * SSP PDF Template Component
 * Renders a complete System Security Plan document for PDF generation
 * @module SSPTemplate
 */
import React from 'react'
// Using native Date methods instead of date-fns to avoid additional dependency
import type { SSPData } from '@/types/ssp'
import './SSPTemplate.scss'

interface SSPTemplateProps {
  data: SSPData
  isPrintMode?: boolean
}

const SSPTemplate: React.FC<SSPTemplateProps> = ({
  data,
  isPrintMode = false,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={`ssp-template ${isPrintMode ? 'print-mode' : ''}`}>
      {/* Cover Page */}
      <div className="ssp-page ssp-cover-page">
        <div className="ssp-header">
          <div className="ssp-logo">
            {data.organization?.logo && (
              <img
                src={data.organization.logo}
                alt={`${data.organization.name} Logo`}
              />
            )}
          </div>
          <div className="ssp-title-block">
            <h1 className="ssp-main-title">System Security Plan</h1>
            <h2 className="ssp-system-name">{data.systemName}</h2>
            <div className="ssp-version">Version {data.systemVersion}</div>
          </div>
        </div>

        <div className="ssp-cover-info">
          <table className="ssp-info-table">
            <tbody>
              <tr>
                <td className="label">System Name:</td>
                <td>{data.systemName}</td>
              </tr>
              <tr>
                <td className="label">System Version:</td>
                <td>{data.systemVersion}</td>
              </tr>
              <tr>
                <td className="label">Control Catalog:</td>
                <td>{data.controlCatalog}</td>
              </tr>
              <tr>
                <td className="label">Control Version:</td>
                <td>{data.controlVersion}</td>
              </tr>
              <tr>
                <td className="label">Control Baseline:</td>
                <td>{data.controlBaseline}</td>
              </tr>
              <tr>
                <td className="label">Document Date:</td>
                <td>{currentDate}</td>
              </tr>
              <tr>
                <td className="label">Organization:</td>
                <td>{data.organization?.name || 'Not Specified'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ssp-footer">
          <div className="ssp-classification">
            {data.classification || 'UNCLASSIFIED'}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="ssp-page ssp-toc-page">
        <h1>Table of Contents</h1>
        <div className="ssp-toc">
          <div className="toc-item">
            <span className="toc-title">1. Executive Summary</span>
            <span className="toc-page">3</span>
          </div>
          <div className="toc-item">
            <span className="toc-title">2. System Overview</span>
            <span className="toc-page">4</span>
          </div>
          <div className="toc-item">
            <span className="toc-title">3. System Architecture</span>
            <span className="toc-page">5</span>
          </div>
          <div className="toc-item">
            <span className="toc-title">
              4. Security Controls Implementation
            </span>
            <span className="toc-page">6</span>
          </div>
          <div className="toc-item">
            <span className="toc-title">
              5. Security Tools and Technologies
            </span>
            <span className="toc-page">
              {6 + Math.ceil((data.controls?.length || 0) / 10)}
            </span>
          </div>
          <div className="toc-item">
            <span className="toc-title">6. Control Implementation Matrix</span>
            <span className="toc-page">
              {8 + Math.ceil((data.controls?.length || 0) / 10)}
            </span>
          </div>
          <div className="toc-item">
            <span className="toc-title">Appendix A: Control Details</span>
            <span className="toc-page">
              {10 + Math.ceil((data.controls?.length || 0) / 10)}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="ssp-page">
        <h1>1. Executive Summary</h1>
        <div className="ssp-content">
          <p>
            This System Security Plan (SSP) documents the security controls
            implemented for the <strong>{data.systemName}</strong> system
            (Version {data.systemVersion}). This document provides a
            comprehensive overview of the system's security posture, implemented
            controls, and security tools utilized to protect the system and its
            data.
          </p>

          <h2>1.1 System Purpose</h2>
          <p>{data.systemPurpose || 'System purpose not specified.'}</p>

          <h2>1.2 Security Control Framework</h2>
          <p>
            This SSP is based on the <strong>{data.controlCatalog}</strong>{' '}
            control catalog, version <strong>{data.controlVersion}</strong>,
            implementing the <strong>{data.controlBaseline}</strong> baseline
            controls.
          </p>

          <h2>1.3 Control Implementation Summary</h2>
          <p>
            A total of <strong>{data.controls?.length || 0}</strong> security
            controls have been identified and implemented across{' '}
            <strong>{data.tools?.length || 0}</strong> security tools and
            technologies.
          </p>
        </div>
      </div>

      {/* System Overview */}
      <div className="ssp-page">
        <h1>2. System Overview</h1>
        <div className="ssp-content">
          <h2>2.1 System Information</h2>
          <table className="ssp-data-table">
            <tbody>
              <tr>
                <td className="label">System Name:</td>
                <td>{data.systemName}</td>
              </tr>
              <tr>
                <td className="label">System Version:</td>
                <td>{data.systemVersion}</td>
              </tr>
              <tr>
                <td className="label">System Type:</td>
                <td>{data.systemType || 'Not Specified'}</td>
              </tr>
              <tr>
                <td className="label">Operating Environment:</td>
                <td>{data.operatingEnvironment || 'Not Specified'}</td>
              </tr>
              <tr>
                <td className="label">Data Classification:</td>
                <td>{data.dataClassification || 'Not Specified'}</td>
              </tr>
            </tbody>
          </table>

          <h2>2.2 System Description</h2>
          <p>{data.systemDescription || 'System description not provided.'}</p>

          <h2>2.3 System Boundaries</h2>
          <p>{data.systemBoundaries || 'System boundaries not defined.'}</p>
        </div>
      </div>

      {/* System Architecture */}
      <div className="ssp-page">
        <h1>3. System Architecture</h1>
        <div className="ssp-content">
          <h2>3.1 Architecture Overview</h2>
          <p>
            {data.architectureOverview || 'Architecture overview not provided.'}
          </p>

          {data.architectureDiagram && (
            <div className="ssp-diagram">
              <h3>3.2 System Architecture Diagram</h3>
              <img
                src={data.architectureDiagram}
                alt="System Architecture Diagram"
                className="architecture-diagram"
              />
            </div>
          )}

          <h2>3.3 System Components</h2>
          {data.systemComponents && data.systemComponents.length > 0 ? (
            <table className="ssp-data-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Description</th>
                  <th>Security Level</th>
                </tr>
              </thead>
              <tbody>
                {data.systemComponents.map((component, index) => (
                  <tr key={index}>
                    <td>{component.name}</td>
                    <td>{component.description}</td>
                    <td>{component.securityLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>System components not specified.</p>
          )}
        </div>
      </div>

      {/* Security Controls Implementation */}
      <div className="ssp-page">
        <h1>4. Security Controls Implementation</h1>
        <div className="ssp-content">
          <h2>4.1 Control Implementation Approach</h2>
          <p>
            Security controls have been implemented following the{' '}
            {data.controlCatalog} framework to ensure comprehensive protection
            of the {data.systemName} system. Each control has been mapped to
            specific security tools and implementation methods.
          </p>

          <h2>4.2 Implementation Status Summary</h2>
          {data.controls && data.controls.length > 0 && (
            <table className="ssp-data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Implemented</td>
                  <td>
                    {
                      data.controls.filter((c) => c.status === 'implemented')
                        .length
                    }
                  </td>
                  <td>
                    {Math.round(
                      (data.controls.filter((c) => c.status === 'implemented')
                        .length /
                        data.controls.length) *
                        100
                    )}
                    %
                  </td>
                </tr>
                <tr>
                  <td>Partially Implemented</td>
                  <td>
                    {data.controls.filter((c) => c.status === 'partial').length}
                  </td>
                  <td>
                    {Math.round(
                      (data.controls.filter((c) => c.status === 'partial')
                        .length /
                        data.controls.length) *
                        100
                    )}
                    %
                  </td>
                </tr>
                <tr>
                  <td>Planned</td>
                  <td>
                    {data.controls.filter((c) => c.status === 'planned').length}
                  </td>
                  <td>
                    {Math.round(
                      (data.controls.filter((c) => c.status === 'planned')
                        .length /
                        data.controls.length) *
                        100
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Security Tools */}
      <div className="ssp-page">
        <h1>5. Security Tools and Technologies</h1>
        <div className="ssp-content">
          <h2>5.1 Implemented Security Tools</h2>
          {data.tools && data.tools.length > 0 ? (
            <table className="ssp-data-table">
              <thead>
                <tr>
                  <th>Tool Name</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {data.tools.map((tool, index) => (
                  <tr key={index}>
                    <td>{tool.name}</td>
                    <td>{tool.category}</td>
                    <td>{tool.version || 'N/A'}</td>
                    <td>{tool.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No security tools specified.</p>
          )}
        </div>
      </div>

      {/* Control Implementation Matrix */}
      <div className="ssp-page">
        <h1>6. Control Implementation Matrix</h1>
        <div className="ssp-content">
          {data.controls && data.controls.length > 0 ? (
            <table className="ssp-data-table ssp-controls-matrix">
              <thead>
                <tr>
                  <th>Control ID</th>
                  <th>Control Name</th>
                  <th>Implementation Status</th>
                  <th>Implementing Tools</th>
                </tr>
              </thead>
              <tbody>
                {data.controls.map((control, index) => (
                  <tr key={index}>
                    <td className="control-id">{control.id}</td>
                    <td>{control.name}</td>
                    <td>
                      <span className={`status-badge status-${control.status}`}>
                        {control.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {control.implementingTools?.join(', ') || 'Not Specified'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No controls specified.</p>
          )}
        </div>
      </div>

      {/* Appendix A: Control Details */}
      <div className="ssp-page">
        <h1>Appendix A: Control Details</h1>
        <div className="ssp-content">
          {data.controls && data.controls.length > 0 ? (
            data.controls.map((control, index) => (
              <div key={index} className="control-detail">
                <h2>
                  {control.id}: {control.name}
                </h2>
                <div className="control-info">
                  <p>
                    <strong>Family:</strong> {control.family}
                  </p>
                  <p>
                    <strong>Status:</strong> {control.status?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Description:</strong> {control.description}
                  </p>
                  {control.implementationGuidance && (
                    <p>
                      <strong>Implementation Guidance:</strong>{' '}
                      {control.implementationGuidance}
                    </p>
                  )}
                  {control.implementingTools &&
                    control.implementingTools.length > 0 && (
                      <p>
                        <strong>Implementing Tools:</strong>{' '}
                        {control.implementingTools.join(', ')}
                      </p>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p>No control details available.</p>
          )}
        </div>
      </div>

      {/* Document Footer for all pages */}
      <div className="ssp-document-footer">
        <div className="footer-left">
          {data.classification || 'UNCLASSIFIED'}
        </div>
        <div className="footer-center">
          {data.systemName} - System Security Plan
        </div>
        <div className="footer-right">
          Page {'{page}'} of {'{total}'}
        </div>
      </div>
    </div>
  )
}

export default SSPTemplate
