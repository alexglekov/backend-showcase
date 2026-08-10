interface GrpcServiceConfig {
  package: string;
  url: string;
  protoPath: string;
}

export interface GrpcConfig {
  grpc: {
    users: GrpcServiceConfig;
    bullsEye: GrpcServiceConfig;
    ledger: GrpcServiceConfig;
    analytics: GrpcServiceConfig;
  };
}
