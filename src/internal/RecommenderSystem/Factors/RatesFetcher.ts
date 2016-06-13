import {SecurityGateway} from "../Security/SecurityGateway";
var async = require('async');
var Promise = require('es6-promise').Promise;

/**
 * Created by Александр on 12.06.2016.
 */

export interface IRate {
  user_id: number,
  item_id: number,
  category: number,
  rate: number,
  timestamp: number
}

export interface ISystemMetaInfo {
  users: number,
  items: number,
  rates: number
}

export class RatesFetcher {

  private API_BASE: string = 'http://twosphere.ru/rs-api';
  private API_RATES_URI: string = '/getRates';

  private maxRatingsPerRequest: number = 5000;

  public metaInfo: ISystemMetaInfo;
  public rates: Array<IRate> = [];

  private getSystemMetaInfo() {
    let apiUrl = this.API_BASE;
    return SecurityGateway.getInstance()
      .sendSystemRequest(apiUrl)
      .then(response => {
        return response.result;
      })
      .catch(function (err) {
        console.error('[Fetching system meta info] Error:', err);
      });
  }
  
  private getAllRates() {
    return new Promise((resolve, reject) => {
      let ratingsNumber = this.metaInfo.rates;
      let breakdownNumber = Math.ceil(ratingsNumber / this.maxRatingsPerRequest);
      let breakdownRange = [];
      for (let i = 0; i < breakdownNumber; ++i) {
        breakdownRange.push(i * this.maxRatingsPerRequest);
      }
      let gotItems: IRate[] = [];
      let apiUrl = this.API_BASE + this.API_RATES_URI;

      var queue = async.queue((offset, callback) => {
        SecurityGateway.getInstance().sendSystemRequest(apiUrl, {
          offset,
          count: this.maxRatingsPerRequest
        }).then(resp => resp.result.items)
          .then((items: Array<IRate>) => {
            gotItems.push(...items);
            console.log(`Got items: ${items.length}`);
            callback();
          });
      }, 3);

      queue.drain = () => {
        resolve(gotItems);
      };

      queue.push(breakdownRange, err => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  initialize() {
    return this.getSystemMetaInfo()
      .then((metaInfo: ISystemMetaInfo) => {
        this.metaInfo = metaInfo;
        return this.getAllRates();
      })
      .then((rates: Array<IRate>) => {
        this.rates = rates;
        console.log(`Total got rates: ${rates.length}`);
        return rates;
      })
      .catch(err => {
        console.log('[Unknown error]:', err);
      });
  }
}