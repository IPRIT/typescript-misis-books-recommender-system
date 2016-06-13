import {IQueryParams, IPrediction} from "./RecommendationsEvaluator";

/**
 * Created by Александр on 13.06.2016.
 */

export class CacheStore {

  private static instance: CacheStore = null;

  public static getInstance(): CacheStore {
    if (CacheStore.instance && CacheStore.instance instanceof CacheStore) {
      return CacheStore.instance;
    }
    return (CacheStore.instance = new CacheStore());
  }

  private static prefixKey = '_index_';

  cacheStorage: Object = {};

  public storeItems(userId: number, queryParams: IQueryParams, items: Array<IPrediction>) {
    let userKey = this.getUserKeyById(userId);
    let categoryKey = this.getCategoryKeyById(queryParams.category);
    if (!this.cacheStorage[ userKey ]) {
      this.cacheStorage[ userKey ] = {};
    }
    if (!this.cacheStorage[ userKey ][ categoryKey ]) {
      this.cacheStorage[ userKey ][ categoryKey ] = [];
    }
    this.cacheStorage[ userKey ][ categoryKey ] = items;
    this.logStats('Items saved');
  }

  public getItems(userId: number, queryParams: IQueryParams): Array<IPrediction> {
    if (!this.areItemsExists(userId, queryParams)) {
      return [];
    }
    let userKey = this.getUserKeyById(userId);
    let categoryKey = this.getCategoryKeyById(queryParams.category);
    this.logStats('Items taken');
    return this.cacheStorage[ userKey ][ categoryKey ];
  }
  
  public areItemsExists(userId: number, queryParams: IQueryParams) {
    let userKey = this.getUserKeyById(userId);
    let categoryKey = this.getCategoryKeyById(queryParams.category);
    return !!this.cacheStorage[ userKey ] 
      && !!this.cacheStorage[ userKey ][ categoryKey ];
  }

  public reset() {
    this.logStats('Items before reset');
    this.cacheStorage = {};
    this.logStats('Items after reset');
  }

  private getUserKeyById(userId) {
    return CacheStore.prefixKey + 'user_' + userId;
  }

  private getCategoryKeyById(category) {
    return CacheStore.prefixKey + 'category_' + category;
  }

  private logStats(messageName: string = '') {
    let cellsNumber = 0,
      itemsNumber = 0,
      usersNumber = 0;
    Object.keys(this.cacheStorage)
      .forEach(userKey => {
        usersNumber++;
        Object.keys(this.cacheStorage[userKey])
          .forEach(categoryKey => {
            itemsNumber += this.cacheStorage[ userKey ][ categoryKey ].length;
            cellsNumber++;
          })
      });
    let logPrefix = 'Cache storage';
    if (messageName) {
      messageName = `[${logPrefix}] [${messageName}]`;
    } else {
      messageName = `[${logPrefix}]`;
    }
    console.log(messageName, `Items in cache store: ${itemsNumber}. Cache indexes number: ${cellsNumber}. Users: ${usersNumber}.`);
  }
}