import React, { useMemo } from "react";
import { UsdDenomination, Product } from "../../types";
import styles from "./OrderFeed.module.css";
import { groupAndTotalOrders } from "../../utils/utils";
import { useOrderFeed } from "../../hooks/useOrderFeed";
import BidsTable from "../orderTable/BidsTable";
import AsksTable from "../orderTable/AsksTable";

export function OrderFeed({
  grouping = UsdDenomination.FiftyCents,
  productFeedSubscription = Product.XBTUSD,
}: OrderFeedProps) {
  const { bids, asks } = useOrderFeed({
    productFeedSubscription,
  });

  const bidsWithTotals = useMemo(
    () => groupAndTotalOrders(bids, grouping, true),
    [bids, grouping]
  );

  const asksWithTotals = useMemo(
    () => groupAndTotalOrders(asks, grouping),
    [asks, grouping]
  );

  return (
    <div className={styles.tables}>
      <BidsTable bidsWithTotals={bidsWithTotals} />
      <AsksTable asksWithTotals={asksWithTotals} />
    </div>
  );
}

export type OrderFeedProps = {
  grouping?: UsdDenomination;
  productFeedSubscription?: Product;
};
