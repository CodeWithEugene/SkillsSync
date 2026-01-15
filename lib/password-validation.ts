/**
 * Password strength validation utilities
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

// Common weak passwords to reject
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'abc123',
  'password123',
  'admin123',
  'letmein',
  'welcome123',
  'monkey123',
  '1234567',
  'sunshine',
  'princess',
  'football',
  'iloveyou',
  '123123',
]

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = []
  let strengthScore = 0

  // Minimum length check (8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    strengthScore += 1
  }

  // Maximum length check (128 characters for security)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    strengthScore += 1
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    strengthScore += 1
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    strengthScore += 1
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  } else {
    strengthScore += 1
  }

  // Check for common weak passwords
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.some((common) => lowerPassword.includes(common.toLowerCase()))) {
    errors.push('Password is too common. Please choose a more unique password')
  }

  // Check for repeated characters (e.g., "aaaaaa" or "111111")
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password contains too many repeated characters')
  }

  // Check for sequential characters (e.g., "12345" or "abcde")
  if (/12345|abcde|qwerty/i.test(password)) {
    errors.push('Password contains common sequences')
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (strengthScore >= 5 && password.length >= 12) {
    strength = 'strong'
  } else if (strengthScore >= 4 && password.length >= 10) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Get password strength indicator color
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'text-green-600 dark:text-green-400'
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'weak':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * Get password requirements checklist
 */
export function getPasswordRequirements(password: string): Array<{ text: string; met: boolean }> {
  return [
    {
      text: 'At least 8 characters long',
      met: password.length >= 8,
    },
    {
      text: 'Contains an uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      text: 'Contains a lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      text: 'Contains a number',
      met: /[0-9]/.test(password),
    },
    {
      text: 'Contains a special character (!@#$%^&*...)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ]
}
