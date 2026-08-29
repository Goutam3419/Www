import { toolRegistryService } from './tool-registry';
import { ToolCategory } from '@/packages/types/src';

export interface CapabilityFilter {
  provider?: string;
  category?: ToolCategory | string;
  searchQuery?: string;
  userPermissions?: string[];
  workspaceId?: string;
}

export interface ToolCapabilityInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  capabilityName: string;
  dangerLevel: string;
}

export class CapabilityDiscoveryService {
  public listCapabilities(filter: CapabilityFilter = {}): ToolCapabilityInfo[] {
    const tools = toolRegistryService.getAllTools();
    let capabilities: ToolCapabilityInfo[] = [];

    for (const tool of tools) {
      if (filter.userPermissions && filter.userPermissions.length > 0) {
        const hasPermission = tool.requiredPermissions.some(p => filter.userPermissions?.includes(p));
        if (!hasPermission) continue;
      }

      const caps = tool.capabilities && tool.capabilities.length > 0
        ? tool.capabilities
        : [`${tool.provider}.${tool.name.toLowerCase().replace(/\s+/g, '_')}`];

      for (const cap of caps) {
        capabilities.push({
          id: `${tool.id}_${cap}`,
          name: tool.name,
          description: tool.description,
          provider: tool.provider,
          category: tool.category,
          capabilityName: cap,
          dangerLevel: tool.dangerLevel as string
        });
      }
    }

    if (filter.provider) {
      capabilities = capabilities.filter(c => c.provider.toLowerCase() === filter.provider?.toLowerCase());
    }
    if (filter.category) {
      capabilities = capabilities.filter(c => c.category.toLowerCase() === filter.category?.toLowerCase());
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      capabilities = capabilities.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.capabilityName.toLowerCase().includes(q)
      );
    }

    return capabilities;
  }

  public getFirebaseCapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return this.listCapabilities({
      provider: 'firebase',
      userPermissions
    });
  }

  public getGoogleCapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return this.listCapabilities({
      provider: 'google',
      userPermissions
    });
  }

  public getAnthropicCapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return this.listCapabilities({
      provider: 'anthropic',
      userPermissions
    });
  }

  public getOpenAICapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return this.listCapabilities({
      provider: 'openai',
      userPermissions
    });
  }

  public getOpenRouterCapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return this.listCapabilities({
      provider: 'openrouter',
      userPermissions
    });
  }

  public getAICapabilities(userPermissions?: string[]): ToolCapabilityInfo[] {
    return [
      ...this.getAnthropicCapabilities(userPermissions),
      ...this.getOpenAICapabilities(userPermissions),
      ...this.getOpenRouterCapabilities(userPermissions)
    ];
  }
}

export const capabilityDiscoveryService = new CapabilityDiscoveryService();
