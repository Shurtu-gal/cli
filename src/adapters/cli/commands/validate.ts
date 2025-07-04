import { Args } from '@oclif/core';
import Command from '@cli/internal/base';
import { validate, ValidateOptions, ValidationStatus, parse } from '@cli/internal/parser';
import { load } from '@models/SpecificationFile';
import { specWatcher } from '@cli/internal/globals';
import { validateFlags } from '@cli/internal/flags/validate.flags';
import { proxyFlags } from '@cli/internal/flags/proxy.flags';
import { calculateScore } from '@cli/internal/utils/scoreCalculator';

export default class Validate extends Command {
  static description = 'validate asyncapi file';

  static flags = {
    ...validateFlags(),
    ...proxyFlags(), // Merge proxyFlags with validateFlags
  };

  static args = {
    'spec-file': Args.string({ description: 'spec path, url, or context-name', required: false }),
  };

  async run() {
    const { args, flags } = await this.parse(Validate); //NOSONAR
    let filePath = args['spec-file'];
    const proxyHost = flags['proxyHost'];
    const proxyPort = flags['proxyPort'];

    if (proxyHost && proxyPort) {
      const proxyUrl = `http://${proxyHost}:${proxyPort}`;
      filePath = `${filePath}+${proxyUrl}`; // Update filePath with proxyUrl
    }

    this.specFile = await load(filePath);
    const watchMode = flags.watch;

    if (flags['score']) {
      const { document } = await parse(this, this.specFile);
      this.log(`The score of the asyncapi document is ${await calculateScore(document)}`);
    }

    if (watchMode) {
      specWatcher({ spec: this.specFile, handler: this, handlerName: 'validate' });
    }

    // Prepare validate options
    const validateOptions: ValidateOptions = {
      ...flags,
      suppressWarnings: flags['suppressWarnings'],
      suppressAllWarnings: flags['suppressAllWarnings'],
    };

    const result = await validate(this, this.specFile, validateOptions);
    this.metricsMetadata.validation_result = result;

    if (result === ValidationStatus.INVALID) {
      process.exitCode = 1;
    }
  }
}
