// National Blood Transfusion Council (NBTC) India Donation Interval Rules
// - Male: 90 days (3 months)
// - Female: 120 days (4 months)
// - Other/Default: 90 days

function getWaitingDays(gender) {
  const g = (gender || '').toUpperCase();
  if (g === 'FEMALE' || g === 'F') return 120;
  return 90;
}

function calculateNbtcEligibility(donor) {
  if (!donor) return { isEligible: false, status: 'TEMPORARILY_INELIGIBLE' };

  if (donor.eligibility === 'PERMANENTLY_INELIGIBLE') {
    return {
      isEligible: false,
      status: 'PERMANENTLY_INELIGIBLE',
      daysRemaining: null,
      nextEligibleDate: null,
      reason: 'Permanently ineligible due to medical evaluation.'
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
      guideline: `NBTC India: ${intervalDays}-day interval applies between whole blood donations.`
    };
  }

  const lastDate = new Date(donor.lastDonation);
  const nextEligibleDate = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = nextEligibleDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (daysRemaining > 0) {
    return {
      isEligible: false,
      status: 'TEMPORARILY_INELIGIBLE',
      daysRemaining,
      nextEligibleDate,
      intervalDays,
      reason: `NBTC India Rule: Mandatory ${intervalDays}-day interval between donations for ${donor.gender === 'FEMALE' ? 'female' : 'male'} donors. ${daysRemaining} day(s) remaining.`
    };
  }

  return {
    isEligible: true,
    status: 'ELIGIBLE',
    daysRemaining: 0,
    nextEligibleDate,
    intervalDays,
    guideline: `NBTC India: Fully eligible to donate whole blood (${intervalDays}-day cooldown satisfied).`
  };
}

module.exports = {
  getWaitingDays,
  calculateNbtcEligibility,
};
