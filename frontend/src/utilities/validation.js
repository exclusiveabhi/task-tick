export const validateFields = (email, password) => {
  if (!email || !password) {
    return {
      valid: false,
      message: 'All fields are required!',
    };
  }

  if (password.length < 4) {
    return {
      valid: false,
      message: 'Password must be at least 4 characters long!',
    };
  }

  return { valid: true };
};