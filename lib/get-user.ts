import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

