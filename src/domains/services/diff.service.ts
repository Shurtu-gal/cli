import { BaseService } from './base.service';
import { DiffOptions, DiffResult, ServiceResult } from '@/interfaces';
import * as diff from '@asyncapi/diff';

export class DiffService extends BaseService {
  /**
   * Compare two AsyncAPI documents and generate diff
   */
  async compareDocuments(
    oldDoc: any,
    newDoc: any,
    options: DiffOptions = {}
  ): Promise<ServiceResult<DiffResult>> {
    try {
      const diffResult = await diff.diff(oldDoc, newDoc);

      const hasBreakingChanges = this.hasBreakingChanges(diffResult);

      const result: DiffResult = {
        diff: diffResult,
        format: options.format || 'json',
        hasBreakingChanges
      };

      return this.createSuccessResult<DiffResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Format diff result for output
   */
  formatDiffResult(diffResult: any, format = 'json'): string {
    switch (format) {
    case 'yaml':
    case 'yml':
      // Convert to YAML format
      return this.convertToYaml(diffResult);
    case 'markdown':
      // Convert to markdown format
      return this.convertToMarkdown(diffResult);
    case 'json':
    default:
      return JSON.stringify(diffResult, null, 2);
    }
  }

  /**
   * Check if diff contains breaking changes
   */
  private hasBreakingChanges(diffResult: any): boolean {
    // This is a simplified check - actual implementation would be more sophisticated
    return diffResult && diffResult.breaking && diffResult.breaking.length > 0;
  }

  /**
   * Convert diff result to YAML format
   */
  private convertToYaml(diffResult: any): string {
    // Simple YAML conversion - in real implementation would use js-yaml
    return JSON.stringify(diffResult, null, 2);
  }

  /**
   * Convert diff result to Markdown format
   */
  private convertToMarkdown(diffResult: any): string {
    // Simple markdown conversion - actual implementation would format as proper markdown
    let markdown = '# AsyncAPI Diff Report\n\n';
    
    if (diffResult.breaking && diffResult.breaking.length > 0) {
      markdown += '## Breaking Changes\n\n';
      for (const change of diffResult.breaking) {
        markdown += `- ${change.description || change.type}\n`;
      }
      markdown += '\n';
    }

    if (diffResult.nonBreaking && diffResult.nonBreaking.length > 0) {
      markdown += '## Non-Breaking Changes\n\n';
      for (const change of diffResult.nonBreaking) {
        markdown += `- ${change.description || change.type}\n`;
      }
      markdown += '\n';
    }

    return markdown;
  }
}
