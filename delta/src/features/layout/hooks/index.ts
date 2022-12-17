import { Dispatch, useCallback } from "react";

import type { AnyAction } from "@reduxjs/toolkit";
import { closeWindow, createWindow } from "@synnaxlabs/drift";
import type { ThemeProviderProps } from "@synnaxlabs/pluto";
import { useDispatch } from "react-redux";

import {
  placeLayout,
  removeLayout,
  setTheme,
  toggleTheme,
  useSelectLayout,
  useSelectTheme,
} from "../store";
import { Layout } from "../types";

export interface LayoutCreatorProps {
  dispatch: Dispatch<AnyAction>;
}

export type LayoutCreator = (props: LayoutCreatorProps) => Layout;

export type LayoutPlacer = (layout: Layout | LayoutCreator) => void;

export type LayoutRemover = (key: string) => void;

export const useLayoutPlacer = (): LayoutPlacer => {
  const dispatch = useDispatch();
  return useCallback(
    (layout_: Layout | LayoutCreator) => {
      const layout = typeof layout_ === "function" ? layout_({ dispatch }) : layout_;
      const { key, location, window, title } = layout;
      dispatch(placeLayout(layout));
      if (location === "window")
        dispatch(
          createWindow({
            ...{ ...window, navTop: undefined },
            url: "/",
            key,
            title,
          })
        );
    },
    [dispatch]
  );
};

export const useLayoutRemover = (key: string): LayoutRemover => {
  const dispatch = useDispatch();
  const layout = useSelectLayout(key);
  return () => {
    dispatch(removeLayout(key));
    if (layout.location === "window") dispatch(closeWindow(key));
  };
};

export const useThemeProvider = (): ThemeProviderProps => {
  const theme = useSelectTheme();
  const dispatch = useDispatch();
  return {
    theme,
    setTheme: (key: string) => dispatch(setTheme(key)),
    toggleTheme: () => dispatch(toggleTheme()),
  };
};
