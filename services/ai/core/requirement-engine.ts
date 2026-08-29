export interface ExtractedRequirement {
  goal: string;
  features: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  missingInfo: string[];
  confidenceScore: number;
}

export class RequirementEngine {
  public extractRequirements(prompt: string, intent: string): ExtractedRequirement {
    const features: string[] = [];
    const missingInfo: string[] = [];

    if (prompt.length < 10 && intent !== 'Greeting') {
      missingInfo.push('Detailed specification or goal description');
    }

    if (prompt.toLowerCase().includes('database') || prompt.toLowerCase().includes('store')) {
      features.push('Database Persistence Layer');
    }
    if (prompt.toLowerCase().includes('ui') || prompt.toLowerCase().includes('interface') || prompt.toLowerCase().includes('theme')) {
      features.push('User Interface Customization');
    }
    if (prompt.toLowerCase().includes('api') || prompt.toLowerCase().includes('endpoint')) {
      features.push('RESTful API Route');
    }

    return {
      goal: prompt,
      features,
      priority: prompt.toLowerCase().includes('urgent') || prompt.toLowerCase().includes('critical') ? 'CRITICAL' : 'MEDIUM',
      missingInfo,
      confidenceScore: missingInfo.length === 0 ? 0.95 : 0.70
    };
  }
}

export const requirementEngine = new RequirementEngine();
