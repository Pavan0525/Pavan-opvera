/**
 * Input validation and sanitization utilities
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

// LinkedIn URL validation
const LINKEDIN_REGEX = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/

// File type validation
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  verification: ['application/pdf', 'image/jpeg', 'image/png']
}

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 2 * 1024 * 1024, // 2MB
  document: 5 * 1024 * 1024, // 5MB
  verification: 10 * 1024 * 1024 // 10MB
}

/**
 * Sanitize text input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }
  
  const sanitizedEmail = sanitizeText(email).toLowerCase()
  
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }
  
  return { isValid: true, value: sanitizedEmail }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` }
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' }
  }
  
  return { isValid: true, value: password }
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} - Validation result
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword || typeof confirmPassword !== 'string') {
    return { isValid: false, error: 'Please confirm your password' }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  
  return { isValid: true, value: confirmPassword }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {Object} - Validation result
 */
export function validateUrl(url, required = false) {
  if (!url || typeof url !== 'string') {
    if (required) {
      return { isValid: false, error: 'URL is required' }
    }
    return { isValid: true, value: '' }
  }
  
  const sanitizedUrl = sanitizeText(url)
  
  if (sanitizedUrl && !URL_REGEX.test(sanitizedUrl)) {
    return { isValid: false, error: 'Please enter a valid URL' }
  }
  
  return { isValid: true, value: sanitizedUrl }
}

/**
 * Validate LinkedIn URL
 * @param {string} url - LinkedIn URL to validate
 * @returns {Object} - Validation result
 */
export function validateLinkedInUrl(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: true, value: '' }
  }
  
  const sanitizedUrl = sanitizeText(url)
  
  if (sanitizedUrl && !LINKEDIN_REGEX.test(sanitizedUrl)) {
    return { isValid: false, error: 'Please enter a valid LinkedIn profile URL' }
  }
  
  return { isValid: true, value: sanitizedUrl }
}

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateText(text, options = {}) {
  const { required = false, minLength = 0, maxLength = 1000, fieldName = 'Field' } = options
  
  if (!text || typeof text !== 'string') {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true, value: '' }
  }
  
  const sanitizedText = sanitizeText(text)
  
  if (required && sanitizedText.length === 0) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  if (sanitizedText.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` }
  }
  
  if (sanitizedText.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters long` }
  }
  
  return { isValid: true, value: sanitizedText }
}

/**
 * Validate number input
 * @param {string|number} number - Number to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateNumber(number, options = {}) {
  const { required = false, min = 0, max = 100, fieldName = 'Number' } = options
  
  if (number === null || number === undefined || number === '') {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true, value: null }
  }
  
  const numValue = typeof number === 'string' ? parseFloat(number) : number
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` }
  }
  
  if (numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` }
  }
  
  if (numValue > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max}` }
  }
  
  return { isValid: true, value: numValue }
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {string} type - File type category (image, document, verification)
 * @returns {Object} - Validation result
 */
export function validateFile(file, type) {
  if (!file) {
    return { isValid: false, error: 'No file selected' }
  }
  
  if (!ALLOWED_FILE_TYPES[type]) {
    return { isValid: false, error: 'Invalid file type category' }
  }
  
  if (!ALLOWED_FILE_TYPES[type].includes(file.type)) {
    const allowedTypes = ALLOWED_FILE_TYPES[type].map(t => t.split('/')[1]).join(', ')
    return { isValid: false, error: `File type not allowed. Please upload: ${allowedTypes}` }
  }
  
  if (file.size > FILE_SIZE_LIMITS[type]) {
    const maxSizeMB = FILE_SIZE_LIMITS[type] / (1024 * 1024)
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }
  
  return { isValid: true, value: file }
}

/**
 * Validate skills/expertise array
 * @param {Array} skills - Skills array to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateSkills(skills, options = {}) {
  const { required = false, minCount = 0, maxCount = 20, fieldName = 'Skills' } = options
  
  if (!Array.isArray(skills)) {
    if (required) {
      return { isValid: false, error: `${fieldName} are required` }
    }
    return { isValid: true, value: [] }
  }
  
  const sanitizedSkills = skills.map(skill => sanitizeText(skill)).filter(skill => skill.length > 0)
  
  if (required && sanitizedSkills.length === 0) {
    return { isValid: false, error: `${fieldName} are required` }
  }
  
  if (sanitizedSkills.length < minCount) {
    return { isValid: false, error: `Please add at least ${minCount} ${fieldName.toLowerCase()}` }
  }
  
  if (sanitizedSkills.length > maxCount) {
    return { isValid: false, error: `Maximum ${maxCount} ${fieldName.toLowerCase()} allowed` }
  }
  
  // Check for duplicate skills
  const uniqueSkills = [...new Set(sanitizedSkills)]
  if (uniqueSkills.length !== sanitizedSkills.length) {
    return { isValid: false, error: 'Duplicate skills are not allowed' }
  }
  
  return { isValid: true, value: sanitizedSkills }
}

/**
 * Validate form data for registration
 * @param {Object} formData - Form data to validate
 * @param {string} role - User role
 * @returns {Object} - Validation result
 */
