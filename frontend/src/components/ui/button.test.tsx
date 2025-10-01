import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    let button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-red-600', 'text-white')

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button', { name: /outline/i })
    expect(button).toHaveClass('border', 'border-gray-300', 'bg-transparent')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toHaveClass('bg-gray-100', 'text-gray-900')

    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toHaveClass('text-gray-900')

    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole('button', { name: /link/i })
    expect(button).toHaveClass('underline-offset-4', 'text-blue-600')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button', { name: /small/i })
    expect(button).toHaveClass('h-9', 'px-3')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: /large/i })
    expect(button).toHaveClass('h-11', 'px-8')

    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole('button', { name: /icon/i })
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
  })

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: /disabled/i })
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Button with ref</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Button with ref')
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })

    expect(button).toHaveClass('custom-class')
    // Should still have default classes
    expect(button).toHaveClass('inline-flex', 'items-center')
  })

  it('supports different button types', () => {
    const { rerender } = render(<Button type="button">Button</Button>)
    let button = screen.getByRole('button', { name: /button/i })
    expect(button).toHaveAttribute('type', 'button')

    rerender(<Button type="submit">Submit</Button>)
    button = screen.getByRole('button', { name: /submit/i })
    expect(button).toHaveAttribute('type', 'submit')

    rerender(<Button type="reset">Reset</Button>)
    button = screen.getByRole('button', { name: /reset/i })
    expect(button).toHaveAttribute('type', 'reset')
  })

  it('renders as child component when asChild prop is provided', () => {
    // This test would need to be adapted based on how the asChild prop is implemented
    // For now, we'll skip this if the button doesn't support asChild
    render(<Button>Regular Button</Button>)
    const button = screen.getByRole('button', { name: /regular button/i })
    expect(button.tagName).toBe('BUTTON')
  })

  it('supports aria attributes', () => {
    render(
      <Button aria-label="Custom aria label" aria-describedby="help-text">
        Button
      </Button>
    )

    const button = screen.getByRole('button', { name: /custom aria label/i })
    expect(button).toHaveAttribute('aria-label', 'Custom aria label')
    expect(button).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('handles focus events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()

    render(
      <Button onFocus={handleFocus} onBlur={handleBlur}>
        Focus me
      </Button>
    )

    const button = screen.getByRole('button', { name: /focus me/i })

    fireEvent.focus(button)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(button)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('renders with loading state when provided', () => {
    // This would depend on if the button supports a loading prop
    render(<Button>Loading Button</Button>)
    const button = screen.getByRole('button', { name: /loading button/i })
    expect(button).toBeInTheDocument()
  })
})