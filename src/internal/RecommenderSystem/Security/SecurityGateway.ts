import {CONFIG} from "./Config";
/**
 * Created by Александр on 12.06.2016.
 */

var request = require('request-promise');

export class SecurityGateway {

  private static instance: SecurityGateway = null;

  public static getInstance(): SecurityGateway {
    if (SecurityGateway.instance && SecurityGateway.instance instanceof SecurityGateway) {
      return SecurityGateway.instance;
    }
    return (SecurityGateway.instance = new SecurityGateway());
  }

  public sendUserRequest(uri: string, token: string, params: any = {}) {
    params.rs_token = token;
    params.token = CONFIG.GATEWAY_TOKEN;
    var options = {
      uri: uri,
      qs: params,
      json: true // Automatically parses the JSON string in the response
    };
    return request(options);
  }

  public sendSystemRequest(uri: string, params: any = {}) {
    params.token = CONFIG.GATEWAY_TOKEN;
    var options = {
      uri: uri,
      qs: params,
      json: true // Automatically parses the JSON string in the response
    };
    return request(options);
  }
}