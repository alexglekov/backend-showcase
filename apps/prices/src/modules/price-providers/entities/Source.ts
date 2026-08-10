export enum SourceType {
  trade = 'trade',
  book = 'book',
  ticker = 'ticker',
}
export enum Market {
  binance = 'binance',
  huobi = 'huobi',
  kraken = 'kraken',
  okx = 'okx',
  bybit = 'bybit',
  kucoin = 'kucoin',
  bitget = 'bitget',
}

export class Source {
  constructor(public market: Market, public type: SourceType) {}

  static fromId(id: string) {
    const [market, type] = id.split('-');
    return new Source(market as Market, type as SourceType);
  }

  get id() {
    return `${this.market}-${this.type}`;
  }
}
