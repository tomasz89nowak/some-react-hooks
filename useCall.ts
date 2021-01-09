import { ApiMiddlewareResult } from "apiMiddleware";
import { tuplify } from "../utilities";
import { useReducer, useRef, useEffect, useMemo, useCallback } from "react";
import cuid from "cuid";

interface State {
  isFetching: boolean;
  error: Record<any, any> | null;
  errorText: string;
  lastPayload: any;
  successCounter: 0;
}
type Action =
  | {
      type: "START";
    }
  | { type: "RESET" }
  | { type: "STOP"; payload: { error: State["error"]; lastPayload: any } }
  | { type: "SET_ERROR"; payload: State["error"] }
  | { type: "SET_ERROR_TEXT"; payload: State["errorText"] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, isFetching: true };
    case "STOP":
      return {
        ...state,
        isFetching: false,
        error: action.payload.error ?? null,
        errorText: "",
        lastPayload: action.payload.lastPayload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "SET_ERROR_TEXT":
      return {
        ...state,
        errorText: action.payload,
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}
const initialState: State = {
  error: null,
  isFetching: false,
  lastPayload: null,
  successCounter: 0,
  errorText: "",
};

type Settings = {
  clearKey?: string | number | null | Symbol;
};

/**
* @example
*  const [firstNameField, firstNameEffects] = useCall(patchDelivery, {
*    clearKey: panelId,
*  });
*  firstNameEffects.onSuccess(clientSuccessCallback);
*  firstNameEffects.onError((error, { setErrorText }) => {
*    setErrorText(getAnyErrorKey(error, "firstName"));
*  });
*/
export function useCall<TRes, T extends any[]>(
  call: (...args: T) => ApiMiddlewareResult<TRes>,
  settings: Settings = {},
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isMounted = useRef(false);
  const lastRequestId = useRef("");
  const clearAfterKeyChange = settings.hasOwnProperty("clearKey");
  const lastClearKey = useRef<Settings["clearKey"]>(settings.clearKey);

  const setError = useCallback(
    (err: Record<string, any>) => dispatch({ type: "SET_ERROR", payload: err }),
    [],
  );

  const setErrorText = useCallback(
    (err: string) => dispatch({ type: "SET_ERROR_TEXT", payload: err }),
    [],
  );

  const submit = async (...a: T) => {
    const requestId = cuid();
    const clearKey = settings.clearKey;
    lastRequestId.current = requestId;
    const start = () => dispatch({ type: "START" });
    const stop = (payload: TRes | null = null, error: State["error"] = null) =>
      dispatch({ type: "STOP", payload: { error: err, lastPayload: payload } });
    const callThunk = () => call(...a);

    start();
    const [payload, err] = await callThunk();
    const clearKeyHasChanged = clearAfterKeyChange && clearKey !== lastClearKey.current;
    const thereIsNoRaceCondition = requestId === lastRequestId.current;

    if (thereIsNoRaceCondition && !clearKeyHasChanged) {
      stop(payload, err);
      if (!err) {
        onSuccessCallback.current?.(payload, ...a);
      } else {
        onErrorCallback.current?.(err, { setErrorText });
      }
    }
  };
  const onSuccessCallback = useRef<any>();
  const onErrorCallback = useRef<any>();

  const onSuccess = useMemo(
    () => (cb: (arg: TRes, ...g: T) => void) => {
      onSuccessCallback.current = cb;
    },
    [],
  );

  const onError = useMemo(
    () => (
      cb: (
        arg: NonNullable<State["error"]>,
        helpers: { setErrorText: typeof setErrorText },
      ) => void,
    ) => {
      onErrorCallback.current = cb;
    },
    [],
  );

  useEffect(() => {
    if (isMounted.current === false) return;
    if (clearAfterKeyChange && settings.clearKey !== lastClearKey.current) {
      lastClearKey.current = settings.clearKey;
      dispatch({ type: "RESET" });
    }
  }, [settings.clearKey, clearAfterKeyChange]);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  return tuplify({ submit, ...state, dispatch, setError }, { onSuccess, onError });
}
