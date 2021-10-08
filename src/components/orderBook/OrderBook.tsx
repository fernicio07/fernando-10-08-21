import React, { useCallback, useState } from "react";
import { Product, UsdDenomination } from "../../types";
import styles from "./OrderBook.module.css";
import { OrderFeed } from "../orderFeed/OrderFeed";

function getDefaultGroupingForProduct(product: Product): UsdDenomination {
  switch (product) {
    case "PI_XBTUSD":
      return UsdDenomination.FiftyCents;
    case "PI_ETHUSD":
      return UsdDenomination.FiveCents;
    default:
      return UsdDenomination.FiftyCents;
  }
}

export function OrderBook() {
  const [productFeedSubscription, setSubscription] = useState(Product.XBTUSD);
  const [grouping, setGrouping] = useState(UsdDenomination.FiftyCents);

  const toggleSubscription = useCallback(() => {
    const nextSubscription =
      productFeedSubscription === Product.XBTUSD
        ? Product.ETHUSD
        : Product.XBTUSD;

    setSubscription(nextSubscription);
    setGrouping(getDefaultGroupingForProduct(nextSubscription));
  }, [productFeedSubscription]);

  return (
    <div className={styles.orderBook}>
      <div className={styles.orderBookHeader}>
        <p className={styles.title}>Order Book | {productFeedSubscription}</p>
      </div>

      <OrderFeed
        grouping={grouping}
        productFeedSubscription={productFeedSubscription}
      />

      <div className={styles.footer}>
        <button onClick={toggleSubscription}>Toggle Feed</button>
      </div>
    </div>
  );
}
