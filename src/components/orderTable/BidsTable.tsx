import React, { useMemo } from "react";
import { OrderWithTotal } from "../../types";
import { AnchorPoint, OrderTable } from "./OrderTable";

function BidsTable({ bidsWithTotals }: BidsTableProps) {
  const highestBid: number = useMemo(
    () => bidsWithTotals[bidsWithTotals.length - 1]?.total ?? 0,
    [bidsWithTotals]
  );
  const bidsTableHeaders = useMemo(() => ["Total", "Size", "Price"], []);

  return (
    <OrderTable headers={bidsTableHeaders}>
      {bidsWithTotals.map((bid) => (
        <OrderTable.Row key={bid.price}>
          <OrderTable.Data>{bid.total.toLocaleString()}</OrderTable.Data>
          <OrderTable.Data>{bid.size.toLocaleString()}</OrderTable.Data>
          <OrderTable.Data textColor="green">
            {bid.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </OrderTable.Data>
          <OrderTable.DepthBar
            anchorPoint={AnchorPoint.Right}
            backgroundColorStyleValue="rgba(0, 255, 0, 0.2)"
            width={`${(bid.total / highestBid) * 100}%`}
          />
        </OrderTable.Row>
      ))}
    </OrderTable>
  );
}

const BidsTableMemo = React.memo(BidsTable);
export default BidsTableMemo;

export type BidsTableProps = {
  bidsWithTotals: OrderWithTotal[];
};
