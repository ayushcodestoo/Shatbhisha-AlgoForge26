/**
 * Advanced rule-based scam detection system for Indian context
 * Supports 10+ scam categories with sophisticated pattern matching
 */

const scamTypePatterns = {
  otp: {
    keywords: ['otp', 'one-time', 'password', 'code', 'verify', 'verification', 'confirm', 'two-factor', '2fa', 'authenticator'],
    phrases: [
      'do not share otp',
      'do not disclose',
      'otp is sensitive',
      'otp expires',
      'verification code',
      'confirm your identity',
      'verify your account',
      'security code'
    ],
    riskLevel: 'critical',
    recovery: 'Very High (if caught within 30 mins)',
    description: 'OTP/Password Theft Scam - Attackers impersonate banks/services asking for verification codes'
  },
  upiBank: {
    keywords: ['upi', 'bank', 'payment', 'transfer', 'refund', 'account', 'neft', 'imps', 'rtgs', 'banking', 'debit', 'credit', 'balance', 'transaction', 'kyc'],
    phrases: [
      'verify your bank',
      'update bank details',
      'confirm your upi',
      'link your account',
      'bank alert',
      'suspicious transaction',
      'freeze account',
      'verify kyc',
      'account verification',
      'banking details needed',
      'activate account',
      'confirm payment'
    ],
    riskLevel: 'critical',
    recovery: 'High (if within 2 hours)',
    description: 'UPI/Bank Fraud - Phishing for banking credentials and payment gateway access'
  },
  jobScam: {
    keywords: ['job', 'hiring', 'recruitment', 'position', 'salary', 'apply', 'candidate', 'interview', 'employment', 'hire', 'work-from-home', 'wfh'],
    phrases: [
      'apply now',
      'limited positions',
      'payment required',
      'registration fee',
      'processing fee',
      'interview fee',
      'document processing',
      'selected for interview',
      'urgent hiring',
      'immediate joining',
      'work from home',
      'part-time job'
    ],
    riskLevel: 'high',
    recovery: 'Medium',
    description: 'Job Scam - Fake job offers requesting upfront fees or personal documents'
  },
  phishing: {
    keywords: ['click', 'link', 'verify', 'confirm', 'update', 'login', 'password', 'email', 'id', 'username'],
    phrases: [
      'click here',
      'verify now',
      'confirm identity',
      'update password',
      'reset password',
      're-verify account',
      'validate account',
      'click link',
      'instant verification',
      'validate identity',
      'confirm your details'
    ],
    riskLevel: 'high',
    recovery: 'Medium',
    description: 'Phishing Attack - Fake links and forms designed to steal credentials'
  },
  lottery: {
    keywords: ['won', 'lottery', 'prize', 'congratulations', 'winner', 'claim', 'reward', 'draw', 'jackpot', 'lucky'],
    phrases: [
      'you have won',
      'claim your prize',
      'lottery winner',
      'instant cash',
      'inheritance claimed',
      'tax payment',
      'claim reward',
      'congratulations you won\'ve'
    ],
    riskLevel: 'medium',
    recovery: 'Low',
    description: 'Lottery Scam - Fake lottery wins requesting money to claim prizes'
  },
  romance: {
    keywords: ['love', 'investment', 'bitcoin', 'crypto', 'business', 'friend', 'trust', 'help', 'money', 'western union', 'transfer', 'care'],
    phrases: [
      'invest in me',
      'help me out',
      'send money',
      'western union',
      'money transfer',
      'can you help',
      'i trust you',
      'need your help'
    ],
    riskLevel: 'medium',
    recovery: 'Low',
    description: 'Romance Scam - Fake relationships to emotionally manipulate victims into sending money'
  },
  taxRefund: {
    keywords: ['tax', 'refund', 'irs', 'income', 'filing', 'return', 'audit', 'department', 'revenue'],
    phrases: [
      'tax refund',
      'overdue refund',
      'tax return pending',
      'audit notice',
      'tax settlement',
      'verification needed',
      'claim refund'
    ],
    riskLevel: 'high',
    recovery: 'Medium',
    description: 'Tax Refund Scam - Impersonating tax authorities for money'
  },
  package: {
    keywords: ['package', 'delivery', 'shipment', 'courier', 'parcel', 'order', 'amazon', 'flipkart', 'ebay'],
    phrases: [
      'package delivery',
      'click to confirm',
      'verify shipment',
      'delivery update',
      'package pending',
      'confirm delivery address'
    ],
    riskLevel: 'medium',
    recovery: 'Medium',
    description: 'Package Delivery Scam - Fake delivery notices with malicious links'
  },
  sextortion: {
    keywords: ['camera', 'video', 'exposed', 'recorded', 'webcam', 'private', 'blackmail', 'embarrassing'],
    phrases: [
      'i have recorded you',
      'your video',
      'pay or i will send',
      'i have your camera footage',
      'embarrassing video'
    ],
    riskLevel: 'high',
    recovery: 'Low',
    description: 'Sextortion Scam - Fake video/photo blackmail threats'
  },
  insurance: {
    keywords: ['insurance', 'claim', 'policy', 'premium', 'health', 'mediclaim', 'coverage'],
    phrases: [
      'insurance claim',
      'verify policy',
      'premium update',
      'claim settlement',
      'policy pending',
      'coverage activation'
    ],
    riskLevel: 'high',
    recovery: 'Medium',
    description: 'Insurance Scam - Fraudulent insurance claims or premium collection'
  },
  creditCard: {
    keywords: ['credit', 'card', 'visa', 'mastercard', 'cvv', 'expiry', 'pin', 'otp', 'limit', 'due'],
    phrases: [
      'card verification',
      'activate card',
      'update card',
      'card limit increased',
      'card blocked',
      'verify cvv'
    ],
    riskLevel: 'critical',
    recovery: 'High',
    description: 'Credit Card Fraud - Theft of card details and CVV'
  },
  government: {
    keywords: ['government', 'aadhar', 'pan', 'gst', 'passport', 'license', 'goverment', 'documents'],
    phrases: [
      'government verification',
      'aadhar verification',
      'pan verification',
      'gst registration',
      'document verification',
      'verify identity'
    ],
    riskLevel: 'high',
    recovery: 'Medium',
    description: 'Government Impersonation - Fake government authority claims'
  }
};

