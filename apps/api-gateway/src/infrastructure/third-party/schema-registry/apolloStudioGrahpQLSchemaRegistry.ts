import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { LoggerService } from '@xyro/libs/logger';

import { Config } from '../../config';
import { SchemaRegistryService } from './schemaRegistry.service-port';

const APOLLO_SCHEMA_REGISTRY = 'https://graphql.api.apollographql.com/api/graphql'

@Injectable()
export class ApolloStudioGrahpQLSchemaRegistry extends SchemaRegistryService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    super();

    this.logger.setContext(SchemaRegistryService.name);
  }

  public async fetchSchema() {
    const { apolloStudio } = this.configService.get('schemaRegistry');

    try {
      const { data } = await lastValueFrom(
        this.httpService.post(
          APOLLO_SCHEMA_REGISTRY,
          JSON.stringify({
            query: `
              query GetGraphVariant($graphId: ID!, $variantName: String!) {
                graph(id: $graphId) {
                  variant(name: $variantName) {
                    id
                    url
                    latestPublication {
                      schema {
                        document
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              graphId: apolloStudio.graphId,
              variantName: apolloStudio.variantName,
            },
            operationName: "GetGraphVariant",
          }),
          {
            headers: {
              "content-type": "application/json",
              "x-api-key": apolloStudio.apiKey,
            },
          }
        )
      );

      return data.data.graph.variant.latestPublication.schema.document;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      throw error;
    }
  }

  public async publishSchema(schema: string): Promise<void> {
    const { apolloStudio } = this.configService.get('schemaRegistry');

    try {
      await lastValueFrom(
        this.httpService.post(
          APOLLO_SCHEMA_REGISTRY,
          JSON.stringify({
            query: `
              mutation PublishSubgraphSchema($graphId: ID!, $variantName: String!, $subgraphName: String!, $schemaDocument: PartialSchemaInput!, $url: String, $revision: String!) {
                graph(id: $graphId) {
                  publishSubgraph(graphVariant: $variantName, activePartialSchema: $schemaDocument, name: $subgraphName, url: $url, revision: $revision) { 
                    launchUrl
                    updatedGateway
                    wasCreated
                  }
                }
              }
            `,
            variables: {
              graphId: apolloStudio.graphId,
              variantName: apolloStudio.variantName,
              subgraphName: apolloStudio.subgraphName,
              schemaDocument: {
                sdl: schema,
              },
              revision: apolloStudio.revision,
            },
            operationName: "PublishSubgraphSchema",
          }),
          {
            headers: {
              "content-type": "application/json",
              "x-api-key": apolloStudio.apiKey,
            },
          }
        )
      );

      this.logger.log('🔄🔄🔄 Schema was published!');
    } catch (error) {
      this.logger.error(error.message, error.stack);

      throw error;
    }
  }
}
