/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { SspProgressRing } from './SspProgressRing'

describe('SspProgressRing', () => {
  it('renders with default props', () => {
    render(<SspProgressRing value={50} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders 0% for zero value', () => {
    render(<SspProgressRing value={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('renders 100% for full value', () => {
    render(<SspProgressRing value={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('clamps values above 100', () => {
    render(<SspProgressRing value={150} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('clamps values below 0', () => {
    render(<SspProgressRing value={-10} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('rounds percentage to nearest integer', () => {
    render(<SspProgressRing value={33.7} />)
    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  it('hides label when showLabel is false', () => {
    render(<SspProgressRing value={50} showLabel={false} />)
    expect(screen.queryByText('50%')).not.toBeInTheDocument()
  })
})
