/**
 * SSP Template Usage Example
 * Demonstrates how to use the SSP template with sample data
 * @module SSPExample
 */
import React, { useState, useCallback, useMemo } from 'react'
import { Button, Box, Typography, Paper, Alert } from '@mui/material'
import { Download, Print, Visibility } from '@mui/icons-material'
import SSPTemplate from './SSPTemplate'
import SSPPDFGenerator from './SSPPDFGenerator'
import type { SSPData } from '@/types/ssp'

interface SSPExampleProps {
  // Future props can be added here
}

// Constants for the example
const SAMPLE_DATA_CONFIG = {
  SYSTEM_NAME: 'Enterprise Web Application',
  SYSTEM_VERSION: '2.1.0',
  ORGANIZATION_NAME: 'Aquia, Inc.',
  CONTROL_CATALOG: 'NIST SP 800-53',
  CONTROL_VERSION: 'Rev 5',
  CONTROL_BASELINE: 'Moderate',
} as const

// Sample SSP data for demonstration
const sampleSSPData: SSPData = {
  systemName: SAMPLE_DATA_CONFIG.SYSTEM_NAME,
  systemVersion: SAMPLE_DATA_CONFIG.SYSTEM_VERSION,
  systemType: 'Web Application',
  systemPurpose: 'Customer relationship management and data processing system',
  systemDescription:
    'A comprehensive web-based application that manages customer data, processes transactions, and provides reporting capabilities for business operations.',
  systemBoundaries:
    "The system boundary includes the web application servers, database servers, load balancers, and associated network infrastructure within the organization's data center.",
  operatingEnvironment:
    'Production environment hosted on AWS cloud infrastructure',
  dataClassification: 'Confidential - Contains PII and financial data',

  controlCatalog: SAMPLE_DATA_CONFIG.CONTROL_CATALOG,
  controlVersion: SAMPLE_DATA_CONFIG.CONTROL_VERSION,
  controlBaseline: SAMPLE_DATA_CONFIG.CONTROL_BASELINE,

  organization: {
    name: SAMPLE_DATA_CONFIG.ORGANIZATION_NAME,
    logo: '/assets/logo.png',
    address: '123 Security Street, Compliance City, CC 12345',
    contact: 'security@aquia.us',
  },

  classification: 'CONFIDENTIAL',

  architectureOverview:
    'The system follows a three-tier architecture with presentation, application, and data layers. All components are deployed in a secure cloud environment with proper network segmentation and access controls.',

  systemComponents: [
    {
      name: 'Web Application Server',
      description: 'Hosts the main application logic and user interface',
      securityLevel: 'High',
      type: 'Application Server',
      location: 'AWS EC2 - us-east-1a',
    },
    {
      name: 'Database Server',
      description: 'Stores application data and user information',
      securityLevel: 'High',
      type: 'Database Server',
      location: 'AWS RDS - us-east-1b',
    },
    {
      name: 'Load Balancer',
      description: 'Distributes incoming traffic across application servers',
      securityLevel: 'Medium',
      type: 'Network Component',
      location: 'AWS ALB - Multi-AZ',
    },
  ],

  controls: [
    {
      id: 'AC-1',
      name: 'Access Control Policy and Procedures',
      family: 'Access Control',
      description:
        'Develop, document, and disseminate access control policy and procedures.',
      status: 'implemented',
      implementationGuidance:
        'Access control policies have been documented and approved by management.',
      implementingTools: ['Active Directory', 'AWS IAM'],
      responsibleRole: 'Security Administrator',
    },
    {
      id: 'AC-2',
      name: 'Account Management',
      family: 'Access Control',
      description:
        'Manage system accounts, group memberships, privileges, workflow, notifications, deactivations, and reviews.',
      status: 'implemented',
      implementationGuidance:
        'Automated account management processes are in place using identity management systems.',
      implementingTools: ['Active Directory', 'AWS IAM', 'Okta'],
      responsibleRole: 'System Administrator',
    },
    {
      id: 'AU-1',
      name: 'Audit and Accountability Policy and Procedures',
      family: 'Audit and Accountability',
      description:
        'Develop, document, and disseminate audit and accountability policy and procedures.',
      status: 'implemented',
      implementationGuidance:
        'Comprehensive audit policies have been established and are regularly reviewed.',
      implementingTools: ['Splunk', 'CloudTrail'],
      responsibleRole: 'Compliance Officer',
    },
    {
      id: 'CA-1',
      name: 'Security Assessment and Authorization Policy and Procedures',
      family: 'Security Assessment and Authorization',
      description:
        'Develop, document, and disseminate security assessment and authorization policy and procedures.',
      status: 'partial',
      implementationGuidance:
        'Assessment procedures are documented but require annual review updates.',
      implementingTools: ['Nessus', 'Qualys'],
      responsibleRole: 'Security Assessor',
    },
    {
      id: 'CM-1',
      name: 'Configuration Management Policy and Procedures',
      family: 'Configuration Management',
      description:
        'Develop, document, and disseminate configuration management policy and procedures.',
      status: 'planned',
      implementationGuidance:
        'Configuration management procedures are being developed and will be implemented in Q2.',
      implementingTools: ['Ansible', 'Terraform'],
      responsibleRole: 'DevOps Engineer',
    },
  ],

  tools: [
    {
      name: 'Active Directory',
      category: 'Identity and Access Management',
      version: '2019',
      purpose:
        'Centralized authentication and authorization for Windows-based systems',
      description:
        'Microsoft Active Directory provides directory services for user authentication and access control.',
      vendor: 'Microsoft',
    },
    {
      name: 'AWS IAM',
      category: 'Cloud Identity Management',
      purpose: 'Identity and access management for AWS cloud resources',
      description:
        'Amazon Web Services Identity and Access Management for cloud resource access control.',
      vendor: 'Amazon Web Services',
    },
    {
      name: 'Splunk',
      category: 'Security Information and Event Management',
      version: '8.2',
      purpose: 'Log aggregation, analysis, and security monitoring',
      description:
        'Enterprise security information and event management platform for log analysis and threat detection.',
      vendor: 'Splunk Inc.',
    },
    {
      name: 'Nessus',
      category: 'Vulnerability Assessment',
      version: '10.4',
      purpose: 'Vulnerability scanning and assessment',
      description:
        'Comprehensive vulnerability scanner for identifying security weaknesses in systems and applications.',
      vendor: 'Tenable',
    },
  ],

  createdDate: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  version: '1.0',
  author: 'Security Team',
  reviewer: 'CISO',
}

