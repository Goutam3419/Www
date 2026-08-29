export class SafetyLayer {
  private sensitivePatterns = [
    /AI_STUDIO_API_KEY\s*=\s*['"]?[a-zA-Z0-9_-]+['"]?/gi,
    /GEMINI_API_KEY\s*=\s*['"]?[a-zA-Z0-9_-]+['"]?/gi,
    /bearer\s+[a-zA-Z0-9._-]{20,}/gi,
    /sk-[a-zA-Z0-9]{20,}/gi
  ];

  public sanitizeText(text: string): string {
    let sanitized = text;
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED_SECRET]');
    }
    return sanitized;
  }

  public validateInputPrompt(prompt: string): { safe: boolean; reason?: string } {
    if (prompt.toLowerCase().includes('ignore previous instructions') && prompt.toLowerCase().includes('reveal system prompt')) {
      return { safe: false, reason: 'System prompt extraction attempt detected.' };
    }
    return { safe: true };
  }
}

export const safetyLayer = new SafetyLayer();
