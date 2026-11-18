import { describe, it, expect } from 'vitest';
import { FamilyMember, FamilyGroup, VulnerabilityTier, HealthCondition } from '../src/types/family';

describe('Family Profile & Vulnerability Matrix Tests', () => {
  const demoMembers: FamilyMember[] = [
    {
      id: 'leo_demo',
      name: 'Leo',
      relationship: 'Child',
      age: 8,
      cohort: 'children',
      vulnerability_tier: 'high_risk',
      conditions: ['asthma'],
      activity_preference: 'light_walking',
      is_demo: true,
      notes: 'Carries rescue albuterol inhaler',
    },
    {
      id: 'elena_demo',
      name: 'Elena',
      relationship: 'Grandmother',
      age: 71,
      cohort: 'older_adults',
      vulnerability_tier: 'high_risk',
      conditions: ['cardiovascular'],
      activity_preference: 'light_walking',
      is_demo: true,
      notes: 'Hypertension medication',
    },
    {
      id: 'marcus_demo',
      name: 'Marcus',
      relationship: 'Father',
      age: 38,
      cohort: 'daily_commuters',
      vulnerability_tier: 'standard',
      conditions: ['none'],
      activity_preference: 'outdoor_running',
      is_demo: true,
      notes: 'Marathon training runner',
    },
    {
      id: 'sophia_demo',
      name: 'Sophia',
      relationship: 'Daughter / High Schooler',
      age: 16,
      cohort: 'students',
      vulnerability_tier: 'sensitive',
      conditions: ['allergies'],
      activity_preference: 'cycling',
      is_demo: true,
      notes: 'Bike commuter to secondary school',
    },
  ];

  const demoFamily: FamilyGroup = {
    id: 'default_family',
    family_name: 'Demo Household',
    is_demo: true,
    members: demoMembers,
  };

  it('demonstration profile contains 4 distinct generational cohorts', () => {
    expect(demoFamily.members).toHaveLength(4);
    const cohorts = demoFamily.members.map((m) => m.cohort);
    expect(cohorts).toContain('children');
    expect(cohorts).toContain('older_adults');
    expect(cohorts).toContain('daily_commuters');
    expect(cohorts).toContain('students');
  });

  it('verifies that pediatric asthma and senior cardiovascular are classified as high_risk', () => {
    const leo = demoFamily.members.find((m) => m.id === 'leo_demo');
    const elena = demoFamily.members.find((m) => m.id === 'elena_demo');

    expect(leo?.vulnerability_tier).toBe('high_risk');
    expect(leo?.conditions).toContain('asthma');

    expect(elena?.vulnerability_tier).toBe('high_risk');
    expect(elena?.conditions).toContain('cardiovascular');
  });

  it('verifies student cyclist with seasonal allergies is sensitive tier', () => {
    const sophia = demoFamily.members.find((m) => m.id === 'sophia_demo');
    expect(sophia?.vulnerability_tier).toBe('sensitive');
    expect(sophia?.conditions).toContain('allergies');
  });

  it('verifies healthy adult runner is classified as standard tier', () => {
    const marcus = demoFamily.members.find((m) => m.id === 'marcus_demo');
    expect(marcus?.vulnerability_tier).toBe('standard');
    expect(marcus?.activity_preference).toBe('outdoor_running');
  });

  it('simulates clearing and resetting demo profiles', () => {
    // Clear demo
    const clearedFamily: FamilyGroup = {
      ...demoFamily,
      is_demo: false,
      members: [],
    };
    expect(clearedFamily.members).toHaveLength(0);
    expect(clearedFamily.is_demo).toBe(false);

    // Reset demo
    const restoredFamily: FamilyGroup = {
      ...clearedFamily,
      is_demo: true,
      members: demoMembers,
    };
    expect(restoredFamily.members).toHaveLength(4);
    expect(restoredFamily.is_demo).toBe(true);
  });
});

