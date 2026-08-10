export interface MailerConfig {
  mailer: {
    sourceEmail: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;

    emailTemplates: {
      recoveryPassword: string;
    },
  };
}
