import { getAuth, type Auth } from 'firebase/auth';
import { app } from './config';

export const auth: Auth = getAuth(app);
