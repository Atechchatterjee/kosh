import { DependencyList, useEffect } from "react";

/**
 *
 * @param targetKey key press to listen
 * @param onKeyPress callback function (invoked on key press - both up and down)
 * @param dependencyList dependency list for the listener use effect
 */
export const useKeyPress = (
  targetKey: string,
  onKeyPress: () => void,
  dependencyList?: DependencyList
) => {
  const downHandler = ({ key }: KeyboardEvent) => {
    if (key === targetKey) {
      onKeyPress();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
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

  const downHandler = (event: KeyboardEvent) => {
    if (modPressed && event.key === key) {
      modPressed = false;
      onKeyPress();
    }
    modPressed = event.key === mod;
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

export const useMultiKeyPress = (
  targetKeys: string,
  onKeyPress: () => void,
  dependencyList?: DependencyList
) => {
  const [key1, key2] = targetKeys.split("").map((key) => key.trim());
  let key1Pressed = false;

  const downHandler = (event: KeyboardEvent) => {
    if (event.key === key2 && key1Pressed) {
      key1Pressed = false;
      onKeyPress();
    }
    key1Pressed = event.key === key1;
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  }, dependencyList ?? []);
};
