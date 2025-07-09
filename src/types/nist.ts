/**
 * NIST 800-53 Control Interface
 */
export interface NistControl {
  id: string
  family: string
  title: string
  priority: string
  description: string
  guidance?: string
  parameters?: string[]
  relatedControls?: string[]
  baselines?: {
    privacy: string | null
    security: {
      low: string | null
      moderate: string | null
      high: string | null
    }
  }
}

/**
 * NIST 800-53 Control Family Interface
 */
export interface NistControlFamily {
  id: string
  title: string
  description: string
  controls: NistControl[]
}
