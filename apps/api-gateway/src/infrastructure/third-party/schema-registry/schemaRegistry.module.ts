import { Global, Module } from '@nestjs/common';
import { SchemaRegistryService } from './schemaRegistry.service-port';
import { ApolloStudioGrahpQLSchemaRegistry } from './apolloStudioGrahpQLSchemaRegistry';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule
  ],
  providers: [
    {
      provide: SchemaRegistryService,
      useClass: ApolloStudioGrahpQLSchemaRegistry,
    }
  ],
  exports: [
    SchemaRegistryService,
  ],
})
@Global()
export class SchemaRegistryModule {}
