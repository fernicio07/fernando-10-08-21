import React, { ReactNode } from "react";
import styles from "./OrderTable.module.css";

export function OrderTable({ children, headers }: OrderTableProps) {
  return (
    <table aria-label={"order data table"} className={styles.orderTable}>
      <thead>
        <tr className={styles.tableRow}>
          {headers.map((header) => (
            <th key={header} className={styles.tableCell}>
              <div className={styles.tableCellWrapper}>{header}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Row({ children }: OrderTableRowProps) {
  return <tr className={styles.tableRow}>{children}</tr>;
}

function Data({ style, children, textColor }: OrderTableDataProps) {
  return (
    <td className={styles.tableCell}>
      <div
        className={styles.tableCellWrapper}
        style={{ color: textColor, ...style }}
      >
        {children}
      </div>
    </td>
  );
}

function DepthBar({
  anchorPoint,
  backgroundColorStyleValue,
  width,
}: OrderTableBarProps) {
  return (
    <td
      className={styles.orderDepthBar}
      style={{
        [anchorPoint]: 0,
        backgroundColor: backgroundColorStyleValue,
        width: width,
      }}
    />
  );
}

OrderTable.Row = React.memo(Row);
OrderTable.Data = React.memo(Data);
OrderTable.DepthBar = React.memo(DepthBar);

export type OrderTableRowProps = {
  children: ReactNode;
};

export type OrderTableDataProps = {
  textColor?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

export enum AnchorPoint {
  Right = "right",
  Left = "left",
}

export type OrderTableBarProps = {
  anchorPoint: AnchorPoint;
  backgroundColorStyleValue: string;
  width: string;
};

export type OrderTableProps = {
  children: ReactNode;
  headers: string[];
};
