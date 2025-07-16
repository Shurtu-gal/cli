import { Parser } from '@asyncapi/parser';
import { Request } from 'express';
import { AvroSchemaParser } from '@asyncapi/avro-schema-parser';
import { OpenAPISchemaParser } from '@asyncapi/openapi-schema-parser';
import { RamlDTSchemaParser } from '@asyncapi/raml-dt-schema-parser';
import { ProtoBuffSchemaParser } from '@asyncapi/protobuf-schema-parser';

import { ProblemException } from '../../adapters/api/exceptions/problem.exception';

const parser = new Parser();

parser.registerSchemaParser(OpenAPISchemaParser());
parser.registerSchemaParser(RamlDTSchemaParser());
parser.registerSchemaParser(AvroSchemaParser());
parser.registerSchemaParser(ProtoBuffSchemaParser());

function prepareParserConfig(req?: Request) {
  if (!req) {
    return {
      resolve: {
        file: false,
      },
    };
  }

  return {
    resolve: {
      file: false,
      http: {
        headers: {
          Cookie: req.header('Cookie'),
        },
        withCredentials: true,
      },
    },
    path:
      req.header('x-asyncapi-base-url') ||
      req.header('referer') ||
      req.header('origin'),
  };
}

const TYPES_400 = [
  'null-or-falsey-document',
  'impossible-to-convert-to-json',
  'invalid-document-type',
  'invalid-json',
  'invalid-yaml',
];

/**
 * Some error types have to be treated as 400 HTTP Status Code, another as 422.
 */
function retrieveStatusCode(type: string): number {
  if (TYPES_400.includes(type)) {
    return 400;
  }
  return 422;
}

/**
 * Merges fields from ParserError to ProblemException.
 */
function mergeParserError(error: ProblemException, parserError: any): ProblemException {
  if (parserError.detail) {
    error.set('detail', parserError.detail);
  }
  if (parserError.validationErrors) {
    error.set('validationErrors', parserError.validationErrors);
  }
  if (parserError.parsedJSON) {
    error.set('parsedJSON', parserError.parsedJSON);
  }
  if (parserError.location) {
    error.set('location', parserError.location);
  }
  if (parserError.refs) {
    error.set('refs', parserError.refs);
  }
  return error;
}

function tryConvertToProblemException(err: any) {
  let error = err;
  if (error instanceof ParserError) {
    const typeName = err.type.replace(
      'https://github.com/asyncapi/parser-js/',
      ''
    );
    error = new ProblemException({
      type: typeName,
      title: err.title,
      status: retrieveStatusCode(typeName),
    });
    mergeParserError(error, err);
  }

  return error;
}

const parse = parser.parse;

export {
  prepareParserConfig,
  parse,
  mergeParserError,
  retrieveStatusCode,
  tryConvertToProblemException,
};
