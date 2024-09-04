// Server actions
'use server';

import { createUser } from '@/lib/user';

export async function signup(prevState, formData) {
  // grag user info
  const email = formData.get('email');
  const password = formData.get('password');
  // validate data
  let errors = {};
  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }
  if (password.trim().length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  }
  // check for errors if exist
  if (Object.keys(errors).length > 0) {
    return {
      errors: errors,
    };
  }
  // store in database
  createUser(email, password);
}
