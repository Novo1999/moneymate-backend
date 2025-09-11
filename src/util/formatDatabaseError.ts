export const formatDatabaseError = (error: any) => {
  if (error.code === '23505') {
    // PostgreSQL unique constraint violation
    if (error.constraint) {
      // Extract table and column info from constraint name if possible
      if (error.constraint.includes('category') || error.detail?.includes('category')) {
        return 'A category with this name already exists. Please choose a different name.'
      }
      if (error.constraint.includes('email')) {
        return 'This email address is already registered.'
      }
      if (error.constraint.includes('username')) {
        return 'This username is already taken.'
      }
    }
    return 'This record already exists. Please check for duplicates.'
  }

  if (error.code === '23503') {
    // Foreign key violation
    return 'Cannot complete this action due to related data dependencies.'
  }

  if (error.code === '23502') {
    // Not null violation
    return 'Required field is missing.'
  }

  return 'An unexpected error occurred. Please try again.'
}
