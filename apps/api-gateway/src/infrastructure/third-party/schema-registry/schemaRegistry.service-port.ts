export abstract class SchemaRegistryService {
  public abstract publishSchema(schema: string): Promise<void>;
  public abstract fetchSchema(): Promise<string>;
}
