import type { ComponentType } from "react";
import type { GameAction, GameState } from "../types";

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
  if (state.phase === "journey") {
    return <JourneyStage state={state} dispatch={dispatch} />;
  }
  return <AwakeningStage state={state} dispatch={dispatch} />;
}
