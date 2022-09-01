import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  changePrecision,
  channelOn,
  selectNegativeData,
  selectPositiveData,
} from "./orderBookSlice";

type Precision = 0 | 1 | 2 | 3 | 4;

const applyPrecision = (precision: Precision, value: number) =>
  (Math.round(value * 100) / 100).toFixed(precision);

export function OrderBook() {
  const [precision, setPrecision] = useState<Precision>(4);
  const positiveData = useAppSelector(selectPositiveData);
  const negativeData = useAppSelector(selectNegativeData);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>Order Book</h1>
      <button onClick={() => dispatch(channelOn())}>Start getting data</button>
      <button
        onClick={() => {
          // changePrecision(precision);
          setPrecision((v) => (v === 4 ? v : ((v + 1) as Precision)));
        }}
      >
        Increase precision
      </button>
      <button
        onClick={() => {
          // changePrecision(precision);
          setPrecision((v) => (v === 0 ? v : ((v - 1) as Precision)));
        }}
      >
        Decrease precision
      </button>
      <div style={{ display: "flex" }}>
        <table style={{ maxWidth: 300, fontSize: 8 }}>
          <thead>
            <tr>
              <th>Count</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {positiveData.length &&
              positiveData.map(
                (item) =>
                  item && (
                    <tr
                      style={{
                        backgroundColor: "lightgreen",
                      }}
                    >
                      <td>{applyPrecision(precision, item[1])}</td>
                      <td>{applyPrecision(precision, item[2])}</td>
                      <td>{applyPrecision(precision, item[1] * item[2])}</td>
                      <td>{applyPrecision(precision, item[0])}</td>
                    </tr>
                  )
              )}
          </tbody>
        </table>

        <table style={{ maxWidth: 300, fontSize: 8 }}>
          <thead>
            <tr>
              <th>Price</th>
              <th>Total</th>
              <th>Amount</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {negativeData.length &&
              negativeData.map(
                (item) =>
                  item && (
                    <tr
                      style={{
                        backgroundColor: "red",
                      }}
                    >
                      <td>{applyPrecision(precision, item[0])}</td>
                      <td>{applyPrecision(precision, item[1] * item[2])}</td>
                      <td>{applyPrecision(precision, item[2])}</td>
                      <td>{applyPrecision(precision, item[1])}</td>
                    </tr>
                  )
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
