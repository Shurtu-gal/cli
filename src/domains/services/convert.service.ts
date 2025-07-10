import { BaseService } from './base.service';
import { ConversionOptions, ConversionResult, ServiceResult } from '@/interfaces';
import { convert, convertOpenAPI, convertPostman } from '@asyncapi/converter';
import type { AsyncAPIConvertVersion, OpenAPIConvertVersion } from '@asyncapi/converter';
import { promises as fs } from 'fs';

export class ConversionService extends BaseService {
  /**
   * Convert AsyncAPI documents to newer versions or convert OpenAPI/Postman to AsyncAPI
   */
  async convertDocument(
    specFileContent: string,
    specJson: any,
    options: ConversionOptions = {}
  ): Promise<ServiceResult<ConversionResult>> {
    try {
      let convertedFile: any;
      const isOpenAPI = options.format === 'openapi';
      const isAsyncAPI = options.format === 'asyncapi';
      
      if (isOpenAPI) {
        convertedFile = convertOpenAPI(specFileContent, specJson.openapi as OpenAPIConvertVersion, {
          perspective: options.perspective as 'client' | 'server'
        });
      } else if (isAsyncAPI) {
        convertedFile = convert(specFileContent, options.targetVersion as AsyncAPIConvertVersion);
      } else {
        // Assume Postman collection
        convertedFile = convertPostman(specFileContent, '3.0.0', {
          perspective: options.perspective as 'client' | 'server'
        });
      }

      const formattedFile = this.formatConvertedFile(convertedFile);

      const result: ConversionResult = {
        convertedDocument: formattedFile,
        originalFormat: options.format || 'asyncapi',
        targetFormat: options.targetVersion || '3.0.0'
      };

      return this.createSuccessResult<ConversionResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Format the converted file for output
   */
  private formatConvertedFile(convertedFile: any): string {
    return typeof convertedFile === 'object' 
      ? JSON.stringify(convertedFile, null, 4) 
      : convertedFile;
  }

  /**
   * Save converted document to file
   */
  async saveConvertedDocument(
    convertedDocument: string,
    outputPath: string
  ): Promise<ServiceResult<string>> {
    try {
      await fs.writeFile(outputPath, convertedDocument, { encoding: 'utf8' });
      return this.createSuccessResult(outputPath);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

// import YAML from 'js-yaml';

// import { AsyncAPIDocument, LAST_SPEC_VERSION, SpecsEnum } from '../interfaces';
// import { ProblemException } from '../exceptions/problem.exception';

// import type { ConvertVersion } from '@asyncapi/converter';

// /**
//  * Service providing `@asyncapi/converter` functionality.
//  */
// export class ConvertService {
//   /**
//    * Convert the given spec to the desired version and format.
//    * @param spec AsyncAPI spec
//    * @param language Language to convert to, YAML or JSON
//    * @param version AsyncAPI spec version
//    * @returns converted spec
//    */
//   public async convert(
//     spec: string | AsyncAPIDocument,
//     version: SpecsEnum = LAST_SPEC_VERSION as SpecsEnum,
//     language?: 'json' | 'yaml' | 'yml'
//   ): Promise<string> {
//     if (version === 'latest') {
//       version = LAST_SPEC_VERSION as SpecsEnum;
//     }

//     try {
//       const asyncapiSpec =
//         typeof spec === 'object' ? JSON.stringify(spec) : spec;
//       const convertedSpec = convert(asyncapiSpec, version as ConvertVersion);

//       if (!language) {
//         return convertedSpec;
//       }
//       return this.convertToFormat(convertedSpec, language);
//     } catch (err) {
//       if (err instanceof ProblemException) {
//         throw err;
//       }

//       throw new ProblemException({
//         type: 'internal-converter-error',
//         title: 'Could not convert document',
//         status: 422,
//         detail: (err as Error).message,
//       });
//     }
//   }

//   private convertToFormat(
//     spec: string | Record<string, unknown>,
//     language: 'json' | 'yaml' | 'yml'
//   ) {
//     if (typeof spec === 'object') {
//       spec = JSON.stringify(spec, undefined, 2);
//     }

//     try {
//       if (language === 'json') {
//         return this.convertToJSON(spec);
//       }
//       return this.convertToYaml(spec);
//     } catch (err) {
//       throw new ProblemException({
//         type: 'converter-output-format',
//         title: `Could not transform output to ${language}`,
//         status: 422,
//         detail: (err as Error).message,
//       });
//     }
//   }

//   private convertToJSON(spec: string) {
//     // JSON or YAML String -> JS object
//     const jsonContent = YAML.load(spec);
//     // JS Object -> pretty JSON string
//     return JSON.stringify(jsonContent, undefined, 2);
//   }

//   private convertToYaml(spec: string) {
//     // Editor content -> JS object -> YAML string
//     const jsonContent = YAML.load(spec);
//     return YAML.dump(jsonContent);
//   }
// }
