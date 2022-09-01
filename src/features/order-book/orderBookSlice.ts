import { createSlice } from "@reduxjs/toolkit";
import { eventChannel } from "redux-saga";
import { call, cancelled, put, race, take } from "redux-saga/effects";
import { io, Socket } from "socket.io-client";
import { RootState } from "../../app/store";

export const initialState = {
  positiveData: [[0, 0, 0]],
  negativeData: [[0, 0, 0]],
  channelStatus: "off",
  serverStatus: "unknown",
};

export const orderBookSlice = createSlice({
  name: "orderBook",
  initialState,
  reducers: {
    channelOn: (state) => {
      state.channelStatus = "on";
    },
    channelOff: (state) => {
      state.channelStatus = "off";
      state.serverStatus = "unknown";
    },
    serverOn: (state) => {
      state.serverStatus = "on";
    },
    serverOff: (state) => {
      state.serverStatus = "off";
    },
    addData: (state, action) => {
      if (action.payload[1] !== "hb") {
        state.positiveData = action.payload[1].filter(
          (item: any) => item[2] > 0
        );
        state.negativeData = action.payload[1].filter(
          (item: any) => item[2] < 0
        );
      }
    },
    updateData: (state, action) => {
      if (!action.payload[1] || action.payload[1] === "hb") {
        return;
      }
      const [id, price, count, amount] = action.payload[1];
      if (action.payload[1][2] > 0) {
        const updated = [...state.positiveData];
        updated.unshift(action.payload[1]);
        updated.pop();
        state.positiveData = [...updated];
      } else {
        const updated = [...state.negativeData];
        updated.unshift(action.payload[1]);
        updated.pop();
        state.negativeData = [...updated];
      }
    },
  },
});

export const selectPositiveData = (state: RootState) =>
  state.orderBook.positiveData;
export const selectNegativeData = (state: RootState) =>
  state.orderBook.negativeData;

export const {
  channelOn,
  channelOff,
  serverOn,
  serverOff,
  addData,
  updateData,
} = orderBookSlice.actions;

let socket: WebSocket;

const connect = () => {
  socket = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
  socket.addEventListener("open", function () {
    let msg = JSON.stringify({
      event: "subscribe",
      channel: "book",
      symbol: "tBTCUSD",
      freq: "F0",
      subId: "some-id",
    });
    socket.send(msg);
  });
  return socket;
};

let chanId: number;

export const changePrecision = (precision: any) => {
  let msg = JSON.stringify({
    event: "subscribe",
    channel: "book",
    symbol: "tBTCUSD",
    prec: `P${precision}`,
    subId: "some-id",
    chanId,
    len: 25,
  });
  socket.send(msg);
};

const createSocketChannel = (socket: WebSocket) =>
  eventChannel((emit) => {
    const handler = (data: any) => {
      emit(data);
    };

    socket.addEventListener("message", function (event) {
      console.log("Message from server ", event.data);
      const data = JSON.parse(event.data);
      if (data.event === "subscribed") {
        chanId = data.chanId;
        return;
      }
      handler(data);
    });

    return () => {
      socket.removeEventListener("message", handler);
    };
  });

const processPayload = (payload: any) => {
  if (payload[1] && payload[1].length > 3) {
    return "initialize";
  } else {
    return "update";
  }
};

const listenServerSaga = function* () {
  try {
    yield put(channelOn);
    yield call(connect);
    //@ts-ignore
    const socketChannel = yield call(createSocketChannel, socket);
    while (true) {
      //@ts-ignore
      const payload = yield take(socketChannel);
      const direction = processPayload(payload);
      if (direction === "initialize") {
        yield put(addData(payload));
      }
      if (direction === "update") {
        yield put(updateData(payload));
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    // @TODO handle disconnect/reconnect
  }
};

export const startStopChannel = function* () {
  while (true) {
    yield take(channelOn);
    yield race({
      task: call(listenServerSaga),
      cancel: take(channelOff),
    });
  }
};

export default orderBookSlice.reducer;
