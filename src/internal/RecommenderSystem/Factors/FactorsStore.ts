import {type} from "os";
/**
 * Created by Александр on 12.06.2016.
 */
  
export interface SvdModelState {
  mu: number,
  usersBasePredictor: Object,
  itemsBasePredictor: Object,
  usersFeatureVectors: Object,
  itemsFeatureVectors: Object,
  items: Object
}

export class FactorsStore {

  private static instance: FactorsStore = null;

  public static getInstance(): FactorsStore {
    if (FactorsStore.instance && FactorsStore.instance instanceof FactorsStore) {
      return FactorsStore.instance;
    }
    return (FactorsStore.instance = new FactorsStore());
  }
  
  private modelState: SvdModelState = null;

  public store(modelState: SvdModelState) {
    this.modelState = modelState;
    //todo: save/restore snapshot in persistent storage
    //this.snapshot()
  }

  public get state(): SvdModelState {
    return this.modelState;
  }
  
  public get isReady() {
    return this.modelState != null;
  }
  
  public userExists(userKey) {
    return !!this.modelState.usersFeatureVectors[ userKey ];
  }
}