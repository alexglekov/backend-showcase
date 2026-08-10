import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LedgerBalanceEntity, PaymentLedgerService } from '@xyro/libs/ledger';
import { PaymentOrder, PaymentStatus, PaymentTransaction, PaymentType } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { v4 as uuidV4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { PaymentOrderUpdatedDomainEvent } from '@xyro/contracts/users';
import { DomainEventsPublisher } from '@xyro/libs/events';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';
import { Config } from '../../../infrastructure/config';
import {
  CoinsPaidCallbackStatus,
  CoinsPaidCallbackType,
  CoinsPaidCurrencies,
  CoinsPaidCurrencyType,
  CoinsPaidPaymentProvider,
  MappedCoinsPaidCallback,
  depositFees,
  withdrawFees
} from './coins-paid';
import { withdrawNetworkFeeToHoldMap } from './constants';

export enum PaymentSystem {
  CoinsPaid = 'CoinsPaid'
}

type PaymentCurrencies = {
  currency: string;
  rateFrom?: number;
  rateTo?: number;
  withdrawOperation?: {
    minAmount: number;
    feePercent: number;
    platformFee: number;
    exchangeFee: number;
  }
  depositOperation?: {
    minAmount: number;
    feePercent: number;
    platformFee: number;
    exchangeFee: number;
  }
}
type GetPaymentCurrenciesResult = PaymentCurrencies[]

type WithdrawParams = {
  userId: string;
  address: string;
  currency: string;
  amount: number;
}

type DepositParams = {
  userId: string;
  currency: string;
}

type HandleCallbackParams = {
  signature: string;
  body: string;
}

type GetPaymentTransactionsParams = {
  userId: string;
}

type RejectWithdrawOrderParams = {
  blameId: string;
  cancelReason: string;
  orderId: string;
}

type AcceptWithdrawOrderParams = {
  blameId: string;
  orderId: string;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private currenciesMap = new Map<string, PaymentCurrencies>();
  private refreshPaymentCurrenciesSimaphore = false;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly coinsPaid: CoinsPaidPaymentProvider,
    private readonly ledgerService: PaymentLedgerService,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  async onModuleInit() {
    await this.refreshPaymentCurrencies();
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async refreshPaymentCurrencies() {
    if (this.refreshPaymentCurrenciesSimaphore) return;
    this.refreshPaymentCurrenciesSimaphore = true;

    const { platformAsset } = this.configService.get('wallet');
    const { platformFee } = this.configService.get('app');

    
    const depositCurrenciesRates = await this.coinsPaid.currenciesRates({
      currencyTo: platformAsset,
    });
    const withdrawCurrenciesRates = await this.coinsPaid.currenciesRates({
      currencyFrom: platformAsset,
    });

    this.currenciesMap = new Map();

    depositCurrenciesRates
    .filter((depositCurrencyRate) => depositCurrencyRate.fromType === CoinsPaidCurrencyType.crypto)
    .forEach(
      (depositCurrencyRate) => {
        this.currenciesMap.set(depositCurrencyRate.from, {
          currency: depositCurrencyRate.from,
          depositOperation: {
            minAmount: depositCurrencyRate.minAmount,
            feePercent: (depositFees[depositCurrencyRate.from]?.feePercent || 0) / 100,
            exchangeFee: (depositFees[depositCurrencyRate.from]?.exchangeFee || 0) / 100,
            platformFee: platformFee,
          },
          rateFrom: depositCurrencyRate.rate,
        });
      });

  withdrawCurrenciesRates
    .filter((withdrawCurrencyRate) => withdrawCurrencyRate.toType === CoinsPaidCurrencyType.crypto)
    .forEach((withdrawCurrencyRate) => {
      let currency: PaymentCurrencies;

      if (this.currenciesMap.has(withdrawCurrencyRate.to)) {
        currency = this.currenciesMap.get(withdrawCurrencyRate.to)!;
      } else {
        currency = {
          currency: withdrawCurrencyRate.to,
        }
      }

      currency.withdrawOperation = {
        minAmount: withdrawCurrencyRate.minAmount,
        feePercent: (withdrawFees[withdrawCurrencyRate.to]?.feePercent || 0) / 100,
        exchangeFee: (withdrawFees[withdrawCurrencyRate.to]?.exchangeFee || 0) / 100,
        platformFee: platformFee,
      }
      currency.rateTo = withdrawCurrencyRate.rate;

      this.currenciesMap.set(withdrawCurrencyRate.to, currency);
    });

    this.refreshPaymentCurrenciesSimaphore = false;
  }

  async getPaymentTransactions(params: GetPaymentTransactionsParams) {
    const { userId } = params;

    return this.prismaService.paymentTransaction.findMany({
      where: {
        order: {
          ownerId: userId,
        }
      },
      include: {
        order: true,
      }
    })
  }

  async getPaymentOrderById(id: string) {
    const order = await this.prismaService.paymentOrder.findFirst({
      where: {
        id: id,
      },
      include: {
        transaction: true,
      }
    });

    if (!order) {
      throw new BadRequestException(`Order not found with ID ${id}`);
    }

    return order;
  }

  async getPaymentCurrencies(): Promise<GetPaymentCurrenciesResult> {
    return Array.from(this.currenciesMap.values());
  }

  public async withdraw(params: WithdrawParams): Promise<PaymentTransaction & { order: PaymentOrder }> {
    const { dbTransactionTimeout, platformFee } = this.configService.get('app');

    const networkFee = withdrawNetworkFeeToHoldMap[params.currency as CoinsPaidCurrencies];
    const platformFeeAmount = new Decimal(params.amount).mul(platformFee);

    const {
      order,
      paymentTransaction,
      updatedBalance,
    } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const foreignId = uuidV4();

        const paymentTransaction = await dbTransaction.paymentTransaction.create({
          data: {
            address: params.address, // адресс, на которой будет происходить перевод
            foreignId: foreignId,
            currency: params.currency, // Валюта, в которой хочет снять пользователь
            paymentSystem: PaymentSystem.CoinsPaid,
            status: PaymentStatus.PENDING,
            type: PaymentType.WITHDRAW,
            originalAmount: new Decimal(params.amount), // кол-во xyro токенов
            // amount // кол-во он получил по итогу в выбранной валюте
            networkFee,
            platformFee: platformFeeAmount,
          },
        });

        const order = await dbTransaction.paymentOrder.create({
          data: {
            status: PaymentStatus.PENDING,
            type: PaymentType.WITHDRAW,
            ownerId: params.userId,
            transactionId: paymentTransaction.id,
          }
        });

        const updatedBalance = await this.ledgerService.hold(order, paymentTransaction, dbTransaction);

        await this.publishPaymentOrderUpdated(order, paymentTransaction);

        return {
          order,
          paymentTransaction,
          updatedBalance
        }
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    try {
      await this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      );
    } catch (error) {
      this.logger.error(error);
    }

    return { ...paymentTransaction, order };
  }

  public async acceptWithdrawOrder(params: AcceptWithdrawOrderParams): Promise<void> {
    const { blameId, orderId } = params;
    const { platformAsset } = this.configService.get('wallet');
    const { dbTransactionTimeout } = this.configService.get('app');

    const foundTransaction = await this.prismaService.paymentTransaction.findFirstOrThrow({
      where: {
        order: {
          id: orderId,
          status: { in: [PaymentStatus.PENDING] }
        },
      },
    });

    await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        await Promise.all([
          dbTransaction.paymentTransaction.update({
            where: {
              id: foundTransaction.id,
              status: { in: [PaymentStatus.PENDING] }
            },
            data: {
              blameId
            }
          }),
          dbTransaction.paymentOrder.update({
            where: {
              id: orderId,
              status: { in: [PaymentStatus.PENDING] }
            },
            data: {
              blameId,
            }
          }),
        ]);

        await this.coinsPaid.withdrawalCrypto({
          address: foundTransaction.address,
          amount: Number(foundTransaction.originalAmount),
          currency: platformAsset,
          foreignId: foundTransaction.foreignId,
          convertTo: platformAsset !== foundTransaction.currency ? foundTransaction.currency : undefined,
        });
      },
      {
        timeout: dbTransactionTimeout
      }
    )
  }

  public async rejectWithdrawOrder(params: RejectWithdrawOrderParams): Promise<void> {
    const { blameId, orderId, cancelReason } = params;
    const { dbTransactionTimeout } = this.configService.get('app');

    const { updatedBalance, order } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const order = await dbTransaction.paymentOrder.update({
          where: {
            id: orderId,
            status: { in: [PaymentStatus.PENDING] }
          },
          data: {
            blameId,
            status: PaymentStatus.CANCELLED,
            cancelReason,
          },
          include: {
            transaction: true,
          }
        });

        const { transaction } = order;

        const paymentTransaction = await dbTransaction.paymentTransaction.update({
          where: {
            id: transaction.id,
            status: { in: [PaymentStatus.PENDING] }
          },
          data: {
            blameId,
            status: PaymentStatus.CANCELLED
          }
        });

        const updatedBalance = await this.ledgerService.unhold(order, transaction, dbTransaction);

        await this.publishPaymentOrderUpdated(order, paymentTransaction);

        return {
          updatedBalance,
          order,
        };
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    try {
      await this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async deposit(params: DepositParams): Promise<PaymentTransaction & { order: PaymentOrder }> {
    const { dbTransactionTimeout } = this.configService.get('app');
    const { platformAsset } = this.configService.get('wallet');

    const foundTransaction = await this.prismaService.paymentTransaction.findFirst({
      where: {
        order: {
          ownerId: params.userId,
        },
        currency: params.currency,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: true,
      }
    });

    if (foundTransaction) return foundTransaction as PaymentTransaction & { order: PaymentOrder };

    const [createdTransaction] = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const foreignId = uuidV4();

        const depositAddress = await this.coinsPaid.takeDepositAddress({
          currency: params.currency,
          foreignId: foreignId,
          convertTo: platformAsset !== params.currency ? platformAsset : undefined
        });

        const paymentTransaction = await dbTransaction.paymentTransaction.create({
          data: {
            address: depositAddress.address, // адресс на который придут деньги
            foreignId: foreignId,
            currency: params.currency, // валюта в которой он будет депозитить
            paymentSystem: PaymentSystem.CoinsPaid,
            status: PaymentStatus.PENDING,
            type: PaymentType.DEPOSIT,
            // amount // кол-во xyro токенов, сколько пользователь получил
            // originalAmount // кол-во средств, которые задепозитил пользователь
          },
        });

        const order = await dbTransaction.paymentOrder.create({
          data: {
            status: PaymentStatus.PENDING,
            type: PaymentType.DEPOSIT,
            ownerId: params.userId,
            transactionId: paymentTransaction.id,
          }
        });

        await this.publishPaymentOrderUpdated(order, paymentTransaction);

        return [{ ...paymentTransaction, order }];
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    return createdTransaction;
  }

  public async handleCallback(params: HandleCallbackParams) {
    this.logger.log(`Callback from Coins Paid ${params.body}`);

    const isValid = this.coinsPaid.verifySignature(params.signature, params.body);

    if (!isValid) {
      throw new BadRequestException('signature is not valid');
    }

    const payload = this.coinsPaid.parseCallbackBody(params.body);

    if (payload.status === CoinsPaidCallbackStatus.confirmed) return this.onPaymentTransactionConfirmed(payload);
    if (payload.status === CoinsPaidCallbackStatus.notConfirmed) return this.onPaymentTransactionNotConfirmed(payload);
    if (payload.status === CoinsPaidCallbackStatus.cancelled) return this.onPaymentTransactionCancelled(payload);
    
    throw new InternalServerErrorException(`Unexpected transaction callback status: ${payload.status}`);
  }

  private async onPaymentTransactionConfirmed(payload: MappedCoinsPaidCallback) {
    const { dbTransactionTimeout } = this.configService.get('app');

    const foreignId = this.getForeignIdFromTransaction(payload);

    const paymentTransaction = await this.prismaService.paymentTransaction.findUniqueOrThrow({
      where: {
        foreignId,
        status: { in: [PaymentStatus.NOT_CONFIRMED, PaymentStatus.PENDING] },
      },
      include: {
        order: true,
      }
    });
    const { order } = paymentTransaction;

    if (!order) throw new InternalServerErrorException(`UnexpectedError: order with foreignId ${foreignId} not found`);

    const { networkFeeAmount, platformFeeAmount } = this.calculateFeeByTransaction(payload);

    const { amount, originalAmount } = this.getTransactionAmount(payload, platformFeeAmount); 

    const { updatedBalance } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [updatedPaymentTransaction, updatedPaymentOrder] = await Promise.all([
          dbTransaction.paymentTransaction.update({
            where: {
              id: paymentTransaction.id,
            },
            data: {
              amount: amount,
              originalAmount,
              networkFee: networkFeeAmount,
              platformFee: platformFeeAmount,
              confirmations: this.getAmountConfirmationsByTransaction(payload),
              transactionHash: this.getTransactionHash(payload),
              status: PaymentStatus.CONFIRMED,
            }
          }),
          dbTransaction.paymentOrder.update({
            where: {
              id: order?.id!,
            },
            data: {
              status: PaymentStatus.CONFIRMED,
            }
          }),
        ]);

        let updatedBalance: LedgerBalanceEntity;
        if (this.isTransactionDeposit(payload)) {
          updatedBalance = await this.ledgerService.deposit(
            updatedPaymentOrder,
            updatedPaymentTransaction,
            dbTransaction,
          );
        } else {
          updatedBalance = await this.ledgerService.withdraw(
            updatedPaymentOrder,
            paymentTransaction,
            updatedPaymentTransaction,
            dbTransaction,
          );
        }

        await this.publishPaymentOrderUpdated(updatedPaymentOrder, updatedPaymentTransaction);
      
        return {
          updatedBalance
        }
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    try {
      await this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async onPaymentTransactionNotConfirmed(payload: MappedCoinsPaidCallback) {
    const { dbTransactionTimeout } = this.configService.get('app');

    const foreignId = this.getForeignIdFromTransaction(payload);

    const paymentTransaction = await this.prismaService.paymentTransaction.findUniqueOrThrow({
      where: {
        foreignId,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: true,
      }
    });
    const { order } = paymentTransaction;

    if (!order) throw new InternalServerErrorException(`UnexpectedError: order with foreignId ${foreignId} not found`);

    const { originalAmount } = this.getTransactionAmount(payload, new Decimal(0));

    await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [updatedPaymentTransaction, updatedPaymentOrder] = await Promise.all([
          dbTransaction.paymentTransaction.update({
            where: {
              id: paymentTransaction.id,
            },
            data: {
              originalAmount,
              confirmations: this.getAmountConfirmationsByTransaction(payload),
              transactionHash: this.getTransactionHash(payload),
              status: PaymentStatus.NOT_CONFIRMED,
            }
          }),
          dbTransaction.paymentOrder.update({
            where: {
              id: order?.id!,
            },
            data: {
              status: PaymentStatus.NOT_CONFIRMED,
            }
          }),
        ]);

        await this.publishPaymentOrderUpdated(updatedPaymentOrder, updatedPaymentTransaction);
      },
      {
        timeout: dbTransactionTimeout,
      }
    );
  }

  private async onPaymentTransactionCancelled(payload: MappedCoinsPaidCallback) {
    const { dbTransactionTimeout } = this.configService.get('app');

    const foreignId = this.getForeignIdFromTransaction(payload);

    const paymentTransaction = await this.prismaService.paymentTransaction.findUniqueOrThrow({
      where: {
        foreignId,
        status: { in: [PaymentStatus.NOT_CONFIRMED, PaymentStatus.PENDING] },
      },
      include: {
        order: true,
      }
    });
    const { order } = paymentTransaction;

    if (!order) throw new InternalServerErrorException(`UnexpectedError: order with foreignId ${foreignId} not found`);

    const { updatedBalance } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [updatedPaymentTransaction, updatedPaymentOrder] = await Promise.all([
          dbTransaction.paymentTransaction.update({
            where: {
              id: paymentTransaction.id,
            },
            data: {
              transactionHash: this.getTransactionHash(payload),
              status: PaymentStatus.CANCELLED,
              error: payload.error,
            }
          }),
          dbTransaction.paymentOrder.update({
            where: {
              id: order?.id!,
              cancelReason: payload.error,
            },
            data: {
              status: PaymentStatus.CANCELLED,
            }
          }),
        ]);

        const updatedBalance = await this.ledgerService.unhold(order!, paymentTransaction, dbTransaction);

        await this.publishPaymentOrderUpdated(updatedPaymentOrder, updatedPaymentTransaction);

        return { updatedBalance };
      },
      {
        timeout: dbTransactionTimeout,
      }
    );

    try {
      await this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  private convertToPlatformCurrency(currency: CoinsPaidCurrencies, amount: Decimal | number) {
    const { platformAsset } = this.configService.get('wallet');

    if (platformAsset === currency) return new Decimal(amount);

    const currencyRate = this.currenciesMap.get(currency);

    if (!currencyRate) {
      throw new BadRequestException(`Currency ${currency} is not supported`);
    }

    return new Decimal(currencyRate.rateFrom!).mul(amount);
  }

  private convertFromPlatformCurrency(currency: CoinsPaidCurrencies, amount: Decimal | number) {
    const { platformAsset } = this.configService.get('wallet');

    if (platformAsset === currency) return new Decimal(amount);

    const currencyRate = this.currenciesMap.get(currency);

    if (!currencyRate) {
      throw new BadRequestException(`Currency ${currency} is not supported`);
    }

    return new Decimal(currencyRate.rateTo!).mul(amount);
  }

  private getForeignIdFromTransaction(transaction: MappedCoinsPaidCallback): string {
    let foreignId: string;

    if (CoinsPaidCallbackType.deposit === transaction.type || CoinsPaidCallbackType.depositExchange === transaction.type) {
      foreignId = transaction.address.foreignId!;
    } else if (CoinsPaidCallbackType.withdrawal === transaction.type || CoinsPaidCallbackType.withdrawalExchange === transaction.type) {
      foreignId = transaction.foreignId!;
    } else {
      throw new InternalServerErrorException(
        `Unexpected transaction type: ${transaction.type} transactionHashes: [${
          transaction.transactions?.map((transaction) => transaction.txid).join(', ')
        }]`
      );
    }

    return foreignId;
  }

  private getAmountConfirmationsByTransaction(payload: MappedCoinsPaidCallback): number {
    let confirmations = new Decimal(0);

    for (const transaction of payload.transactions) {
      if (transaction.confirmations) confirmations = confirmations.add(new Decimal(transaction.confirmations));
    }

    return confirmations.toNumber();
  }

  private getTransactionHash(payload: MappedCoinsPaidCallback): string | undefined {
    for (const transaction of payload.transactions) {
      if (transaction.txid) return transaction.txid;
    }

    return undefined;
  }

  private calculateFeeByTransaction(transaction: MappedCoinsPaidCallback): { networkFeeAmount: Decimal; platformFeeAmount: Decimal; } {
    const { platformFee } = this.configService.get('app');

    const { currencyReceived, currencySent } = transaction;

    let networkFeeAmount = new Decimal(0);
    let amount;
    
    if (this.isTransactionDeposit(transaction)) {
      amount = this.convertToPlatformCurrency(currencyReceived.currency, currencyReceived.amountMinusFee);
    } else {
      amount = new Decimal(currencyReceived.amount);
    }

    for (const fee of transaction.fees) {
      networkFeeAmount = networkFeeAmount.add(this.convertToPlatformCurrency(fee.currency, fee.amount));
    }

    let platformFeeAmount: Decimal;
    if (this.isTransactionDeposit(transaction)) {
      platformFeeAmount = new Decimal(amount).mul(platformFee);
    } else {
      platformFeeAmount = new Decimal(currencySent.amount).mul(platformFee);
    }

    return {
      networkFeeAmount,
      platformFeeAmount,
    }
  }

  private isTransactionDeposit(payload: MappedCoinsPaidCallback) {
    return payload.type === CoinsPaidCallbackType.deposit || payload.type === CoinsPaidCallbackType.depositExchange;
  }

  private isTransactionWithExchange(payload: MappedCoinsPaidCallback) {
    return payload.type === CoinsPaidCallbackType.depositExchange || payload.type === CoinsPaidCallbackType.withdrawalExchange;
  }

  private getTransactionAmount(transaction: MappedCoinsPaidCallback, platformFeeAmount: Decimal): { amount: Decimal; originalAmount: Decimal; } {
    const { currencyReceived, currencySent } = transaction;

    let originalAmount = new Decimal(currencySent.amount);
    let amount: Decimal;

    if (this.isTransactionDeposit(transaction)) {
      amount = this.convertToPlatformCurrency(currencyReceived.currency, currencyReceived.amountMinusFee);
    } else {
      amount = new Decimal(currencyReceived.amount);
    }

    if (this.isTransactionDeposit(transaction)) {
      amount = amount.minus(platformFeeAmount);
    }

    if (this.isTransactionWithExchange(transaction)) {
      if (this.isTransactionDeposit(transaction)) {
        const exchangeFee = new Decimal(depositFees[currencyReceived.currency]?.exchangeFee || 0).div(100);
        amount = amount.minus(exchangeFee.mul(amount));
      }
    }

    return {
      amount,
      originalAmount,
    }
  }

  private async publishPaymentOrderUpdated(order: PaymentOrder, transaction: PaymentTransaction) {
    await this.domainEventsPublisher.publish(new PaymentOrderUpdatedDomainEvent(order));
  }
}
