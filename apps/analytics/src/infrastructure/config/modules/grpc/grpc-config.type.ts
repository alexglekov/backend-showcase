export interface GrpcConfig {
  grpc: {
    users: {
      package: string;
      url: string;
      protoPath: string;
    };
    server: {
      package: string;
      url: string;
      protoPath: string;
    };
    messenger: {
      package: string;
      url: string;
      protoPath: string;
    },
    ledger: {
      package: string;
      url: string;
      protoPath: string;
    };
    twitter: {
      package: string;
      url: string;
      protoPath: string;
    };
  };
}
