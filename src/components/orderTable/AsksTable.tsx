import React, { useMemo } from "react";
import { OrderWithTotal } from "../../types";
import { AnchorPoint, OrderTable } from "./OrderTable";

function AsksTable({ asksWithTotals }: AsksTableProps) {
  const highestAsk: number = useMemo(
    () => asksWithTotals[asksWithTotals.length - 1]?.total ?? 0,
    [asksWithTotals]
  );
  const asksTableHeaders = useMemo(() => ["Price", "Size", "Total"], []);

  return (
    <OrderTable headers={asksTableHeaders}>
      {asksWithTotals.map((ask) => (
        <OrderTable.Row key={ask.price}>
          <OrderTable.Data textColor="red">
            {ask.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </OrderTable.Data>
          <OrderTable.Data>{ask.size.toLocaleString()}</OrderTable.Data>
          <OrderTable.Data>{ask.total.toLocaleString()}</OrderTable.Data>
          <OrderTable.DepthBar
            anchorPoint={AnchorPoint.Left}
            backgroundColorStyleValue="rgba(255, 0, 0, 0.2)"
            width={`${(ask.total / highestAsk) * 100}%`}
          />
        </OrderTable.Row>
      ))}
    </OrderTable>
  );
}

const AsksTableMemo = React.memo(AsksTable);
export default AsksTableMemo;

export type AsksTableProps = {
  asksWithTotals: OrderWithTotal[];
};
