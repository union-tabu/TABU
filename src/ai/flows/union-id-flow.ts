'use server';
/**
 * @fileOverview A flow to generate a unique 6-digit union ID for a new user.
 *
 * - generateUniqueUnionId - A function that generates a unique ID.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { z } from 'zod';

// Function to check if a union ID already exists in Firestore
async function isIdUnique(unionId: string): Promise<boolean> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("unionId", "==", unionId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

// Helper to generate a random 6-digit number as a string
function generateRandom6DigitNumber(): string {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString();
}

const generateUniqueUnionIdFlow = ai.defineFlow(
  {
    name: 'generateUniqueUnionIdFlow',
    inputSchema: z.void(),
    outputSchema: z.string(),
  },
  async () => {
    let attempts = 0;
    const maxAttempts = 10; // To prevent infinite loops in a highly unlikely scenario

    while (attempts < maxAttempts) {
      const newId = generateRandom6DigitNumber();
      const unique = await isIdUnique(newId);
      if (unique) {
        return newId;
      }
      attempts++;
    }

    throw new Error('Could not generate a unique Union ID after several attempts.');
  }
);

export async function generateUniqueUnionId(): Promise<string> {
    return generateUniqueUnionIdFlow();
}
