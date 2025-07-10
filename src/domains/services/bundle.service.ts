import { BaseService } from './base.service';
import { BundleOptions, BundleResult, ServiceResult } from '@/interfaces';
import bundle from '@asyncapi/bundler';
import { promises } from 'fs';
import path from 'path';

const { writeFile } = promises;

export class BundleService extends BaseService {
  /**
   * Bundle one or multiple AsyncAPI Documents and their references together
   */
  async bundleDocuments(
    asyncAPIFiles: string[],
    options: BundleOptions = {}
  ): Promise<ServiceResult<BundleResult>> {
    try {
      const document = await bundle(asyncAPIFiles, {
        base: options.base,
        baseDir: options.baseDir,
        xOrigin: options.xOrigin,
      });

      const result: BundleResult = {
        bundledDocument: document,
        format: 'yaml' // Default format
      };

      return this.createSuccessResult<BundleResult>(result);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Save bundled document to file
   */
  async saveBundledDocument(
    bundledDocument: any,
    outputPath: string,
    format: 'yaml' | 'json' = 'yaml'
  ): Promise<ServiceResult<string>> {
    try {
      const resolvedPath = path.resolve(process.cwd(), outputPath);
      const extension = path.extname(outputPath);
      
      let content: string;
      
      if (extension === '.json' || format === 'json') {
        content = bundledDocument.string() || '';
      } else {
        content = bundledDocument.yml() || '';
      }

      await writeFile(resolvedPath, content, { encoding: 'utf-8' });
      
      return this.createSuccessResult(resolvedPath);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  /**
   * Get bundled document as string
   */
  getBundledDocumentAsString(
    bundledDocument: any,
    format: 'yaml' | 'json' = 'yaml'
  ): string {
    if (format === 'json') {
      return JSON.stringify(bundledDocument.json());
    }
    return bundledDocument.yml();
  }
}
