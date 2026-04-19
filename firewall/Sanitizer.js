export class Sanitizer {
  constructor() {
    this.sensitivePatterns = [
      /jailbreak/gi,
      /developer mode/gi,
      /admin mode/gi,
      /ignore (all|previous|prior)/gi,
      /disregard/gi,
      /override/gi,
      /system prompt/gi,
      /dan\b/gi // the word "dan" on its own
    ];
  }

  sanitize(text) {
    let sanitizedText = text;
    for (const pattern of this.sensitivePatterns) {
      sanitizedText = sanitizedText.replace(pattern, "[REDACTED]");
    }
    return sanitizedText;
  }
}
