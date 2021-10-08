export type OrderFeedState = {
  bids: OrderData;
  asks: OrderData;
  productFeedSubscription: Product;
};

export type OrderFeedMessage = {
  bids: OrderFeedPriceBucket[];
  asks: OrderFeedPriceBucket[];
  feed: OrderFeedType;
};

export type OrderFeedAction =
  | {
      type: OrderFeedActionType.ApplyDelta;
      payload: {
        bids: OrderData;
        asks: OrderData;
      };
    }
  | {
      type: OrderFeedActionType.ChangeSubscription;
      payload: {
        subscription: Product;
      };
    };

export type OrderFeedPriceBucket = [price: number, size: number];

export type OrderData = { [key: number]: Order };

export interface OrderWithTotal extends Order {
  total: number;
}

export interface Order {
  price: number;
  size: number;
}

export enum OrderFeedEvent {
  Subscribe = "subscribe",
  Unsubscribe = "unsubscribe",
}

export enum OrderFeedType {
  Delta = "book_ui_1",
  Snapshot = "book_ui_1_snapshot",
}

//https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export enum Product {
  XBTUSD = "PI_XBTUSD",
  ETHUSD = "PI_ETHUSD",
}

export enum OrderFeedActionType {
  ApplyDelta = "ApplyDelta",
  ChangeSubscription = "ChangeSubscription",
}

export enum UsdDenomination {
  FiveCents = 0.05,
  TenCents = 0.1,
  TwentyFiveCents = 0.25,
  FiftyCents = 0.5,
  OneDollar = 1.0,
  TwoPointFiveDollars = 2.5,
}
