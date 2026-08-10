import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class HtmlGeneratorService {
  constructor() {}

  generateHtmlByTempalte(template: string, context: any) {
    const compiler = Handlebars.compile(template);
    return compiler(context);
  }
}