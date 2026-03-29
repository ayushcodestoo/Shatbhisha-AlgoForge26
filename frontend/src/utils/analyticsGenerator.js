/**
 * Dynamic Analytics Data Generator
 * Generates realistic fraud statistics based on current date
 * No hardcoded future data - all data reflects current month only
 */

/**
 * Get all months up to current month dynamically
 * Returns array like: ['January', 'February', 'March', ...]
 */
export function getMonthsUpToCurrent() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  
  return months.slice(0, currentMonth + 1);
}

/**
 * Get month abbreviations up to current month
 * Returns array like: ['Jan', 'Feb', 'Mar', ...]
 */
export function getMonthAbbreviationsUpToCurrent() {
  const abbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  const currentMonth = now.getMonth();
  
  return abbrev.slice(0, currentMonth + 1);
}

/**
 * Generate realistic monthly fraud trend data
 * Uses growth rate (10-15%) with slight variations for realism
 */
export function generateMonthlyTrendData() {
  const now = new Date();
  const currentMonth = now.getMonth();
  
  const months = getMonthAbbreviationsUpToCurrent();
  const data = [];
  
  // Base cases for January
  let baseCases = 8500;
  
  // Minimum growth rate: 10%, Maximum: 15%, Plus random variation
  const minGrowth = 0.10;
  const maxGrowth = 0.15;
  
  months.forEach((month, index) => {
    if (index === 0) {
      // January - base value
      data.push({
        month: month,
        cases: baseCases,
        recovered: Math.round(baseCases * 0.04) // ~4% recovered cases
      });
    } else {
      // Apply growth rate with variation
      const growthRate = minGrowth + (Math.random() * (maxGrowth - minGrowth));
      const variation = 1 + ((Math.random() - 0.5) * 0.05); // ±2.5% variation
      
      baseCases = Math.round(baseCases * (1 + growthRate) * variation);
      data.push({
        month: month,
        cases: baseCases,
        recovered: Math.round(baseCases * 0.04)
      });
    }
  });
  
  return data;
}

/**
 * Generate fraud distribution based on typical patterns
 * Distribution stays consistent but total cases reflect current reality
 */
export function generateFraudDistribution(totalCases) {
  if (!totalCases) {
    // Use current month's cases as reference
    const monthlyData = generateMonthlyTrendData();
    const lastMonth = monthlyData[monthlyData.length - 1];
    totalCases = lastMonth.cases;
  }
  
  const distribution = [
    { type: 'UPI/Bank Fraud', percentage: 35 },
    { type: 'OTP Scams', percentage: 28 },
    { type: 'Job Fraud', percentage: 18 },
    { type: 'Phishing', percentage: 12 },
    { type: 'Others', percentage: 7 }
  ];
  
  return distribution.map(item => ({
    type: item.type,
    percentage: item.percentage,
    count: Math.round((item.percentage / 100) * totalCases)
  }));
}

/**
 * Generate channel data based on typical patterns
 * Channels stay proportional but total reflects current cases
 */
export function generateChannelData(totalCases) {
  if (!totalCases) {
    const monthlyData = generateMonthlyTrendData();
    const lastMonth = monthlyData[monthlyData.length - 1];
    totalCases = lastMonth.cases;
  }
  
  // Scale from base of ~110K cases to current total
  const baseTotal = 110000; // Typical aggregate
  const scaleFactor = totalCases / 1500; // Monthly average
  
  const channels = [
    { channel: 'WhatsApp', percentage: 38 },
    { channel: 'SMS', percentage: 32 },
    { channel: 'Calls', percentage: 20 },
    { channel: 'Email', percentage: 10 }
  ];
  
  return channels.map(ch => ({
    channel: ch.channel,
    percentage: ch.percentage,
    cases: Math.round((ch.percentage / 100) * baseTotal * scaleFactor)
  }));
}

/**
 * Get current date formatted as "Month Year"
 * Example: "March 2026"
 */
export function getCurrentPeriodLabel() {
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  
  return `${monthName} ${year}`;
}

/**
 * Get last updated timestamp formatted
 * Example: "3:45 PM on March 28, 2026"
 */
export function getLastUpdatedLabel() {
  const now = new Date();
  
  const time = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  const date = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `Updated ${time} on ${date}`;
}

/**
 * Get short "as of" label
 * Example: "As of March 2026"
 */
export function getAsOfLabel() {
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  
  return `As of ${monthName} ${year}`;
}

/**
 * Get month range label for charts
 * Example: "Jan - Mar 2026"
 */
export function getMonthRangeLabel() {
  const abbrev = getMonthAbbreviationsUpToCurrent();
  const now = new Date();
  const year = now.getFullYear();
  
  if (abbrev.length === 1) {
    return `${abbrev[0]} ${year}`;
  }
  
  return `${abbrev[0]} - ${abbrev[abbrev.length - 1]} ${year}`;
}

/**
 * Calculate total frauds so far this year
 */
export function getTotalFraudsThisYear() {
  const monthlyData = generateMonthlyTrendData();
  return monthlyData.reduce((sum, month) => sum + month.cases, 0);
}

/**
 * Calculate average frauds per month so far
 */
export function getAverageFraudsPerMonth() {
  const total = getTotalFraudsThisYear();
  const monthlyData = generateMonthlyTrendData();
  return Math.round(total / monthlyData.length);
}
