import { OSCALCatalog, OSCALControl, Baseline } from '../oscal'

describe('OSCAL Types', () => {
  it('should allow valid baseline values', () => {
    const baseline: Baseline = 'low'
    expect(['low', 'moderate', 'high']).toContain(baseline)
  })

  it('should define control structure with required fields', () => {
    const control: OSCALControl = {
      id: 'ac-1',
      title: 'Access Control Policy and Procedures',
      class: 'AC',
      parts: [],
    }
    expect(control.id).toBeDefined()
    expect(control.title).toBeDefined()
  })
})
