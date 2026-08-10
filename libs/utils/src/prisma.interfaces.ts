import { Prisma, PrismaClient,  } from '@prisma/client'
import * as runtime from '@prisma/client/runtime/library';

export type PrismaTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, runtime.DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
