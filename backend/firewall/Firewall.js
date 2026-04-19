export class Firewall {
  constructor() {
    this.scanners = [];
  }

  use(scanner) {
    this.scanners.push(scanner);
    return this;
  }

  async scan(text) {
    let totalScore = 0;
    const details = [];

    // Run all scanners sequentially
    for (const scanner of this.scanners) {
      try {
        const result = await scanner.evaluate(text);
        if (result && result.score > 0) {
          totalScore += result.score;
          details.push({
            scanner: scanner.name,
            score: result.score,
            reason: result.reason || "Matched restricted pattern"
          });
        }
      } catch (err) {
        console.error(`[Firewall] Scanner ${scanner.name} failed:`, err);
      }
    }

    let status = "clean";
    if (totalScore >= 75) {
      status = "blocked";
    } else if (totalScore >= 40) {
      status = "suspicious";
    }

    return {
      status,
      score: totalScore,
      details
    };
  }
}
