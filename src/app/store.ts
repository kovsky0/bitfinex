import {
  configureStore,
  ThunkAction,
  Action,
  applyMiddleware,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import orderBookReducer from "../features/order-book/orderBookSlice";
import createSagaMiddleware from "@redux-saga/core";
import rootSaga from "./saga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    orderBook: orderBookReducer,
  },
  middleware: [...getDefaultMiddleware(), sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
