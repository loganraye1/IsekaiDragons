import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState } from "./types";

const SAVE_KEY = "isekai-dragons-save-v1";

export async function loadGameState() {
  const raw = await AsyncStorage.getItem(SAVE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as GameState;
}

export async function saveGameState(state: GameState) {
  const hasPendingReturnReward = state.returnPresence?.active && state.returnPresence.pendingOfflineReward > 0 && !state.returnPresence.rewardApplied;
  await AsyncStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastSavedAt: hasPendingReturnReward ? state.lastSavedAt : Date.now() }));
}

export async function clearGameState() {
  await AsyncStorage.removeItem(SAVE_KEY);
}
