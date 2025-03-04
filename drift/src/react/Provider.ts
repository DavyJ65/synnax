// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { ReactElement, useState, createElement } from "react";

import type { Action, AnyAction, EnhancedStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import type { ProviderProps as BaseProps } from "react-redux";

import { Enhancers } from "@/configureStore";
import { Middlewares } from "@/middleware";
import { StoreState } from "@/state";

/**
 * Overrides the default react-redux Provider to allow for a promise based
 * store.
 */
export interface ProviderProps<
  S extends StoreState,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>,
  E extends Enhancers = Enhancers
> extends Omit<BaseProps<A, S>, "store"> {
  store: Promise<EnhancedStore<S, A, M, E>> | EnhancedStore<S, A, M, E>;
  emptyContent?: ReactElement | null;
  errorContent?: (error: Error) => ReactElement;
}

/**
 * Replaces the default react-redux Provider with a drift compatible one that
 * waits for the store to be ready before rendering. To understand why this is
 * necessary, see the configureStore documentation.
 *
 * @param props - The props to pass to the Provider.
 * @param props.store - A promise that resolves to the store.
 */
export const DriftProvider = <
  S extends StoreState,
  A extends Action<unknown> = AnyAction,
  M extends Middlewares<S> = Middlewares<S>,
  E extends Enhancers = Enhancers
>({
  store: storeOrPromise,
  errorContent,
  emptyContent = null,
  children,
}: ProviderProps<S, A, M, E>): ReactElement | null => {
  const [store, setStore] = useState<EnhancedStore<S, A, M, E> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  if (error != null)
    return errorContent?.(error) ?? createElement("h1", {}, error.message);
  if (store == null) {
    // if the store isn't a promise, then it's already ready
    if (!(storeOrPromise instanceof Promise)) setStore(storeOrPromise);
    else storeOrPromise.then((s) => setStore(s)).catch((e) => setError(e));
    return emptyContent;
  }
  // @ts-expect-error
  return createElement(Provider<A, S>, { store }, children);
};
