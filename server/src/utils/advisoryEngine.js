function generateAdvisory(weatherType, warnings, vesselDraught, vesselPosition) {
  const criticalWarning = warnings.find((w) => w.severity === 'CRITICAL');
  const highWarning = warnings.find((w) => w.severity === 'HIGH');

  const inZoneNote = vesselPosition
    ? ' Your vessel position intersects an active hazard zone.'
    : '';

  if (weatherType === 'warning' || criticalWarning) {
    return {
      riskLevel: 'HIGH',
      recommendedRoute: criticalWarning
        ? `Avoid ${criticalWarning.affectedZone || 'marked hazard zone'}. Use alternate channel.`
        : 'Delay voyage until weather conditions improve.',
      advisoryText:
        'Current conditions present serious risk to navigation. Do not proceed without authorisation from port authority.' +
        inZoneNote,
    };
  }

  if (weatherType === 'caution' || highWarning) {
    let text =
      'Moderate risk detected. Ensure all crew safety equipment is operational before departure.';
    if (vesselDraught && vesselDraught > 1.2 && highWarning) {
      text += ` Vessel draught (${vesselDraught}m) may exceed safe depth in affected zones.`;
    }
    if (inZoneNote) text += inZoneNote;
    return {
      riskLevel: 'MODERATE',
      recommendedRoute: highWarning
        ? `Exercise caution near ${highWarning.affectedZone || 'active hazard zone'}.`
        : 'Proceed cautiously. Reduce speed in low-visibility areas.',
      advisoryText: text,
    };
  }

  return {
    riskLevel: 'LOW',
    recommendedRoute: 'Direct route recommended. Conditions are favourable.',
    advisoryText:
      'No significant hazards identified for this route at current time.' + inZoneNote,
  };
}

module.exports = { generateAdvisory };
