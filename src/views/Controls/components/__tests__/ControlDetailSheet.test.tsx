/**
 * ControlDetailSheet Component Tests
 * @module views/Controls/components/__tests__/ControlDetailSheet.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { Control } from '@/types/control'
import ControlDetailSheet from '../ControlDetailSheet'

const mockControl: Control = {
  id: 'AC-1',
  family: 'AC',
  title: 'Policy and Procedures',
  description:
    'Develop, document, and disseminate access control policy and procedures.',
  guidance: 'Access control policy should address the purpose and scope.',
  baselines: { low: true, moderate: true, high: true },
  parameters: [
    {
      id: 'ac-01_odp.01',
      label: 'personnel or roles',
      guidelines: 'Define personnel or roles to receive the policy.',
    },
    {
      id: 'ac-01_odp.02',
      label: 'frequency',
      select: {
        howMany: 'one',
        choices: ['annually', 'bi-annually', 'quarterly'],
      },
    },
  ],
  relatedControls: ['AC-2', 'AC-3', 'PL-1'],
  enhancements: ['AC-1(1)', 'AC-1(2)'],
}

const mockEnhancement: Control = {
  id: 'AC-1(1)',
  family: 'AC',
  title: 'Policy and Procedures Enhancement 1',
  description: 'Enhancement description.',
  baselines: { low: false, moderate: true, high: true },
  parentControl: 'AC-1',
}

const mockControlNoBaseline: Control = {
  id: 'PM-1',
  family: 'PM',
  title: 'Program Management',
  description: 'Program management control.',
  baselines: { low: false, moderate: false, high: false },
}

describe('ControlDetailSheet', () => {
  const mockOnClose = jest.fn()
  const mockOnRelatedControlClick = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnRelatedControlClick.mockClear()
  })

  it('should not render when control is null', () => {
    const { container } = render(
      <ControlDetailSheet control={null} open={true} onClose={mockOnClose} />
    )

    // The drawer should be empty
    expect(container.querySelector('.MuiDrawer-paper')).not.toBeInTheDocument()
  })

  it('should render control ID and title in header', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('AC-1')).toBeInTheDocument()
    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
  })

  it('should render baseline badges', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('should show "Not in baseline" when control has no baselines', () => {
    render(
      <ControlDetailSheet
        control={mockControlNoBaseline}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Not in baseline')).toBeInTheDocument()
  })

  it('should render control description', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(
      screen.getByText(/Develop, document, and disseminate/)
    ).toBeInTheDocument()
  })

  it('should render guidance in accordion', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Supplemental Guidance')).toBeInTheDocument()
    expect(
      screen.getByText(/Access control policy should address/)
    ).toBeInTheDocument()
  })

  it('should render parameters section with count', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Parameters (2)')).toBeInTheDocument()
  })

  it('should render parameter select choices', async () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    // Expand the parameters accordion
    const parametersButton = screen.getByText('Parameters (2)')
    fireEvent.click(parametersButton)

    await waitFor(() => {
      expect(screen.getByText('annually')).toBeInTheDocument()
      expect(screen.getByText('bi-annually')).toBeInTheDocument()
      expect(screen.getByText('quarterly')).toBeInTheDocument()
    })
  })

  it('should render related controls section with count', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Related Controls (3)')).toBeInTheDocument()
  })

  it('should render enhancements section with count', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Enhancements (2)')).toBeInTheDocument()
  })

  it('should show Enhancement chip for enhancement controls', () => {
    render(
      <ControlDetailSheet
        control={mockEnhancement}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Enhancement')).toBeInTheDocument()
  })

  it('should show parent control for enhancements', () => {
    render(
      <ControlDetailSheet
        control={mockEnhancement}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Parent Control')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /AC-1/i })).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText(/Close detail view/i)
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when ESC key is pressed', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onRelatedControlClick when related control is clicked', async () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
        onRelatedControlClick={mockOnRelatedControlClick}
      />
    )

    // Expand related controls accordion
    const relatedSection = screen.getByText('Related Controls (3)')
    fireEvent.click(relatedSection)

    await waitFor(() => {
      const relatedButton = screen.getByRole('button', { name: /AC-2/i })
      fireEvent.click(relatedButton)
    })

    expect(mockOnRelatedControlClick).toHaveBeenCalledWith('AC-2')
  })

  it('should call onRelatedControlClick when enhancement is clicked', async () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
        onRelatedControlClick={mockOnRelatedControlClick}
      />
    )

    // Expand enhancements accordion
    const enhancementsSection = screen.getByText('Enhancements (2)')
    fireEvent.click(enhancementsSection)

    await waitFor(() => {
      const enhancementButton = screen.getByRole('button', {
        name: /AC-1\(1\)/i,
      })
      fireEvent.click(enhancementButton)
    })

    expect(mockOnRelatedControlClick).toHaveBeenCalledWith('AC-1(1)')
  })

  it('should render source footer', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText(/NIST SP 800-53 Rev 5/)).toBeInTheDocument()
  })

  it('should have copy control ID button', () => {
    render(
      <ControlDetailSheet
        control={mockControl}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByLabelText(/Copy control ID/i)).toBeInTheDocument()
  })

  it('should handle control without parameters', () => {
    const controlWithoutParams: Control = {
      ...mockControl,
      parameters: undefined,
    }

    render(
      <ControlDetailSheet
        control={controlWithoutParams}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText(/Parameters/)).not.toBeInTheDocument()
  })

  it('should handle control without related controls', () => {
    const controlWithoutRelated: Control = {
      ...mockControl,
      relatedControls: undefined,
    }

    render(
      <ControlDetailSheet
        control={controlWithoutRelated}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText(/Related Controls/)).not.toBeInTheDocument()
  })

  it('should handle control without enhancements', () => {
    const controlWithoutEnhancements: Control = {
      ...mockControl,
      enhancements: undefined,
    }

    render(
      <ControlDetailSheet
        control={controlWithoutEnhancements}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText(/Enhancements/)).not.toBeInTheDocument()
  })

  it('should handle control without guidance', () => {
    const controlWithoutGuidance: Control = {
      ...mockControl,
      guidance: undefined,
    }

    render(
      <ControlDetailSheet
        control={controlWithoutGuidance}
        open={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('Supplemental Guidance')).not.toBeInTheDocument()
  })

  it('should handle control with empty description', () => {
    const controlWithEmptyDesc: Control = {
      ...mockControl,
      description: '',
    }

    render(
      <ControlDetailSheet
        control={controlWithEmptyDesc}
        open={true}
        onClose={mockOnClose}
      />
    )

    // Component shows empty description or falls back to default message
    expect(screen.getByText('Control Statement')).toBeInTheDocument()
  })
})