// Urgent red-flag keywords
const urgentKeywords = [
  'urgent', 'immediate', 'act now', 'limited time', 'emergency', 'critical',
  'click now', 'verify immediately', 'confirm urgently', 'within 24 hours',
  'or your account will be blocked', 'final warning', 'last chance',
  'suspicious activity', 'unauthorized access', 'action required',
  'confirm asap', 'don\'t delay', 'expire soon', 'expiry'
];

const suspiciousKeywords = [
  'confirm details', 'update details', 'verify account', 'validate account',
  'check account', 'secure account', 'protect account', 'enable security',
  'authenticate', 'reactivate', 'renew'
];

/**
 * Main scam detection function
 */
export function detectScam(text) {
  if (!text || text.trim().length === 0) {
    return getDefaultResult(text);
  }

  const lowerText = text.toLowerCase();
  let score = 100;
  let detectedScamTypes = [];
  let highlightedKeywords = [];
  let reasons = [];
  let detectedPatterns = [];

  // 1. Detect scam types with improved scoring
  for (const [scamType, pattern] of Object.entries(scamTypePatterns)) {
    let typeScore = 0;
    let matchedKeywords = [];

    // Keywords (5 points each)
    pattern.keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        typeScore += 5;
        matchedKeywords.push(keyword);
      }
    });

    // Phrases (15 points each - more specific)
    pattern.phrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        typeScore += 15;
        matchedKeywords.push(phrase);
      }
    });

    if (typeScore >= 15) {
      detectedScamTypes.push({
        type: formatScamType(scamType),
        score: typeScore,
        riskLevel: pattern.riskLevel,
        recovery: pattern.recovery,
        matched: [...new Set(matchedKeywords)],
        description: pattern.description
      });
      highlightedKeywords.push(...matchedKeywords);
      detectedPatterns.push(pattern.description);
    }
  }

  // Sort by highest score
  detectedScamTypes.sort((a, b) => b.score - a.score);

  // **IF SCAM TYPE IS DETECTED, SIGNIFICANTLY REDUCE SCORE**
  if (detectedScamTypes.length > 0) {
    const topScam = detectedScamTypes[0];
    
    // Reduce score based on scam type risk level
    if (topScam.riskLevel === 'critical') {
      score -= 70; // OTP, Bank fraud, Credit card
      reasons.push(`🚨 CRITICAL SCAM TYPE DETECTED: ${topScam.type}`);
    } else if (topScam.riskLevel === 'high') {
      score -= 55; // Job, Phishing, Tax, Insurance, Sextortion, Government
      reasons.push(`⚠️ HIGH RISK SCAM DETECTED: ${topScam.type}`);
    } else if (topScam.riskLevel === 'medium') {
      score -= 40; // Lottery, Romance, Package Delivery
      reasons.push(`⚠️ MEDIUM RISK SCAM DETECTED: ${topScam.type}`);
    }
    
    // Additional penalty for multiple matches
    if (topScam.score >= 30) {
      score -= 15;
      reasons.push(`🎯 Multiple matching indicators found (${topScam.matched.length} patterns)`);
    }
  }

  // 2. Check for urgent keywords (strong indicators)
  let urgentCount = 0;
  urgentKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score -= 30;
      urgentCount++;
      reasons.push(`⚠️ Urgent language: "${keyword}"`);
    }
  });

  // 3. Check for suspicious keywords
  let suspiciousCount = 0;
  suspiciousKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score -= 15;
      suspiciousCount++;
    }
  });

  if (suspiciousCount > 0) {
    reasons.push(`🔔 ${suspiciousCount} request(s) for personal verification`);
  }

  // 4. Analyze URLs
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  if (urls.length > 0) {
    score -= 20 * urls.length;
    reasons.push(`🔗 ${urls.length} suspicious link(s) detected`);
    highlightedKeywords.push(...urls);

    // Check for suspicious URL patterns
    urls.forEach(url => {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('goo.gl') || lowerUrl.includes('bit.ly') || lowerUrl.includes('tinyurl')) {
        score -= 10;
        reasons.push('⚠️ Shortened URL detected (common in phishing)');
      }
    });
  }

  // 5. Analyze phone numbers
  const phoneRegex = /(\+91[-.\s]?[6-9]\d{3}[-.\s]?\d{4}[-.\s]?\d{4}|(\+91|0)[6-9]\d{9,10})/g;
  const phones = text.match(phoneRegex) || [];
  if (phones.length > 0) {
    score -= 10;
    reasons.push(`📞 Contact number detected (${phones.length})`);
  }

  // 6. Check for banking-related sensitive requests
  const bankTerms = [
    'account number', 'ifsc', 'cvv', 'cardholder', 'expiry', 'pin',
    'atm', 'swift', 'routing', 'iban', 'card number'
  ];
  let bankTermsFound = 0;
  bankTerms.forEach(term => {
    if (lowerText.includes(term)) {
      score -= 20;
      bankTermsFound++;
      reasons.push(`🏦 Sensitive banking info requested: "${term}"`);
    }
  });

  // 7. Check for file download requests (common in malware)
  const downloadPatterns = ['download', 'exe', 'zip', 'attachment', 'install'];
  if (downloadPatterns.some(p => lowerText.includes(p))) {
    score -= 15;
    reasons.push('📥 File download/installation request detected');
  }

  // 8. Check for personal information requests
  const personalInfoPatterns = ['ssn', 'social security', 'aadhar', 'pan', 'passport', 'driver license'];
  if (personalInfoPatterns.some(p => lowerText.includes(p))) {
    score -= 25;
    reasons.push('🆔 Sensitive personal identification requested');
  }

  // Ensure score stays in valid range
  score = Math.max(0, Math.min(100, score));

  // Determine final labels
  let label = 'Safe';
  let urgencyLevel = 'LOW';

  if (score <= 20) {
    label = 'CRITICAL SCAM';
    urgencyLevel = 'CRITICAL';
  } else if (score <= 40) {
    label = 'Likely Scam';
    urgencyLevel = 'HIGH';
  } else if (score <= 60) {
    label = 'Suspicious';
    urgencyLevel = 'MEDIUM';
  } else if (score <= 80) {
    label = 'Caution Advised';
    urgencyLevel = 'LOW';
  }

  return {
    score: Math.round(score),
    label,
    urgencyLevel,
    scamTypes: detectedScamTypes.slice(0, 3), // Top 3 matches
    highlightedKeywords: [...new Set(highlightedKeywords)].slice(0, 8),
    reasons: reasons.length > 0 ? reasons : ['✅ Message appears safe - no red flags detected'],
    recoveryChance: detectedScamTypes[0]?.recovery || 'N/A',
    detectedPatterns: [...new Set(detectedPatterns)],
    text,
    summary: detectedScamTypes.length > 0 
      ? `⚠️ This appears to be a ${detectedScamTypes[0]?.type} scam with ${detectedScamTypes[0]?.riskLevel} risk`
      : '✅ Message appears legitimate'
  };
}

