import type { ComponentType } from "react";
import type { GameAction, GameState } from "../types";
import { elementTheme } from "../content";
import ComicIntro from "./ComicIntro";

type StageProps = { state: GameState; dispatch: (action: GameAction) => void };

export default function GameStage({
  state,
  dispatch,
  JourneyStage,
  AwakeningStage
}: StageProps & {
  JourneyStage: ComponentType<StageProps>;
  AwakeningStage: ComponentType<StageProps>;
}) {
  if (state.phase === "intro") {
    const element = state.dragon.element ?? "fire";
    return (
      <ComicIntro
        accentColor={elementTheme[element].primary}
        onComplete={() => dispatch({ type: "completeIntro" })}
      />
    );
  }
  if (state.phase === "journey") {
    return <JourneyStage state={state} dispatch={dispatch} />;
  }
  return <AwakeningStage state={state} dispatch={dispatch} />;
}
