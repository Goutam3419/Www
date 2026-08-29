import { ToolDefinition, DangerClassificationResult, ToolDangerLevel } from '@/packages/types/src';

export class DangerClassifierService {
  /**
   * Classifies tool execution danger level into Safe, Medium, High, or Critical
   * based on tool metadata, categories, actions, and inputs.
   */
  public classify(
    tool: ToolDefinition,
    inputs: Record<string, unknown> = {}
  ): DangerClassificationResult {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check declared danger level
    if (tool.dangerLevel === 'Critical') {
      riskScore += 80;
      riskFactors.push('Tool marked with Critical danger level.');
    } else if (tool.dangerLevel === 'High') {
      riskScore += 50;
      riskFactors.push('Tool marked with High danger level.');
    } else if (tool.dangerLevel === 'Medium' || tool.dangerLevel === 'Moderate') {
      riskScore += 30;
      riskFactors.push('Tool marked with Medium/Moderate danger level.');
    }

    // Category risk check
    if (tool.category === 'System' || tool.category === 'Network') {
      riskScore += 20;
      riskFactors.push(`Category '${tool.category}' carries elevated system risk.`);
    }

    // Permissions risk check
    const perms = tool.requiredPermissions || [];
    if (perms.some(p => p.includes('delete') || p.includes('destroy') || p.includes('admin') || p.includes('system'))) {
      riskScore += 30;
      riskFactors.push('Tool requires high-privilege destructive permissions.');
    }

    // Inputs risk check
    const inputString = JSON.stringify(inputs).toLowerCase();
    if (inputString.includes('sudo') || inputString.includes('rm -rf') || inputString.includes('drop database')) {
      riskScore += 60;
      riskFactors.push('Input parameters contain potentially dangerous commands or patterns.');
    }

    let finalDangerLevel: ToolDangerLevel = 'Safe';
    if (riskScore >= 70) {
      finalDangerLevel = 'Critical';
    } else if (riskScore >= 45) {
      finalDangerLevel = 'High';
    } else if (riskScore >= 25) {
      finalDangerLevel = 'Medium';
    } else {
      finalDangerLevel = 'Safe';
    }

    const requiresApproval = finalDangerLevel === 'High' || finalDangerLevel === 'Critical' || Boolean(tool.requiresApproval || tool.approvalRequired);

    return {
      dangerLevel: finalDangerLevel,
      riskScore,
      riskFactors,
      requiresApproval
    };
  }
}

export const dangerClassifierService = new DangerClassifierService();
