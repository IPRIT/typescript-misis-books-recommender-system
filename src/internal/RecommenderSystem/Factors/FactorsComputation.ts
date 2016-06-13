import {IRate, RatesFetcher} from "./RatesFetcher";
var Promise = require('es6-promise').Promise;

/**
 * Created by Александр on 12.06.2016.
 */

export class FactorsComputation {

  dataSetUsers = {};
  dataSetItems = {};
  dataSetMatrix = {};
  
  itemsInfo = {};

  debug: boolean = true;

  features: number = 50;
  lambda: number = 0.05;
  eta: number = 0.01;
  mu: number = 0;

  usersBasePredictor = {};
  itemsBasePredictor = {};

  usersFeatureVectors = {};
  itemsFeatureVectors = {};

  iterationNumber: number = 0;
  error: number = 0;
  rmse: number = 1;
  rmseOld: number = 0;
  threshold: number = 0.01;

  startUserFactorValue: number = 0.1;
  startItemFactorValue: number = 0.05;

  static indexPrefix: string = '_index_';

  rates: IRate[] = [];

  initialize() {
    let fetcher = new RatesFetcher();
    return fetcher.initialize()
      .then((rates: Array<IRate>) => {
        this.rates = rates;
        this.createDataSet();
        this.initializeFactors();
      });
  }

  private createDataSet() {
    this.rates.forEach((rate: IRate) => {
      this.setRate(rate);
    });
  }

  private initializeFactors() {
    Object.keys(this.dataSetUsers).forEach(userKey => {
      this.usersBasePredictor[ userKey ] = 0;
      for (var f = 0; f < this.features; f++) {
        if (!this.usersFeatureVectors[ userKey ]) {
          this.usersFeatureVectors[ userKey ] = [];
        }
        this.usersFeatureVectors[ userKey ].push( this.startUserFactorValue );
      }
    });

    Object.keys(this.dataSetItems).forEach(itemKey => {
      this.itemsBasePredictor[ itemKey ] = 0;
      for (var f = 0; f < this.features; f++) {
        if (!this.itemsFeatureVectors[ itemKey ]) {
          this.itemsFeatureVectors[ itemKey ] = [];
        }
        this.itemsFeatureVectors[ itemKey ].push(
          this.startItemFactorValue * f
        );
      }
    });
  }

  private getUserKeyById(userId) {
    return FactorsComputation.indexPrefix + 'user_' + userId;
  }

  private getItemKeyById(itemId) {
    return FactorsComputation.indexPrefix + 'item_' + itemId;
  }

  private addRateForUser(rate: IRate) {
    let userKey = this.getUserKeyById(rate.user_id);
    if (!this.dataSetUsers[ userKey ]) {
      this.dataSetUsers[ userKey ] = [];
    }
    this.dataSetUsers[ userKey ].push(rate);
  }

  private addRateForItem(rate: IRate) {
    let itemKey = this.getItemKeyById(rate.item_id);
    if (!this.dataSetItems[ itemKey ]) {
      this.dataSetItems[ itemKey ] = [];
    }
    this.dataSetItems[ itemKey ].push(rate);
  }

  private getUserRatesVectorById(userId) {
    let userKey = this.getUserKeyById(userId);
    return this.dataSetUsers[ userKey ] || [];
  }

  private getItemRatesVectorById(itemId) {
    let itemKey = this.getItemKeyById(itemId);
    return this.dataSetItems[ itemKey ] || [];
  }

  private setRate(rate: IRate) {
    let userKey = this.getUserKeyById(rate.user_id),
      itemKey = this.getItemKeyById(rate.item_id);
    if (!this.dataSetMatrix[ userKey ]) {
      this.dataSetMatrix[ userKey ] = {};
    }
    if (!this.itemsInfo[ itemKey ]) {
      this.itemsInfo[ itemKey ] = {
        id: rate.item_id,
        category: rate.category
      };
    }
    this.dataSetMatrix[ userKey ][ itemKey ] = rate;
    this.addRateForUser(rate);
    this.addRateForItem(rate);
  }

  learn() {
    let eps = 1e-6;
    return new Promise((resolve, reject) => {
      while (Math.abs(this.rmseOld - this.rmse) > eps || this.iterationNumber < 10000) {
        this.rmseOld = this.rmse;
        this.rmse = 0;

        Object.keys(this.dataSetMatrix).forEach(userKey => {
          Object.keys(this.dataSetMatrix[ userKey ]).forEach(itemKey => {

            let forecastRate = this.computeForecast(userKey, itemKey);
            
            this.error = this.dataSetMatrix[ userKey ][ itemKey ].rate - forecastRate;
            this.rmse += this.error * this.error; // computing root mean square deviation (error)
            this.mu += this.eta * this.error; // reducing error effect

            this.usersBasePredictor[ userKey ] += this.eta * (this.error - this.lambda * this.usersBasePredictor[ userKey ]);
            this.itemsBasePredictor[ itemKey ] += this.eta * (this.error - this.lambda * this.itemsBasePredictor[ itemKey ]);

            for (var f = 0; f < this.features; f++) {
              this.usersFeatureVectors[ userKey ][f] += this.eta * (
                this.error * this.itemsFeatureVectors[ itemKey ][f] - this.lambda * this.usersFeatureVectors[ userKey ][f]
              );
              this.itemsFeatureVectors[ itemKey ][f] += this.eta * (
                this.error * this.usersFeatureVectors[ userKey ][f] - this.lambda * this.itemsFeatureVectors[ itemKey ][f]
              );
            }
          });
        });

        this.rmse = Math.sqrt(this.rmse / this.rates.length);
        if (typeof this.rmse !== 'number') {
          reject(new Error("Rmse value is not finite"));
        }

        if (this.debug) {
          console.log(`[Epoch ${++this.iterationNumber}]: rmse = ${this.rmse.toFixed(8)}.`);
        }
      }
      resolve();
    });
  }

  private computeForecast(userKey: string, itemKey: string) {
    return this.mu + this.usersBasePredictor[ userKey ] + this.itemsBasePredictor[ itemKey ] + this.dotFactors(userKey, itemKey);
  }

  private dotFactors(userKey: string, itemKey: string) {
    return this.usersFeatureVectors[ userKey ].reduce((res, factor, f) => {
      return res + factor * this.itemsFeatureVectors[ itemKey ][f];
    }, 0);
  }
}