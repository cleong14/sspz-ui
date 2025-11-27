/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { SspEmptyState } from './SspEmptyState'

describe('SspEmptyState', () => {
  describe('without directory access', () => {
    it('renders connect directory prompt', () => {
      render(<SspEmptyState hasDirectoryAccess={false} />)
      expect(
        screen.getByText('Connect Your Projects Folder')
      ).toBeInTheDocument()
    })

    it('renders connect directory button', () => {
      render(<SspEmptyState hasDirectoryAccess={false} />)
      expect(
        screen.getByRole('button', { name: /connect projects folder/i })
      ).toBeInTheDocument()
    })

    it('calls onConnectDirectory when button is clicked', () => {
      const onConnectDirectory = jest.fn()
      render(
        <SspEmptyState
          hasDirectoryAccess={false}
          onConnectDirectory={onConnectDirectory}
        />
      )

      fireEvent.click(
        screen.getByRole('button', { name: /connect projects folder/i })
      )
      expect(onConnectDirectory).toHaveBeenCalled()
    })

    it('shows privacy message', () => {
      render(<SspEmptyState hasDirectoryAccess={false} />)
      expect(
        screen.getByText(/your data stays on your computer/i)
      ).toBeInTheDocument()
    })
  })

  describe('with directory access but no projects', () => {
    it('renders create first SSP prompt', () => {
      render(<SspEmptyState hasDirectoryAccess={true} />)
      expect(screen.getByText('Create Your First SSP')).toBeInTheDocument()
    })

    it('renders create new SSP button', () => {
      render(<SspEmptyState hasDirectoryAccess={true} />)
      expect(
        screen.getByRole('button', { name: /create new ssp/i })
      ).toBeInTheDocument()
    })

    it('calls onCreateClick when button is clicked', () => {
      const onCreateClick = jest.fn()
      render(
        <SspEmptyState
          hasDirectoryAccess={true}
          onCreateClick={onCreateClick}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /create new ssp/i }))
      expect(onCreateClick).toHaveBeenCalled()
    })
  })
})
