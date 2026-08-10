export interface GrpcConfig {
  grpc: {
    server: {
      package: string;
      url: string;
      protoPath: string;
    }
  };
}
