/**
 * NIST OSCAL (Open Security Controls Assessment Language) Type Definitions
 * Based on OSCAL 1.0.4 specification
 */

export type Baseline = 'low' | 'moderate' | 'high'

export interface OSCALControl {
  id: string // e.g., "ac-1", "ac-2.1"
  class: string // Control family (AC, AU, etc.)
  title: string
  parts: OSCALPart[]
  controls?: OSCALControl[] // Nested control enhancements
  props?: OSCALProperty[]
  links?: OSCALLink[]
}

export interface OSCALPart {
  id?: string
  name: string
  prose?: string
  parts?: OSCALPart[]
  props?: OSCALProperty[]
}

export interface OSCALProperty {
  name: string
  value: string
  class?: string
  ns?: string
}

export interface OSCALLink {
  href: string
  rel?: string
  text?: string
}

export interface OSCALCatalog {
  uuid: string
  metadata: OSCALMetadata
  groups: OSCALGroup[]
  backMatter?: OSCALBackMatter
}

export interface OSCALGroup {
  id: string
  class: string
  title: string
  controls: OSCALControl[]
  groups?: OSCALGroup[]
}

export interface OSCALMetadata {
  title: string
  lastModified: string
  version: string
  oscalVersion: string
  props?: OSCALProperty[]
  parties?: OSCALParty[]
}

export interface OSCALParty {
  uuid: string
  type: 'organization' | 'person'
  name: string
  emailAddresses?: string[]
}

export interface OSCALBackMatter {
  resources?: OSCALResource[]
}

export interface OSCALResource {
  uuid: string
  title?: string
  description?: string
  props?: OSCALProperty[]
}
