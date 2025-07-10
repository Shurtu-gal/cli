import { BaseService } from './base.service';
import { GenerationOptions, GenerationResult, ServiceResult } from '@/interfaces';
import AsyncAPIGenerator from '@asyncapi/generator';
import AsyncAPINewGenerator from 'generator-v2';
import path from 'path';
import os from 'os';

export class GenerationService extends BaseService {
  /**
   * Generate files from AsyncAPI document using templates
   */
  async generateFromTemplate(
    asyncapi: string,
    options: GenerationOptions
  ): Promise<ServiceResult<GenerationResult>> {
    try {
      const outputDir = options.output || path.resolve(os.tmpdir(), 'asyncapi-generator');
      
      const generatorOptions = {
        forceWrite: options.forceWrite || false,
        install: options.install || false,
        debug: options.debug || false,
        templateParams: options.parameters || {},
      };

      const generator = new AsyncAPIGenerator(options.template, outputDir, generatorOptions);
      
      await generator.generateFromString(asyncapi, { path: asyncapi });

      const result: GenerationResult = {
        success: true,
        outputPath: outputDir,
        template: options.template
      };

      return this.createSuccessResult<GenerationResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Generate using new generator (v2)
   */
  async generateUsingNewGenerator(
    asyncapi: string,
    options: GenerationOptions
  ): Promise<ServiceResult<GenerationResult>> {
    try {
      const outputDir = options.output || path.resolve(os.tmpdir(), 'asyncapi-generator');
      
      const generatorOptions = {
        forceWrite: options.forceWrite || false,
        install: options.install || false,
        debug: options.debug || false,
        templateParams: options.parameters || {},
      };

      const generator = new AsyncAPINewGenerator(options.template, outputDir, generatorOptions);
      
      await generator.generateFromString(asyncapi, { path: asyncapi });

      const result: GenerationResult = {
        success: true,
        outputPath: outputDir,
        template: options.template
      };

      return this.createSuccessResult<GenerationResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Parse generation parameters from string array
   */
  parseParameters(inputs?: string[]): Record<string, any> {
    if (!inputs) {
      return {};
    }
    
    const params: Record<string, any> = {};
    for (const input of inputs) {
      if (!input.includes('=')) {
        throw new Error(`Invalid param ${input}. It must be in the format of --param name1=value1 name2=value2`);
      }
      const [paramName, paramValue] = input.split(/=(.+)/, 2);
      params[String(paramName)] = paramValue;
    }
    return params;
  }

  /**
   * Parse disable hooks from string array
   */
  parseDisableHooks(inputs?: string[]): Record<string, string> {
    if (!inputs) {
      return {};
    }
    
    const disableHooks: Record<string, string> = {};
    for (const hook of inputs) {
      disableHooks[String(hook)] = 'off';
    }
    return disableHooks;
  }
}
