import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

import type { Comment, Presentation, Preset, Slide } from "@deckworks/core";
import { presets as presetList } from "@deckworks/core";
import { mockPresentation } from "./mockPresentation";
import type { Material } from "./types";

export type State = {
  presentation: Presentation;
  activeSlideId: string;
  presets: Preset[];
  materials: Material[];
  selectedLook: string;
  focus: string;
  directive: string;
};

export type Action =
  | { type: "rename"; title: string }
  | { type: "select-slide"; slideId: string }
  | { type: "apply-preset"; presetId: string }
  | { type: "add-comment"; comment: Comment }
  | { type: "hydrate-comments"; comments: Comment[] }
  | { type: "add-slide"; slide: Slide }
  | { type: "compile" }
  | { type: "add-material"; material: Material }
  | { type: "remove-material"; id: string }
  | { type: "select-look"; presetId: string }
  | { type: "set-focus"; focus: string }
  | { type: "set-directive"; directive: string }
  | { type: "build" };

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
    case "hydrate-comments": {
      const existing = new Set(state.presentation.comments.map((c) => c.id));
      const fresh = action.comments.filter((c) => !existing.has(c.id));
      if (!fresh.length) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          comments: [...state.presentation.comments, ...fresh],
        },
      };
    }
    case "add-slide":
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slides: [...state.presentation.slides, action.slide],
        },
      };
    case "compile": {
      const hasOpen = state.presentation.comments.some((c) => c.status === "open");
      if (!hasOpen) return state;
      return {
        ...state,
        presentation: {
          ...state.presentation,
          comments: state.presentation.comments.map((c) =>
            c.status === "open" ? { ...c, status: "resolved" as const } : c
          ),
        },
      };
    }
    case "add-material":
      return { ...state, materials: [...state.materials, action.material] };
    case "remove-material":
      return {
        ...state,
        materials: state.materials.filter((m) => m.id !== action.id),
      };
    case "select-look":
      return { ...state, selectedLook: action.presetId };
    case "set-focus":
      return { ...state, focus: action.focus };
    case "set-directive":
      return { ...state, directive: action.directive };
    case "build": {
      const preset = presetList.find((p) => p.id === state.selectedLook);
      return preset
        ? { ...state, presentation: { ...state.presentation, theme: preset.theme, template: preset.id } }
        : state;
    }
  }
}

const initialState: State = {
  presentation: mockPresentation,
  activeSlideId: mockPresentation.slides[0]?.id ?? "slide-01",
  presets: presetList,
  materials: [],
  selectedLook: "consulting",
  focus: "",
  directive: "",
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
