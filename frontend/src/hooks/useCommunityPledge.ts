import { useState } from 'react';

const STORAGE_KEY = 'breathewise_pledged';
const INITIAL_BASELINE_COUNT = 1428;

export function useCommunityPledge() {
  const [pledged, setPledged] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [pledgeCount, setPledgeCount] = useState<number>(() => {
    return pledged ? INITIAL_BASELINE_COUNT + 1 : INITIAL_BASELINE_COUNT;
  });

  const makePledge = () => {
    if (!pledged) {
      setPledged(true);
      setPledgeCount((prev) => prev + 1);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (err) {
        console.warn('Could not persist pledge to local storage', err);
      }
    }
  };

  return {
    pledged,
    pledgeCount,
    makePledge,
  };
}