function getDefaultResult(text) {
  return {
    score: 100,
    label: 'Safe',
    urgencyLevel: 'LOW',
    scamTypes: [],
    highlightedKeywords: [],
    reasons: ['✅ Please enter text to analyze'],
    recoveryChance: 'N/A',
    detectedPatterns: [],
    text,
    summary: '✅ Message analysis ready'
  };
}

function formatScamType(type) {
  const typeMap = {
    otp: 'OTP SCAM',
    upiBank: 'UPI/BANK FRAUD',
    jobScam: 'JOB SCAM',
    phishing: 'PHISHING',
    lottery: 'LOTTERY SCAM',
    romance: 'ROMANCE SCAM',
    taxRefund: 'TAX REFUND SCAM',
    package: 'PACKAGE DELIVERY SCAM',
    sextortion: 'SEXTORTION SCAM',
    insurance: 'INSURANCE SCAM',
    creditCard: 'CREDIT CARD FRAUD',
    government: 'GOVERNMENT SCAM'
  };
  return typeMap[type] || type.toUpperCase();
}

// Get immediate actions based on scam type
export function getImmediateActions(scamTypes) {
  const actions = {
    'O T P': [
      '🚫 DO NOT share OTP with anyone',
      '🔐 Change your password immediately',
      '📱 Check if unauthorized access occurred',
      '🏦 Contact your bank to confirm transactions',
      '⚠️ Enable 2FA on all critical accounts'
    ],
    'U P I BANK': [
      '📞 Call your bank IMMEDIATELY',
      '❌ Freeze your UPI/debit cards',
      '🏦 Block all online transactions',
      '📋 File FIR within 2 hours for better recovery',
      '⏰ Each minute counts - Act NOW',
      '🔐 Change all banking passwords'
    ],
    'JOB': [
      '⛔ Do NOT pay any fees or deposits',
      '🔍 Verify company on official website',
      '📞 Call company directly (find number yourself)',
      '📝 Save all communications',
      '⚠️ Report to job portal'
    ],
    'PHISHING': [
      '🚫 Do NOT click the link',
      '🔗 Check URL authenticity carefully',
      '✋ Never enter personal details on suspicious sites',
      '⚠️ Close the message immediately',
      '📧 Forward to official organization'
    ],
    'LOTTERY': [
      '😲 Know that legitimate lotteries never ask for fees',
      '⛔ Do NOT send money for claimed prize',
      '📱 Verify lottery details independently',
      '⚠️ These are always scams - ignore completely',
      '🗑️ Delete the message'
    ]
  };

  if (scamTypes.length === 0) {
    return ['✅ Message appears safe. Stay vigilant!'];
  }

  return actions[scamTypes[0].type] || actions['PHISHING'];
}

