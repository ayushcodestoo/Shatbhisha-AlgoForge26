/**
 * Advanced Case Analytics - Calculates case strength, evidence completeness,
 * and generates analytical insights for cybercrime cases
 */

/**
 * Calculate Case Strength Score (0-100)
 * Based on: trust score, evidence count, scam indicators, urgency level
 */
export function calculateCaseStrength(result, evidenceCount) {
  if (!result) return 0;

  let strengthScore = 0;

  // Factor 1: Trust Score (0-40 points)
  // High trust score (scam detection score) = stronger case
  const trustScoreNormalized = Math.min(result.score / 100, 1);
  const trustPoints = trustScoreNormalized * 40;

  // Factor 2: Evidence Count (0-30 points)
  // More evidence = stronger case
  // Scale: 0 evidence = 0 pts, 5+ evidence = 30 pts
  const evidencePoints = Math.min((evidenceCount / 5) * 30, 30);

  // Factor 3: Scam Indicators (0-20 points)
  // More matched indicators = stronger case
  const indicatorCount = result.highlightedKeywords?.length || 0;
  const indicatorPoints = Math.min((indicatorCount / 10) * 20, 20);

  // Factor 4: Urgency Level (0-10 points)
  // High urgency scams = stronger/more serious case
  const urgencyPoints = result.urgencyLevel === 'HIGH' ? 10 : result.urgencyLevel === 'MEDIUM' ? 5 : 0;

  strengthScore = Math.round(trustPoints + evidencePoints + indicatorPoints + urgencyPoints);

  return {
    score: Math.min(strengthScore, 100),
    breakdown: {
      trustScore: Math.round(trustPoints),
      evidenceScore: Math.round(evidencePoints),
      indicatorScore: Math.round(indicatorPoints),
      urgencyScore: Math.round(urgencyPoints)
    },
    description: getCaseStrengthDescription(strengthScore)
  };
}

/**
 * Get human-readable case strength description
 */
function getCaseStrengthDescription(score) {
  if (score >= 85) return 'Extremely Strong - High conviction potential';
  if (score >= 70) return 'Very Strong - Clear evidence pattern';
  if (score >= 55) return 'Strong - Solid case foundation';
  if (score >= 40) return 'Moderate - Needs additional evidence';
  if (score >= 25) return 'Weak - Limited substantiation';
  return 'Very Weak - Insufficient evidence';
}

/**
 * Calculate Evidence Completeness Indicator
 * Suggests what evidence is still needed
 */
export function calculateEvidenceCompleteness(evidenceList, detectedScamType) {
  const requiredEvidence = {
    'UPI BANK': ['screenshot', 'transaction_record', 'message'],
    'O T P': ['screenshot', 'message', 'link'],
    'JOB': ['job_posting', 'communication', 'payment_proof'],
    'PHISHING': ['link', 'screenshot', 'message'],
    'SEXTORTION': ['message', 'screenshot', 'threat_proof'],
    'LOTTERY': ['message', 'screenshot', 'email'],
    'ROMANCE': ['chat_messages', 'profile_screenshot', 'payment_proof'],
    'PACKAGE': ['message', 'link', 'screenshot'],
    'TAX': ['email', 'document_screenshot', 'message'],
    'INSURANCE': ['email', 'document', 'message']
  };

  const scamTypeKey = detectedScamType?.type || 'UPI BANK';
  const suggested = requiredEvidence[scamTypeKey] || ['screenshot', 'message', 'additional_proof'];

  // Get existing evidence types (simplified - counting file uploads)
  const collectedTypes = Math.min(evidenceList.length, suggested.length);
  const completenessPercentage = Math.round((collectedTypes / suggested.length) * 100);

  const missingItems = suggested.slice(collectedTypes).map(item => {
    return {
      type: item,
      humanReadable: formatEvidenceType(item)
    };
  });

  return {
    percentage: completenessPercentage,
    collected: Math.min(collectedTypes, suggested.length),
    required: suggested.length,
    missingItems: missingItems,
    status: getCompletenessStatus(completenessPercentage),
    suggestion: getMissingSuggestion(missingItems)
  };
}

/**
 * Format evidence type to human-readable format
 */
