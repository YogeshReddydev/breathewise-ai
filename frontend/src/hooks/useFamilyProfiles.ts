import { useState, useEffect } from 'react';
import { FamilyGroup, FamilyMember } from '../types/family';
import {
  fetchActiveProfile,
  resetDemoProfile,
  clearDemoProfile,
  addFamilyMember,
  removeFamilyMember,
} from '../services/api';

export function useFamilyProfiles() {
  const [family, setFamily] = useState<FamilyGroup | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const active = await fetchActiveProfile();
      setFamily(active);
      if (active.members.length > 0) {
        setSelectedMemberId(active.members[0].id);
      } else {
        setSelectedMemberId(null);
      }
    } catch (err: unknown) {
      console.warn('Could not load profile from backend, using demo default:', err);
      setActionError('Working in offline household mode');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleResetDemo = async () => {
    try {
      const res = await resetDemoProfile();
      setFamily(res);
      if (res.members.length > 0) setSelectedMemberId(res.members[0].id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to reset demo profile');
    }
  };

  const handleClearDemo = async () => {
    try {
      const res = await clearDemoProfile();
      setFamily(res);
      setSelectedMemberId(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to clear demo profile');
    }
  };

  const handleAddMember = async (member: FamilyMember) => {
    try {
      const res = await addFamilyMember(member);
      setFamily(res);
      setSelectedMemberId(member.id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to add family member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await removeFamilyMember(memberId);
      setFamily(res);
      if (selectedMemberId === memberId) {
        setSelectedMemberId(res.members.length > 0 ? res.members[0].id : null);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove family member');
    }
  };

  const selectedMember: FamilyMember | undefined = family?.members.find(
    (m) => m.id === selectedMemberId
  );

  return {
    family,
    setFamily,
    selectedMemberId,
    setSelectedMemberId,
    selectedMember,
    loading,
    actionError,
    resetDemo: handleResetDemo,
    clearDemo: handleClearDemo,
    addMember: handleAddMember,
    removeMember: handleRemoveMember,
    reloadProfile: loadProfile,
  };
}