// Get authority routing
export function getAuthorityRouting(scamTypes) {
  const routing = {
    'U P I BANK': {
      authority: 'Your Bank + NPCI + Cybercrime',
      urgencyText: 'File within 2 hours for maximum recovery chance',
      steps: [
        '1. Call your bank hotline (find number on back of card)',
        '2. File complaint on NPCI Ombudsman portal',
        '3. Report to local police for FIR',
        '4. File complaint on cybercrime.gov.in'
      ]
    },
    'O T P': {
      authority: 'Your Bank + Cybercrime',
      urgencyText: 'Monitor accounts closely for 30 days',
      steps: [
        '1. Contact bank immediately to verify transactions',
        '2. Monitor accounts for unauthorized access',
        '3. File complaint on cybercrime.gov.in',
        '4. Register case with local police'
      ]
    },
    'JOB': {
      authority: 'Job Portal + Cybercrime',
      urgencyText: 'Report to protect others',
      steps: [
        '1. Report fraudulent posting to job portal',
        '2. File complaint on cybercrime.gov.in',
        '3. Block the sender immediately',
        '4. Report to local police for record'
      ]
    },
    'PHISHING': {
      authority: 'Cybercrime + Email Service',
      urgencyText: 'Act quickly if you may have clicked',
      steps: [
        '1. Report phishing email to email provider',
        '2. File complaint on cybercrime.gov.in',
        '3. Report to organization being impersonated',
        '4. Call 1930 (Cybercrime Helpline) if urgent'
      ]
    },
    'LOTTERY': {
      authority: 'Cybercrime (Report Only)',
      urgencyText: 'Do not engage with scammers',
      steps: [
        '1. file complaint on cybercrime.gov.in',
        '2. Block all communications from sender',
        '3. Do not share any personal information',
        '4. Report to local police'
      ]
    }
  };

  if (scamTypes.length === 0) {
    return {
      authority: 'None Required',
      urgencyText: '✅ Stay alert and verify before clicking',
      steps: ['No action required - message appears safe']
    };
  }

  return routing[scamTypes[0].type] || routing['PHISHING'];
}
