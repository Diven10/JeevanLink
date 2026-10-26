// National Blood Transfusion Council (NBTC) India Guidelines
// Whole Blood Donation Minimum Waiting Intervals:
// - Male: 90 days (approx. 3 months)
// - Female: 120 days (approx. 4 months)
// - General eligibility: Age 18-65, Weight >= 45kg, Hemoglobin >= 12.5 g/dL

export function getWaitingDays(gender) {
  const g = (gender || '').toUpperCase();
  if (g === 'FEMALE' || g === 'F') return 120;
  return 90;
}

export function getNbtcStatus(donor) {
  if (!donor) {
    return {
      isEligible: false,
      status: 'TEMPORARILY_INELIGIBLE',
      daysRemaining: 0,
      nextEligibleDate: null,
      intervalDays: 90,
      percent: 0,
    };
  }

  if (donor.eligibility === 'PERMANENTLY_INELIGIBLE') {
    return {
      isEligible: false,
      status: 'PERMANENTLY_INELIGIBLE',
      daysRemaining: null,
      nextEligibleDate: null,
      intervalDays: 90,
      percent: 0,
      reason: 'Permanently deferred based on medical evaluation.'
    };
  }

  const intervalDays = getWaitingDays(donor.gender);

  if (!donor.lastDonation) {
    return {
      isEligible: true,
      status: 'ELIGIBLE',
      daysRemaining: 0,
      nextEligibleDate: null,
      intervalDays,
      percent: 100,
      label: 'Fully Eligible',
      ruleDescription: `Indian NBTC: Ready to donate (Standard ${intervalDays}-day interval applies).`
    };
  }

  const lastDate = new Date(donor.lastDonation);
  const nextEligibleTime = lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000;
  const nextEligibleDate = new Date(nextEligibleTime);
  const now = new Date();
  const diffMs = nextEligibleTime - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const elapsedMs = Math.max(0, now.getTime() - lastDate.getTime());
  const totalMs = intervalDays * 24 * 60 * 60 * 1000;
  const percent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  if (daysRemaining > 0) {
    return {
      isEligible: false,
      status: 'TEMPORARILY_INELIGIBLE',
      daysRemaining,
      nextEligibleDate,
      intervalDays,
      percent,
      label: 'Cooldown Active',
      reason: `NBTC India Rule: Mandatory ${intervalDays}-day wait period (${donor.gender === 'FEMALE' ? 'Female' : 'Male'} donor). Next eligible: ${nextEligibleDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
    };
  }

  return {
    isEligible: true,
    status: 'ELIGIBLE',
    daysRemaining: 0,
    nextEligibleDate,
    intervalDays,
    percent: 100,
    label: 'Fully Eligible',
    ruleDescription: `NBTC India: ${intervalDays}-day cooldown satisfied. You are eligible to donate.`
  };
}
