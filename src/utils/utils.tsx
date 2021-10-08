import {
  UsdDenomination,
  Order,
  OrderData,
  OrderFeedPriceBucket,
  OrderWithTotal,
} from "../types";

export function groupAndTotalOrders(
  orderData: OrderData,
  grouping: UsdDenomination,
  returnReversed: boolean = false,
  returnSize: number = 17
): OrderWithTotal[] {
  const orderDataValues = Object.values(orderData);

  const groupedOrders = orderDataValues.reduce(
    (
      groupedOrders: OrderWithTotal[],
      currentOrder: Order
    ): OrderWithTotal[] => {
      /**
       * the more precise prices for ETH are victim to binary divison,
       * we need to normalize to integers in order to group first, then
       * we can divide by 100 after to get back the price without rounding
       * errors. this assumes prices are at most 2 decimal places.
       */
      const groupingAsInteger = grouping * 100;
      const price = Math.round(currentOrder.price * 100);
      const remainder = price % groupingAsInteger;
      let priceBucket = (price - remainder) / 100;

      //since orderData's properties are sorted ascending due to integer keys, we can build up the new array in order
      if (groupedOrders.length === 0) {
        groupedOrders.push({
          price: priceBucket,
          size: currentOrder.size,
          total: 0,
        });
        return groupedOrders;
      }

      //if the last bucket is for the same price, we can simply add to the size
      //i.e. we just pushed {price: 50}, and currentOrder has {price:50}
      const lastBucket = groupedOrders[groupedOrders.length - 1];
      if (lastBucket.price === priceBucket) {
        lastBucket.size += currentOrder.size;
      } else {
        //we don't need to look for a matching price bucket since orderData is sorted ascending.
        //this is guaranteed to be a new price bucket now, so simply push()
        groupedOrders.push({
          price: priceBucket,
          size: currentOrder.size,
          total: 0,
        });
      }

      return groupedOrders;
    },
    [] as OrderWithTotal[]
  );

  //slice before reversing for a slight performance boost. however a discussion with
  //the product owner would be required to determine what parts of the data should be
  //shown, as the slice/reverse order as well as what end to slice from changes the data shown.
  const slicedGroupedOrders = groupedOrders.slice(0, returnSize);

  if (returnReversed) {
    slicedGroupedOrders.reverse();
  }

  let total = 0;
  slicedGroupedOrders.forEach((order, i) => {
    slicedGroupedOrders[i].total = total += order.size;
  });

  return slicedGroupedOrders;
}

export function applyOrderDataDelta(
  currentOrderData: OrderData,
  orderDataDelta: OrderFeedPriceBucket[]
): OrderData {
  if (!orderDataDelta) {
    return currentOrderData;
  }

  const nextOrdersState = { ...currentOrderData };

  orderDataDelta.forEach((order) => {
    const [price, size] = order;

    /**
     * using Math.round(price * 100) as the key is a trick which gives
     * the benefit of a pseudo insertion sort due to how properties are
     * sorted on objects from ECMAScript 2015 and later. it is insertion
     * order for string keys and symbols, but ascending order for integer keys
     * this code assumes that the price is only 2 decimal places at most
     * otherwise we could get collisions
     */
    const integerKey = Math.round(price * 100);
    if (size === 0) {
      delete nextOrdersState[integerKey];
    } else {
      nextOrdersState[integerKey] = { price, size };
    }
  });

  return nextOrdersState;
}
