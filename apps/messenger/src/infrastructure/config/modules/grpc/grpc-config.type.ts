export interface GrpcConfig {
  grpc: {
    ledger: {
      package: string;
      url: string;
      protoPath: string;
    };
    server: {
      package: string;
      url: string;
      protoPath: string;
    }
  };
}
