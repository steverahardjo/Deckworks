import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { Comment, Presentation, Preset, Slide } from "@/types/presentation";
import { mockPresentation, presets as presetList } from "./mockPresentation";

export type State = {
  presentation: Presentation;
  activeSlideId: string;
  presets: Preset[];
};

export type Action =
  | { type: "rename"; title: string }
  | { type: "select-slide"; slideId: string }
  | { type: "apply-preset"; presetId: string }
  | { type: "add-comment"; comment: Comment }
  | { type: "add-slide"; slide: Slide };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "rename":
      return {
        ...state,
        presentation: {
          ...state.presentation,
          metadata: { ...state.presentation.metadata, title: action.title },
        },
      };
    case "select-slide":
      return { ...state, activeSlideId: action.slideId };
    case "apply-preset": {
      const preset = presetList.find((p) => p.id === action.presetId);
      if (!preset) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          theme: preset.theme,
          template: preset.id,
        },
      };
    }
    case "add-comment":
      return {
        ...state,
        presentation: {
          ...state.presentation,
          comments: [...state.presentation.comments, action.comment],
        },
      };
    case "add-slide":
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: [...state.presentation.slides, action.slide],
        },
      };
  }
}

const initialState: State = {
  presentation: mockPresentation,
  activeSlideId: mockPresentation.slides[0]?.id ?? "slide-01",
  presets: presetList,
};

const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): State {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
  return ctx;
}
