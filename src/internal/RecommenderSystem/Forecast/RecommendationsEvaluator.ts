import {FactorsStore} from "../Factors/FactorsStore";
import {FactorsComputation} from "../Factors/FactorsComputation";
import {ItemsCollator} from "./ItemsCollator";
import {CacheStore} from "./CacheStore";
var Promise = require('es6-promise').Promise;

/**
 * Created by Александр on 12.06.2016.
 */

export interface IQueryParams {
  count: number,
  offset: number,
  category: number
}

export interface IPrediction {
  item_id: number,
  forecastRate: number
}
  
export class RecommendationsEvaluator {

  store: FactorsStore;

  constructor(public rsToken: string) {
    this.store = FactorsStore.getInstance();
  }

  getRecommendations(userId: number, queryParams: IQueryParams = {count: 10, offset: 0, category: 1}) {
    return new Promise((resolve, reject) => {
      if (!this.store.isReady) {
        return reject(new Error('Recommender model is not ready'));
      } else if (!this.store.userExists( this.getUserKeyById(userId) )) {
        return reject(new Error('Recommender model does not contain this user'));
      }

      let cacheStore = CacheStore.getInstance();
      let forecastCollection;
      if (cacheStore.areItemsExists(userId, queryParams)) {
        forecastCollection = cacheStore.getItems(userId, queryParams);
      } else {
        forecastCollection = this.computeForecastCollection(userId, queryParams.category);
        cacheStore.storeItems(userId, queryParams, forecastCollection);
      }

      let itemsId = forecastCollection.map(item => item.item_id)
        .slice(queryParams.offset, queryParams.offset + queryParams.count);

      let collator = new ItemsCollator();
      collator.collateItems(itemsId, queryParams.category, this.rsToken)
        .then(result => {
          if (result.items) {
            result.items = result.items.map((item, index) => {
              item.forecastRate = forecastCollection[index].forecastRate;
              return item;
            });
          }
          result.all_items_count = forecastCollection.length;
          resolve(result);
        })
        .catch(err => reject(err));
    });
  }

  private computeForecastCollection(userId: number, category: number = 1): Array<IPrediction> {
    let state = this.store.state;
    let itemsKeyList = Object.keys(state.itemsFeatureVectors)
      .filter(itemKey => {
        return category === 1 || state.items[ itemKey ].category === category;
      });
    let userKey = this.getUserKeyById(userId);
    let forecastCollection = itemsKeyList.map(itemKey => {
      let forecastRate = this.computeForecast(userKey, itemKey);
      let curCategory = state.items[ itemKey ].category;
      if (category === 1 && curCategory > 2) {
        forecastRate *= 0.8;
      }
      return {
        item_id: state.items[ itemKey ].id,
        forecastRate
      }
    });
    forecastCollection.sort((a, b) => b.forecastRate - a.forecastRate);
    return forecastCollection;
  }

  private computeForecast(userKey: string, itemKey: string) {
    let state = this.store.state;
    return state.mu + state.usersBasePredictor[ userKey ] + state.itemsBasePredictor[ itemKey ] + this.dotFactors(userKey, itemKey);
  }

  private dotFactors(userKey: string, itemKey: string) {
    let state = this.store.state;
    return state.usersFeatureVectors[ userKey ].reduce((res, factor, f) => {
      return res + factor * state.itemsFeatureVectors[ itemKey ][f];
    }, 0);
  }

  private getUserKeyById(userId) {
    return FactorsComputation.indexPrefix + 'user_' + userId;
  }

  private getItemKeyById(itemId) {
    return FactorsComputation.indexPrefix + 'item_' + itemId;
  }
}