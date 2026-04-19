export class RegexScanner {
  constructor() {
    this.name = "RegexScanner";
    
    this.weakPatterns = [
      /jailbreak/i,
      /developer mode/i,
      /admin mode/i,
      /ignore (all|previous|prior)/i,
      /disregard/i,
      /override/i,
      /system prompt/i,
      /instructions/i
    ];

    this.strongSignals = [
      "ignore previous",
      "reveal system prompt",
      "act as developer",
      "jailbreak",
      "dan"
    ];
  }

  async evaluate(text) {
    let score = 0;
    const lowerText = text.toLowerCase();

    // 40 points per matched weak pattern
    for (const p of this.weakPatterns) {
      if (p.test(text)) score += 40;
    }

    // 100 points for any exact strong signal match
    if (this.strongSignals.some(s => lowerText.includes(s))) {
      score += 100;
    }

    return {
      score,
      reason: score > 0 ? "Matched regex security patterns" : null
    };
  }
}
