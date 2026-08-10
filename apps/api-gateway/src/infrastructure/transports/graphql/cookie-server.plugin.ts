import { ApolloServerPlugin } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';

import { Config } from '../../config';

import { CookieServerListener } from './cookie-server.listener';
import { ServerContext } from './interfaces';

@Plugin()
export class CookieServerPlugin implements ApolloServerPlugin<ServerContext> {
  constructor(private readonly configService: ConfigService<Config>) {}

  async requestDidStart() {
    const { domains } = this.configService.get('app');

    return new CookieServerListener(domains);
  }
}
