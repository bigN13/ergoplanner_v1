import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', {
        'conditional-class': true,
        'hidden-class': false,
      })
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('hidden-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toContain('base-class')
      expect(result).toContain('valid-class')
    })

    it('should handle array of classes', () => {
      const result = cn(['class-1', 'class-2'], 'class-3')
      expect(result).toContain('class-1')
      expect(result).toContain('class-2')
      expect(result).toContain('class-3')
    })

    it('should handle tailwind merge functionality', () => {
      // Test that conflicting Tailwind classes are properly merged
      const result = cn('text-red-500', 'text-blue-500')
      // The result should contain only one text color class (the latter one)
      expect(result).toBe('text-blue-500')
    })

    it('should handle complex combinations', () => {
      const result = cn(
        'base-class',
        {
          'conditional-true': true,
          'conditional-false': false,
        },
        ['array-class-1', 'array-class-2'],
        'final-class'
      )

      expect(result).toContain('base-class')
      expect(result).toContain('conditional-true')
      expect(result).not.toContain('conditional-false')
      expect(result).toContain('array-class-1')
      expect(result).toContain('array-class-2')
      expect(result).toContain('final-class')
    })
  })
})