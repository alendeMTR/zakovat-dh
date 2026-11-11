import { useCallback, useEffect, useState } from "react";
import { reduce } from "../game/game.js";
import { loadGame, saveGame } from "../game/storage.js";

/**
 * The running game: read once from the browser, saved after every action (plan §3).
 * `dispatch` stamps every action with the current time, so screens never pass `now` themselves.
 */
export function useGame() {
  const [game, setGame] = useState(() => loadGame());

  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  const dispatch = useCallback(
    (action) => setGame((current) => (current ? reduce(current, { now: Date.now(), ...action }) : current)),
    [],
  );

  return [game, dispatch];
}
