import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from '../constants/env';

export const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
