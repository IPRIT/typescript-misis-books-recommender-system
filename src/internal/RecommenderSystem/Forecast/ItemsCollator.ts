import {SecurityGateway} from "../Security/SecurityGateway";
var Promise = require('es6-promise').Promise;

/**
 * Created by Александр on 12.06.2016.
 */

export class ItemsCollator {

  private API_BASE: string = 'http://twosphere.ru/rs-api';
  private API_RATES_URI: string = '/collateItems';

  collateItems(items: number[], category: number, rsToken: string) {
    let apiUrl = this.API_BASE + this.API_RATES_URI;
    return SecurityGateway.getInstance()
      .sendUserRequest(apiUrl, rsToken, {
        items: items.join(','),
        category
      });
  }
}