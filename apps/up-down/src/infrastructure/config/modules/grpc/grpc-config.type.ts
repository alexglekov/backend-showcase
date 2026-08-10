export interface GrpcConfig {
  grpc: {
    users: {
      package: string;
      url: string;
      protoPath: string;
    }
  };
}
