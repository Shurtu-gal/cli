import { ValidationService, ParserService } from '../index';
import { load } from '@models/SpecificationFile';

/**
 * Example service that demonstrates how to refactor the validate command
 * to use the extracted validation and parser services
 */
export class ValidateCommandService {
  private validationService: ValidationService;
  private parserService: ParserService;

  constructor() {
    this.validationService = new ValidationService();
    this.parserService = new ParserService();
  }

  /**
   * Main validation function that replaces the validate command logic
   */
  async validateFile(
    filePath: string | undefined,
    options: {
      proxyHost?: string;
      proxyPort?: string;
      score?: boolean;
      watch?: boolean;
      suppressWarnings?: string[];
      suppressAllWarnings?: boolean;
      logDiagnostics?: boolean;
      diagnosticsFormat?: 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';
      failSeverity?: 'error' | 'warn' | 'info' | 'hint';
      output?: string;
    } = {}
  ) {
    try {
      // Handle proxy URL construction
      let processedFilePath = filePath;
      if (options.proxyHost && options.proxyPort) {
        const proxyUrl = `http://${options.proxyHost}:${options.proxyPort}`;
        processedFilePath = `${filePath}+${proxyUrl}`;
      }

      // Load the specification file
      const specFile = await load(processedFilePath);

      // Calculate score if requested
      let score: number | undefined;
      if (options.score) {
        const parseResult = await this.parserService.parseFromSpecFile(specFile);
        if (parseResult.success && parseResult.data?.document) {
          score = this.validationService.calculateDocumentScore(parseResult.data.document);
        }
      }

      // Prepare validation options
      const validationOptions = {
        suppressWarnings: options.suppressWarnings,
        suppressAllWarnings: options.suppressAllWarnings,
        logDiagnostics: options.logDiagnostics,
        diagnosticsFormat: options.diagnosticsFormat,
        failSeverity: options.failSeverity,
      };

      // Perform validation
      const validationResult = await this.validationService.validateDocument(specFile, validationOptions);

      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error,
          exitCode: 1
        };
      }

      // Format and output diagnostics if needed
      let diagnosticsOutput: string | undefined;
      if (validationResult.data?.diagnostics && validationResult.data.diagnostics.length > 0) {
        diagnosticsOutput = this.validationService.formatDiagnosticsOutput(
          validationResult.data.diagnostics,
          options.diagnosticsFormat || 'stylish',
          options.failSeverity || 'error'
        );

        // Save to file if output path specified
        if (options.output) {
          const saveResult = await this.validationService.saveDiagnosticsToFile(
            options.output,
            options.diagnosticsFormat || 'stylish',
            diagnosticsOutput
          );
          if (!saveResult.success) {
            return {
              success: false,
              error: saveResult.error,
              exitCode: 1
            };
          }
        }
      }

      // Generate governance message
      const sourceString = specFile.toSourceString();
      const hasIssues = validationResult.data?.diagnostics && validationResult.data.diagnostics.length > 0;
      const isFailSeverity = validationResult.data?.status === 'invalid';
      
      const governanceMessage = this.validationService.generateGovernanceMessage(
        sourceString,
        !!hasIssues,
        !!isFailSeverity
      );

      return {
        success: true,
        data: {
          status: validationResult.data?.status,
          score,
          diagnostics: validationResult.data?.diagnostics,
          diagnosticsOutput,
          governanceMessage,
          specFile
        },
        exitCode: validationResult.data?.status === 'invalid' ? 1 : 0
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1
      };
    }
  }

  /**
   * Watch mode functionality (simplified for demonstration)
   */
  async watchFile(filePath: string, options: any) {
    // Implementation would use file watchers to re-validate on changes
    // This is a placeholder for the watch functionality
    console.log(`Watching ${filePath} for changes...`);
    
    // For now, just validate once
    return this.validateFile(filePath, options);
  }
}
