/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ModalCloseButton } from '../components/ModalCloseButton';

describe('ModalCloseButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with default aria-label', () => {
    const onClick = vi.fn();
    render(<ModalCloseButton onClick={onClick} />);
    
    const button = screen.getByRole('button', { name: /cerrar/i });
    expect(button).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ModalCloseButton onClick={onClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts custom ariaLabel and className', () => {
    const onClick = vi.fn();
    render(<ModalCloseButton onClick={onClick} ariaLabel="Close this modal" className="custom-close" />);
    
    const button = screen.getByRole('button', { name: /close this modal/i });
    expect(button).toBeDefined();
    expect(button.className).toContain('custom-close');
    expect(button.className).toContain('modal-close');
  });
});
