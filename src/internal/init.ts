import {SecurityGateway} from "./RecommenderSystem/Security/SecurityGateway";
import {RatesFetcher, IRate} from "./RecommenderSystem/Factors/RatesFetcher";
import {FactorsComputation} from "./RecommenderSystem/Factors/FactorsComputation";
import {FactorsStore} from "./RecommenderSystem/Factors/FactorsStore";

export default function serverInit() {
  let fc = new FactorsComputation();
  fc.initialize()
    .then(() => {
      return fc.learn();
    })
    .then(() => {
      FactorsStore.getInstance()
        .store({
          mu: fc.mu,
          usersBasePredictor: fc.usersBasePredictor,
          itemsBasePredictor: fc.itemsBasePredictor,
          usersFeatureVectors: fc.usersFeatureVectors,
          itemsFeatureVectors: fc.itemsFeatureVectors,
          items: fc.itemsInfo
        });
      console.log('Recommender model is ready for forecasting');
    })
    .catch(err => {
      throw err;
    });
}