export interface AsyncAPIServiceOptions {
  source?: string;
  path?: string;
}

export interface ValidationOptions {
  suppressWarnings?: string[];
  suppressAllWarnings?: boolean;
  logDiagnostics?: boolean;
  diagnosticsFormat?: DiagnosticsFormat;
  failSeverity?: SeverityKind;
}

export interface ConversionOptions {
  targetVersion?: string;
  format?: 'json' | 'yaml' | 'yml';
  perspective?: 'client' | 'server';
}

export interface GenerationOptions {
  template: string;
  output: string;
  parameters?: Record<string, any>;
  forceWrite?: boolean;
  install?: boolean;
  debug?: boolean;
}

export interface BundleOptions {
  base?: string;
  baseDir?: string;
  xOrigin?: boolean;
  output?: string;
}

export interface OptimizationOptions {
  optimizations?: string[];
  disableOptimizations?: string[];
  output?: 'terminal' | 'new-file' | 'overwrite';
}

export interface FormatOptions {
  format: 'json' | 'yaml' | 'yml';
  output?: string;
}

export interface DiffOptions {
  format?: 'json' | 'yaml' | 'yml' | 'markdown';
  type?: 'breaking' | 'non-breaking' | 'unclassified' | 'all';
  markdownSubtype?: 'json' | 'yaml' | 'yml';
}

export interface ModelGenerationOptions {
  language: string;
  output?: string;
  packageName?: string;
  namespace?: string;
  [key: string]: any; // For language-specific options
}

export type DiagnosticsFormat = 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';
export type SeverityKind = 'error' | 'warn' | 'info' | 'hint';

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: any[];
}

export interface ParsedDocument {
  document: any;
  diagnostics: any[];
  status: 'valid' | 'invalid';
}

export interface ValidationOptions {
  suppressWarnings?: string[];
  suppressAllWarnings?: boolean;
  logDiagnostics?: boolean;
  diagnosticsFormat?: 'stylish' | 'json' | 'junit' | 'html' | 'text' | 'teamcity' | 'pretty';
  failSeverity?: 'error' | 'warn' | 'info' | 'hint';
  score?: boolean;
  watch?: boolean;
}

export interface ValidationResult {
  status: 'valid' | 'invalid';
  document?: any;
  diagnostics?: any[];
  score?: number;
}

export interface BundleOptions {
  base?: string;
  baseDir?: string;
  xOrigin?: boolean;
  output?: string;
}

export interface BundleResult {
  bundledDocument: any;
  format: 'yaml' | 'json';
}

export interface ConversionResult {
  convertedDocument: string;
  originalFormat: string;
  targetFormat: string;
}

export interface GenerationOptions {
  template: string;
  output: string;
  parameters?: Record<string, any>;
  forceWrite?: boolean;
  install?: boolean;
  debug?: boolean;
  disableHooks?: string[];
  mapBaseUrl?: string;
  registry?: {
    url?: string;
    auth?: string;
    token?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  outputPath: string;
  template: string;
}

export interface DiffOptions {
  format?: 'json' | 'yaml' | 'yml' | 'markdown';
  type?: 'breaking' | 'non-breaking' | 'unclassified' | 'all';
  markdownSubtype?: 'json' | 'yaml' | 'yml';
  overrides?: string;
  noError?: boolean;
  watch?: boolean;
}

export interface DiffResult {
  diff: any;
  format: string;
  hasBreakingChanges: boolean;
}

export interface OptimizationOptions {
  optimizations?: string[];
  disableOptimizations?: string[];
  output?: 'terminal' | 'new-file' | 'overwrite';
  interactive?: boolean;
}

export interface OptimizationResult {
  optimizedDocument: string;
  report: any;
  outputMethod: string;
}

export interface FormatOptions {
  format: 'json' | 'yaml' | 'yml';
  output?: string;
}

export interface FormatResult {
  formattedDocument: string;
  format: string;
}

export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  diagnostics?: any[];
}

export interface ParsedDocument {
  document: any;
  diagnostics: any[];
  status: 'valid' | 'invalid';
}
