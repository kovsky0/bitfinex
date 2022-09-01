import { all } from "redux-saga/effects";
import { startStopChannel } from "../features/order-book/orderBookSlice";

export default function* rootSaga() {
  yield all([startStopChannel()]);
}
