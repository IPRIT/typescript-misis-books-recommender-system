import {SecurityGateway} from "./SecurityGateway";
var Promise = require('es6-promise').Promise;

/**
 * Created by Александр on 13.06.2016.
 */

export class TokenChecker {

  private static API_BASE: string = 'http://twosphere.ru/rs-api';
  private static API_RATES_URI: string = '/checkToken';

  static check(rsToken) {
    let apiUrl = TokenChecker.API_BASE + TokenChecker.API_RATES_URI;
    return SecurityGateway.getInstance()
      .sendUserRequest(apiUrl, rsToken);
  }
}