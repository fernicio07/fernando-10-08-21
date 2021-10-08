import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  OrderFeedActionType,
  OrderFeedMessage,
  OrderFeedType,
  WebSocketReadyState,
  Product,
  OrderFeedState,
  OrderFeedEvent,
  OrderData,
} from "../types";
import { useErrorHandler } from "react-error-boundary";
import { OrderFeedReducer } from "../components/orderFeed/OrderFeedReducer";
import { applyOrderDataDelta } from "../utils/utils";

const initialState: OrderFeedState = {
  bids: {},
  asks: {},
  productFeedSubscription: Product.XBTUSD,
};

type BufferData = {
  bids: OrderData;
  asks: OrderData;
};

/**
 * connects to a (currently hardcoded) WebSocket server. Upon established connection,
 * sends a (currently hardcoded) subscription message with a paramaterized product_id.
 *
 * incoming snapshot messages are dispatched immediately, but incoming delta messages
 * are reduced & stored into a ref buffer. the buffer is dispatched every (currently hardcoded)
 * 250ms.
 *
 * if the productFeedSubscription falls out of sync with the local state, useOrderFeed will
 * unsubscribe from the subscription in the local state, and subscribe to the product feed
 * from productFeedSubscription, and then dispatch an action to sync up the local state.
 *
 * closes the websocket connection when calling component is unmounted.
 *
 * @param productFeedSubscription desired product feed to subscribe to
 * @param forceErrorFlag contrived flag that forces an Error to be thrown when set
 * @returns
 */
export function useOrderFeed({
  productFeedSubscription = Product.XBTUSD,
  forceErrorFlag = false,
}: UseOrderFeedProps = {}): OrderFeedState {
  const [state, dispatch] = useReducer(OrderFeedReducer, {
    ...initialState,
    productFeedSubscription,
  });
  const webSocket = useRef<WebSocket | null>(null);
  const bufferedData = useRef<BufferData>({ bids: {}, asks: {} });
  const handleError = useErrorHandler();

  /**
   * this function is called on every incoming websocket message.
   * snapshots are dispatched right away. deltas are calculated and
   * stored in a ref buffer until a setInterval dispatches them
   * every so often. this is to keep the render load steady despite
   * the frequency of the incoming websocket messages
   */
  const onMessage = useCallback(
    (messageEvent: MessageEvent) => {
      const response = JSON.parse(messageEvent?.data) as OrderFeedMessage;
      switch (response?.feed) {
        case OrderFeedType.Delta:
          bufferedData.current.bids = applyOrderDataDelta(
            bufferedData.current.bids,
            response.bids
          );
          bufferedData.current.asks = applyOrderDataDelta(
            bufferedData.current.asks,
            response.asks
          );
          break;
        case OrderFeedType.Snapshot:
          bufferedData.current.bids = applyOrderDataDelta({}, response.bids);
          bufferedData.current.asks = applyOrderDataDelta({}, response.asks);
          dispatch({
            type: OrderFeedActionType.ApplyDelta,
            payload: {
              bids: bufferedData.current.bids,
              asks: bufferedData.current.asks,
            },
          });
          break;
      }
    },
    [dispatch]
  );

  /**
   * this useEffect simply dispatches the current buffered data
   * every 250ms. it also has a cleanup callback function to
   * clear the interval as well as ensure the websocket is closed
   * when the calling component unmounts.
   */
  useEffect(() => {
    const bufferInterval = setInterval(() => {
      dispatch({
        type: OrderFeedActionType.ApplyDelta,
        payload: {
          asks: bufferedData.current.asks,
          bids: bufferedData.current.bids,
        },
      });
    }, 250);

    return () => {
      clearInterval(bufferInterval);
      webSocket?.current?.close();
    };
  }, []);

  /**
   * handleError() is required here because Error Boundaries do not catch errors for
   * event handlers by default, so a simple `throw` won't work.
   * https://reactjs.org/docs/error-boundaries.html#introducing-error-boundaries
   */
  const onError = useCallback(
    (ev: Event) => {
      handleError(
        new Error(`WebSocket threw an error. Please reset the feed.`)
      );
    },
    [handleError]
  );

  const onOpen = useCallback(() => {
    subscribeToProductOrderFeed(state.productFeedSubscription);
  }, [state.productFeedSubscription]);

  /**
   * this useEffect is responsible for opening the websocket connection
   * when the calling component mounts.
   *
   * it also serves as the spot where the contrived forced error throws
   * the error.
   */
  useEffect(() => {
    if (forceErrorFlag) {
      throw new Error(
        "An error was forced from within the WebSocket handling code."
      );
    }

    if (
      !webSocket.current ||
      webSocket.current.readyState === WebSocketReadyState.CLOSING ||
      webSocket.current.readyState === WebSocketReadyState.CLOSED
    ) {
      webSocket.current = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
      webSocket.current.onopen = onOpen;
      webSocket.current.onmessage = onMessage;
      webSocket.current.onerror = onError;
    }
  }, [forceErrorFlag, onError, onMessage, onOpen]);

  /**
   * this useEffect is responsible for changing subscriptions. if the
   * productFeedSubscription parameter from the calling component falls
   * out of sync with this hook's state.productFeedSubscription, this useEffect
   * will unsubscribe to the feed in state.productFeedSubscription, and then
   * subscribe to the feed in productFeedSubscription. it will then dispatch to
   * sync back up.
   */
  useEffect(() => {
    if (
      webSocket.current &&
      webSocket.current.readyState === WebSocketReadyState.OPEN &&
      productFeedSubscription !== state.productFeedSubscription
    ) {
      unsubscribeFromProductOrderFeed(state.productFeedSubscription);
      subscribeToProductOrderFeed(productFeedSubscription);
      dispatch({
        type: OrderFeedActionType.ChangeSubscription,
        payload: {
          subscription: productFeedSubscription,
        },
      });
    }
  }, [productFeedSubscription, state.productFeedSubscription]);

  function subscribeToProductOrderFeed(subscription: Product) {
    webSocket?.current?.send(
      JSON.stringify({
        event: OrderFeedEvent.Subscribe,
        feed: OrderFeedType.Delta,
        product_ids: [subscription],
      })
    );
  }

  function unsubscribeFromProductOrderFeed(subscription: Product) {
    webSocket?.current?.send(
      JSON.stringify({
        event: OrderFeedEvent.Unsubscribe,
        feed: OrderFeedType.Delta,
        product_ids: [subscription],
      })
    );
  }

  return {
    ...state,
  };
}

export type UseOrderFeedProps = {
  productFeedSubscription?: Product;
  forceErrorFlag?: boolean;
};
