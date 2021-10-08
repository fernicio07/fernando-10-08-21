import {
  OrderFeedState,
  OrderFeedAction,
  OrderFeedActionType,
} from "../../types";

export function OrderFeedReducer(
  state: OrderFeedState,
  action: OrderFeedAction
): OrderFeedState {
  switch (action.type) {
    case OrderFeedActionType.ApplyDelta: {
      return {
        ...state,
        bids: action.payload.bids,
        asks: action.payload.asks,
      };
    }
    case OrderFeedActionType.ChangeSubscription: {
      return {
        ...state,
        productFeedSubscription: action.payload.subscription,
      };
    }
    default: {
      return state;
    }
  }
}
