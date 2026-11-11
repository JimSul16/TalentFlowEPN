import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { environment } from '../../../environments/environment';

export const app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
export const db = getFirestore(app);
