import { DependencyList, useEffect } from "react";

/**
 *
 * @param targetKey key press to listen
 * @param onKeyPress callback function (invoked on key press - both up and down)
 * @param dependencyList dependency list for the listener use effect
 */
export const useKeyPress = (
  targetKey: string,
  onKeyPress: ({ up, down }: { up: boolean; down: boolean }) => void,
  dependencyList?: DependencyList
) => {
  const downHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      onKeyPress({ up: false, down: true });
    }
  };

  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      onKeyPress({ up: true, down: false });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, dependencyList ?? []);
};

/**
 *
 * @param targetKey key press to listen
 * @param onKeyPress callback function (invoked on key press)
 * @param dependencyList dependency list for the listener use effect
 */
export const useComboKeyPress = (
  targetKeys: string,
  onKeyPress: () => void,
  dependencyList?: DependencyList
) => {
  const [mod, key] = targetKeys.split("+").map((key) => key.trim());
  let modPressed = false;

  useKeyPress(key, ({ down }) => {
    if (modPressed && down) {
      onKeyPress();
    }
  });

  const downHandler = (event: KeyboardEvent) => {
    if (event.key === mod) {
      modPressed = true;
    }
  };

  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === mod) {
      modPressed = false;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, dependencyList ?? []);
};