function formatEvidenceType(type) {
  const mapping = {
    'screenshot': 'Screenshot of message/transaction',
    'transaction_record': 'Transaction/Receipt record',
    'message': 'Full message/SMS screenshot',
    'link': 'Suspicious link details',
    'job_posting': 'Original job posting',
    'communication': 'Email/chat communication',
    'payment_proof': 'Payment proof/receipt',
    'threat_proof': 'Evidence of threat/sextortion',
    'email': 'Email screenshot',
    'document_screenshot': 'Document/Notice screenshot',
    'chat_messages': 'Complete chat history',
    'profile_screenshot': 'Profile/Photo screenshots',
    'document': 'Supporting documents',
    'additional_proof': 'Additional supporting proof'
  };
  return mapping[type] || type.replace(/_/g, ' ');
}

/**
 * Get completeness status
 */
function getCompletenessStatus(percentage) {
  if (percentage >= 90) return 'Complete';
  if (percentage >= 70) return 'Nearly Complete';
  if (percentage >= 50) return 'Adequate';
  if (percentage >= 25) return 'Incomplete';
  return 'Minimal';
}

/**
 * Get missing item suggestion text
 */
function getMissingSuggestion(missingItems) {
  if (missingItems.length === 0) return 'All recommended evidence collected';
  if (missingItems.length === 1) return `Consider adding: ${missingItems[0].humanReadable}`;
  return `Still needed: ${missingItems.slice(0, 2).map(i => i.humanReadable).join(', ')}`;
}

/**
 * Generate Auto Incident Summary
 * Creates a brief professional summary of the incident
 */
export function generateIncidentSummary(result, evidenceCount, caseStrength) {
  const scamType = result.scamTypes?.[0]?.type || 'Unknown';
  const riskLevel = result.urgencyLevel;
  const trustScore = result.score;
  const howDetected = result.highlightedKeywords?.slice(0, 2).join(', ') || 'pattern analysis';

  let summary = '';

  // Incident classification
  summary += `Incident Classification: ${scamType} (${riskLevel} Risk)\n\n`;

  // Detection overview
  summary += `Threat Assessment: Message analyzed for scam indicators with ${trustScore}/100 confidence. `;
  summary += `Detection based on ${howDetected}.\n\n`;

  // Risk description
  const recovery = result.scamTypes?.[0]?.recovery || 'Unknown';
  summary += `Recovery Prospects: ${recovery}\n\n`;

  // Case strength insight
  summary += `Case Strength: ${caseStrength.description}\n\n`;

  // Evidence status
  summary += `Evidence Status: ${evidenceCount} file(s) collected. `;
  summary += `Case documentation ${evidenceCount >= 2 ? 'is adequate' : 'needs strengthening'}.\n\n`;

  // Immediate action recommendation
  if (trustScore >= 80) {
    summary += `Recommendation: File complaint immediately. Time-sensitive recovery window active.`;
  } else if (trustScore >= 50) {
    summary += `Recommendation: Document thoroughly and file complaint within 24 hours.`;
  } else {
    summary += `Recommendation: Gather additional evidence before filing official complaint.`;
  }

  return summary;
}

/**
 * Time-to-Action Tracker
 * Calculates elapsed time and urgency message
 */
export function getTimeToActionData(detectionTimeISO) {
  if (!detectionTimeISO) return null;

  const detectionTime = new Date(detectionTimeISO);
  const now = new Date();
  const elapsedMs = now - detectionTime;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMinutes = 120 - elapsedMinutes; // 2-hour critical window

  let timeDisplay = '';
  let urgencyLevel = 'normal';
  let urgencyMessage = '';

  if (elapsedHours > 0) {
    timeDisplay = `${elapsedHours}h ${elapsedMinutes % 60}m ago`;
  } else {
    timeDisplay = `${elapsedMinutes}m ago`;
  }

  if (remainingMinutes <= 0) {
    urgencyLevel = 'expired';
    urgencyMessage = 'Critical window expired. Immediate action still needed.';
  } else if (remainingMinutes <= 15) {
    urgencyLevel = 'critical';
    urgencyMessage = `CRITICAL: ${remainingMinutes} minutes remaining in 2-hour recovery window`;
  } else if (remainingMinutes <= 60) {
    urgencyLevel = 'high';
    urgencyMessage = `${remainingMinutes} minutes remaining - action required soon`;
  } else {
    urgencyLevel = 'normal';
    urgencyMessage = 'Complete within 2 hours for best recovery chances';
  }

  return {
    detectionTime: timeDisplay,
    elapsedMinutes,
    elapsedHours,
    remainingMinutes: Math.max(0, remainingMinutes),
    urgencyLevel,
    urgencyMessage,
    criticalWindow: remainingMinutes > 0 && remainingMinutes <= 120
  };
}

