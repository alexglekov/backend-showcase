import { KafkaConfig } from './kafka-config.type';

export const loadKafkaConfig = (): KafkaConfig => {
  const brokers: string[] = [
    process.env.KAFKA_BROKER_1!,
    process.env.KAFKA_BROKER_2!,
    process.env.KAFKA_BROKER_3!,
  ].filter(Boolean);

  return {
    kafka: {
      brokers,
    },
  };
};