export function validateRegistrationForm(formData, role) {
  const errors = {}
  const sanitizedData = {}
  
  // Common validations
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  } else {
    sanitizedData.email = emailValidation.value
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error
  } else {
    sanitizedData.password = passwordValidation.value
  }
  
  const confirmPasswordValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword)
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error
  }
  
  const firstNameValidation = validateText(formData.firstName, { required: true, minLength: 1, maxLength: 50, fieldName: 'First name' })
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error
  } else {
    sanitizedData.firstName = firstNameValidation.value
  }
  
  const lastNameValidation = validateText(formData.lastName, { required: true, minLength: 1, maxLength: 50, fieldName: 'Last name' })
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error
  } else {
    sanitizedData.lastName = lastNameValidation.value
  }
  
  // Role-specific validations
  if (role === 'student') {
    const collegeValidation = validateText(formData.college, { required: true, minLength: 2, maxLength: 100, fieldName: 'College/University' })
    if (!collegeValidation.isValid) {
      errors.college = collegeValidation.error
    } else {
      sanitizedData.college = collegeValidation.value
    }
    
    const batchValidation = validateText(formData.batch, { required: true, minLength: 1, maxLength: 20, fieldName: 'Batch/Year' })
    if (!batchValidation.isValid) {
      errors.batch = batchValidation.error
    } else {
      sanitizedData.batch = batchValidation.value
    }
    
    const cgpaValidation = validateNumber(formData.cgpa, { required: false, min: 0, max: 10, fieldName: 'CGPA' })
    if (!cgpaValidation.isValid) {
      errors.cgpa = cgpaValidation.error
    } else {
      sanitizedData.cgpa = cgpaValidation.value
    }
    
    const skillsValidation = validateSkills(formData.skills, { required: true, minCount: 1, maxCount: 15, fieldName: 'Skills' })
    if (!skillsValidation.isValid) {
      errors.skills = skillsValidation.error
    } else {
      sanitizedData.skills = skillsValidation.value
    }
  }
  
  if (role === 'mentor') {
    const bioValidation = validateText(formData.bio, { required: true, minLength: 50, maxLength: 1000, fieldName: 'Bio' })
    if (!bioValidation.isValid) {
      errors.bio = bioValidation.error
    } else {
      sanitizedData.bio = bioValidation.value
    }
    
    const linkedinValidation = validateLinkedInUrl(formData.linkedin)
    if (!linkedinValidation.isValid) {
      errors.linkedin = linkedinValidation.error
    } else {
      sanitizedData.linkedin = linkedinValidation.value
    }
    
    const availabilityValidation = validateText(formData.availability, { required: true, fieldName: 'Availability' })
    if (!availabilityValidation.isValid) {
      errors.availability = availabilityValidation.error
    } else {
      sanitizedData.availability = availabilityValidation.value
    }
    
    const expertiseValidation = validateSkills(formData.domain_expertise, { required: true, minCount: 1, maxCount: 10, fieldName: 'Domain expertise' })
    if (!expertiseValidation.isValid) {
      errors.domain_expertise = expertiseValidation.error
    } else {
      sanitizedData.domain_expertise = expertiseValidation.value
    }
  }
  
  if (role === 'company') {
    const companyNameValidation = validateText(formData.companyName, { required: true, minLength: 2, maxLength: 100, fieldName: 'Company name' })
    if (!companyNameValidation.isValid) {
      errors.companyName = companyNameValidation.error
    } else {
      sanitizedData.companyName = companyNameValidation.value
    }
    
    const descriptionValidation = validateText(formData.description, { required: true, minLength: 20, maxLength: 500, fieldName: 'Company description' })
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error
    } else {
      sanitizedData.description = descriptionValidation.value
    }
    
    const contactPersonValidation = validateText(formData.contactPerson, { required: true, minLength: 2, maxLength: 100, fieldName: 'Contact person' })
    if (!contactPersonValidation.isValid) {
      errors.contactPerson = contactPersonValidation.error
    } else {
      sanitizedData.contactPerson = contactPersonValidation.value
    }
    
    const contactTitleValidation = validateText(formData.contactTitle, { required: true, minLength: 2, maxLength: 100, fieldName: 'Contact title' })
    if (!contactTitleValidation.isValid) {
      errors.contactTitle = contactTitleValidation.error
    } else {
      sanitizedData.contactTitle = contactTitleValidation.value
    }
    
    const websiteValidation = validateUrl(formData.website, false)
    if (!websiteValidation.isValid) {
      errors.website = websiteValidation.error
    } else {
      sanitizedData.website = websiteValidation.value
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}

/**
 * Validate login form
 * @param {Object} formData - Login form data
 * @returns {Object} - Validation result
 */
export function validateLoginForm(formData) {
  const errors = {}
  const sanitizedData = {}
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  } else {
    sanitizedData.email = emailValidation.value
  }
  
  if (!formData.password || typeof formData.password !== 'string') {
    errors.password = 'Password is required'
  } else {
    sanitizedData.password = formData.password
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}