/**
 * Generate Confidence Breakdown
 * Shows all factors contributing to the final score
 */
export function getConfidenceBreakdown(result) {
  const factors = [];

  // Pattern matching factor
  if (result.scamTypes?.length > 0) {
    factors.push({
      factor: 'Scam Type Detection',
      contribution: `${result.scamTypes[0].score} points`,
      value: result.scamTypes[0].type,
      icon: '🎯'
    });
  }

  // Urgent keywords
  factors.push({
    factor: 'Urgency Indicators',
    contribution: `+${Math.min((result.highlightedKeywords?.length || 0) * 5, 30)} points`,
    value: `${result.highlightedKeywords?.length || 0} keywords detected`,
    icon: '⚡'
  });

  // Phishing/link factor
  if (result.originalText?.toLowerCase().includes('http')) {
    factors.push({
      factor: 'Suspicious Links',
      contribution: '+25 points',
      value: 'External links detected',
      icon: '🔗'
    });
  }

  // Message length factor
  if (result.originalText?.length > 500) {
    factors.push({
      factor: 'Message Length',
      contribution: '+10 points',
      value: 'Lengthy narrative (social engineering tactic)',
      icon: '📝'
    });
  }

  // Risk level
  if (result.urgencyLevel === 'HIGH') {
    factors.push({
      factor: 'Risk Classification',
      contribution: '+15 points',
      value: 'High priority threat level',
      icon: '⚠️'
    });
  }

  return {
    finalScore: result.score,
    factors: factors,
    totalFactorsAnalyzed: factors.length,
    scorePercentage: result.score
  };
}

/**
 * Risk Comparison
 * Compare current case risk to baseline
 */
export function getRiskComparison(trustScore, scamType) {
  // Baseline average scores per scam type (from historical data)
  const baselineScores = {
    'UPI BANK': 78,
    'O T P': 82,
    'JOB': 65,
    'PHISHING': 72,
    'SEXTORTION': 45,
    'LOTTERY': 55,
    'ROMANCE': 50,
    'PACKAGE': 60,
    'TAX': 70,
    'INSURANCE': 68
  };

  const typeKey = scamType?.type || 'UPI BANK';
  const baselineScore = baselineScores[typeKey] || 65;
  const difference = trustScore - baselineScore;

  let comparison = '';
  let riskLevel = '';

  if (difference >= 15) {
    comparison = `${Math.abs(Math.round(difference))} points HIGHER than typical ${typeKey} cases`;
    riskLevel = 'significantly_higher';
  } else if (difference >= 5) {
    comparison = `${Math.abs(Math.round(difference))} points higher than typical ${typeKey} cases`;
    riskLevel = 'higher';
  } else if (difference <= -15) {
    comparison = `${Math.abs(Math.round(difference))} points LOWER than typical ${typeKey} cases`;
    riskLevel = 'significantly_lower';
  } else if (difference <= -5) {
    comparison = `${Math.abs(Math.round(difference))} points lower than typical ${typeKey} cases`;
    riskLevel = 'lower';
  } else {
    comparison = `Consistent with typical ${typeKey} cases`;
    riskLevel = 'typical';
  }

  return {
    baseline: baselineScore,
    current: trustScore,
    difference: Math.round(difference),
    comparison: comparison,
    riskLevel: riskLevel,
    percentilRank: Math.round((trustScore / 100) * 100) // Percentile of severity
  };
}

/**
 * Generate Case ID
 * Simple case identifier for local storage
 */
export function generateCaseId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7).toUpperCase();
  return `CASE-${timestamp}-${random}`;
}

/**
 * Prepare Case object for storage
 */
export function prepareCaseForStorage(result, evidenceList, caseId) {
  const caseStrength = calculateCaseStrength(result, evidenceList.length);
  const completeness = calculateEvidenceCompleteness(evidenceList, result.scamTypes?.[0]);
  const summary = generateIncidentSummary(result, evidenceList.length, caseStrength);
  const timeData = getTimeToActionData(new Date().toISOString());

  return {
    id: caseId,
    createdAt: new Date().toISOString(),
    result: result,
    evidenceList: evidenceList,
    caseStrength: caseStrength,
    completeness: completeness,
    summary: summary,
    timeData: timeData,
    riskComparison: getRiskComparison(result.score, result.scamTypes?.[0])
  };
}
