import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ConfirmModal from '../components/ConfirmModal';

describe('ConfirmModal', () => {
  test('renders the message passed to it', () => {
    render(<ConfirmModal message="Delete this note?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Delete this note?')).toBeInTheDocument();
  });

  test('calls onConfirm when the Delete button is clicked', async () => {
    const handleConfirm = vi.fn();
    render(<ConfirmModal message="Delete this note?" onConfirm={handleConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(handleConfirm).toHaveBeenCalledOnce();
  });

  test('calls onCancel when the Cancel button is clicked', async () => {
    const handleCancel = vi.fn();
    render(<ConfirmModal message="Delete this note?" onConfirm={vi.fn()} onCancel={handleCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleCancel).toHaveBeenCalledOnce();
  });

  test('does not call onConfirm when Cancel is clicked', async () => {
    const handleConfirm = vi.fn();
    render(<ConfirmModal message="Delete this note?" onConfirm={handleConfirm} onCancel={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