const SSPExample: React.FC<SSPExampleProps> = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize the sample data to prevent unnecessary re-creation
  const memoizedSampleData = useMemo(() => sampleSSPData, [])

  const handlePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode)
  }, [isPreviewMode])

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      await SSPPDFGenerator.generatePDF({
        data: memoizedSampleData,
        onGenerated: () => {
          console.log('PDF generated successfully')
          setIsGenerating(false)
        },
        onError: (error) => {
          console.error('PDF generation failed:', error)
          setError(`PDF generation failed: ${error.message}`)
          setIsGenerating(false)
        },
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      setError(
        `PDF generation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      setIsGenerating(false)
    }
  }

  const handleDownloadHTML = useCallback(() => {
    SSPPDFGenerator.downloadHTML(sampleSSPData)
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Security Plan Template
      </Typography>

      <Typography variant="body1" paragraph>
        This example demonstrates the SSP template with sample data. Use the
        buttons below to preview or generate the document.
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Visibility />}
          onClick={handlePreview}
          color={isPreviewMode ? 'secondary' : 'primary'}
        >
          {isPreviewMode ? 'Hide Preview' : 'Show Preview'}
        </Button>

        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          color="primary"
        >
          {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownloadHTML}
          color="primary"
        >
          Download HTML
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {isPreviewMode && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxHeight: '80vh',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
          }}
        >
          <SSPTemplate data={sampleSSPData} isPrintMode={false} />
        </Paper>
      )}
    </Box>
  )
}

export default SSPExample
