export interface GrpcConfig {
  grpc: {
    server: {
      package: string;
      url: string;
      protoPath: string;
    }
    twitter: {
      package: string;
      url: string;
      protoPath: string;
    }
  };
}
