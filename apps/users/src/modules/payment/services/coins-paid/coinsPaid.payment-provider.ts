import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { createHmac } from 'crypto';
import { lastValueFrom } from 'rxjs';

import { Config } from '../../../../infrastructure/config';
import { CoinsPaidCallback, CoinsPaidCurrency, CoinsPaidDepositAddress, CoinsPaidRate, CoinsPaidResponse, CoinsPaidWitdrawalCrypto, MappedCoinsPaidCallback } from './coinsPaid.interfaces';

interface TakeDepositAddressParams {
  currency: string;
  foreignId: string;
  convertTo?: string;
}

interface WithdrawalCryptoParams {
  currency: string;
  foreignId: string;
  amount: number;
  address: string;
  convertTo?: string;
  tag?: string;
}

interface GetCurrenciesRatesParams {
  currencyFrom?: string;
  currencyTo?: string;
}

@Injectable()
export class CoinsPaidPaymentProvider {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly httpService: HttpService,
  ) {}

  async currenciesList() {
    const url = '/currencies/list';
    const options = {
      visible: true,
    };

    const { data: response } = await this.queryCoinsPaid<CoinsPaidResponse<CoinsPaidCurrency[]>>(url, options);

    return response.data.map(
      (coin) => ({
        id: coin.id,
        type: coin.type,
        currency: coin.currency,
        minimumAmount: Number(coin.minimum_amount),
        depositFee: Number(coin.deposit_fee_percent),
        withdrawalFee: Number(coin.withdrawal_fee_percent),
        precision: Number(coin.precision),
      })
    );
  }

  async currenciesRates(params: GetCurrenciesRatesParams) {
    const url = '/currencies/rates';
    const body = {
      currency_from: params.currencyFrom,
      currency_to: params.currencyTo,
    };

    const { data: response } = await this.queryCoinsPaid<CoinsPaidResponse<CoinsPaidRate[]>>(url, body);

    const result = response.data.map((coin) => {
      return {
        from: coin.currency_from.currency,
        fromType: coin.currency_from.type,
        to: coin.currency_to.currency,
        toType: coin.currency_to.type,
        minAmount: Number(coin.currency_from?.min_amount_deposit_with_exchange || coin.currency_from.min_amount),
        rate: Number(coin.rate_to),
      };
    });

    return result;
  }

  async takeDepositAddress(params: TakeDepositAddressParams) {
    const url = '/addresses/take';
    const options = {
      foreign_id: params.foreignId,
      currency: params.currency,
      convert_to: params.convertTo,
    };

    const { data: response } = await this.queryCoinsPaid<CoinsPaidResponse<CoinsPaidDepositAddress>>(url, options);

    return {
      id: response.data.id,
      currency: response.data.currency,
      convert_to: response.data.convert_to,
      address: response.data.address,
      tag: response.data.tag,
      foreign_id: response.data.foreign_id,
    };
  }

  async withdrawalCrypto(params: WithdrawalCryptoParams) {
    const url = '/withdrawal/crypto';
    const options = {
      foreign_id: params.foreignId,
      amount: String(params.amount),
      currency: params.currency,
      convert_to: params.convertTo,
      address: params.address,
      tag: params.tag,
    };

    const { data: response } = await this.queryCoinsPaid<CoinsPaidResponse<CoinsPaidWitdrawalCrypto>>(url, options);

    return {
      id: response.data.id,
      foreignId: response.data.foreign_id,
      type: response.data.type,
      status: response.data.status,
      amount: Number(response.data.amount),
      senderAmount: Number(response.data.sender_amount),
      senderCurrency: response.data.sender_currency,
      receiverAmount: Number(response.data.receiver_amount),
      receiverCurrency: response.data.receiver_currency,
    };
  }

  public parseCallbackBody(body: string): MappedCoinsPaidCallback {
    const obj: CoinsPaidCallback = JSON.parse(body);
  
    return {
      id: Number(obj.id),
      foreignId: obj.foreign_id,
      type: obj.type,
      address: {
        id: obj.crypto_address.id,
        currency: obj.crypto_address.currency,
        address: obj.crypto_address.address,
        tag: obj.crypto_address.tag,
        foreignId: obj.crypto_address.foreign_id,
        convertTo: obj.crypto_address.convert_to,
      },
      currencySent: {
        currency: obj.currency_sent.currency,
        amount: Number(obj.currency_sent.amount),
      },
      currencyReceived: {
        currency: obj.currency_received.currency,
        amount: Number(obj.currency_received.amount),
        amountMinusFee: Number(obj.currency_received.amount_minus_fee),
      },
      transactions: obj.transactions.map((transaction) => ({
        id: Number(transaction.id),
        currency: transaction.currency,
        transactionType: transaction.transaction_type,
        type: transaction.type,
        address: transaction.address,
        tag: transaction.tag,
        amount: Number(transaction.amount),
        txid: transaction.txid,
        confirmations: transaction.confirmations ? Number(transaction.confirmations) : undefined,
        currencyTo: transaction.currency_to,
        amountTo: Number(transaction.amount_to),
      })),
      fees: obj.fees.map((fee) => ({
        type: fee.type,
        currency: fee.currency,
        amount: Number(fee.amount),
      })),
      error: obj.error,
      status: obj.status,
    }
  }

  public verifySignature(signature: string, payload: string) {
    const { coinsPaidSecretKey } = this.configService.get('wallet')

    const hmac = createHmac('sha512', coinsPaidSecretKey);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    return signature === calculatedSignature;
  }

  private queryCoinsPaid<T>(relativeUrl: string, payload: any) {
    const { coinsPaidKey, coinsPaidSecretKey } = this.configService.get('wallet')

    const hmac = createHmac('sha512', coinsPaidSecretKey);

    const payloadStringify = JSON.stringify(payload);
    const sig = hmac.update(payloadStringify);

    const headers = {
      'X-Processing-Key': coinsPaidKey,
      'X-Processing-Signature': sig.digest('hex'),
    };

    return lastValueFrom(this.httpService.post<T>(relativeUrl, payload, {
      headers,
    }));
  }

}