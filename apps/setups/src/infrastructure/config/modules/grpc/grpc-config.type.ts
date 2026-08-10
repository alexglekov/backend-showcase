export interface GrpcConfig {
  grpc: {
    prices: {
      package: string;
      url: string;
      protoPath: string;
    };
    users: {
      package: string;
      url: string;
      protoPath: string;
    };
  };
}
