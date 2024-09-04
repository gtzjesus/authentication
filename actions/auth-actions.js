// Server actions
'use server';

import { createAuthSession } from '@/lib/auth';
import { hashUserPassword } from '@/lib/hash';
import { createUser } from '@/lib/user';
import { redirect } from 'next/navigation';

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
  // hash password
  const hashedPassword = hashUserPassword(password);
  // store in database
  try {
    const id = createUser(email, hashedPassword);
    // create the session
    await createAuthSession(id);
    //redirect to show auth route
    redirect('/training');
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        errors: {
          email: 'It seems like an account exists with this email.',
        },
      };
    }
    throw error;
  }
}
