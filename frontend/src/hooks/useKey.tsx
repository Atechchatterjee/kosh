import { useRef } from "react";
import { DependencyList, useLayoutEffect } from "react";

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

  useLayoutEffect(() => {
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

  const downHandler = (event: KeyboardEvent) => {
    if (modPressed && event.key === key) {
      modPressed = false;
      onKeyPress();
    }
    if (event.key === mod) {
      modPressed = true;
    } else {
      modPressed = false;
    }
  };

  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === mod) {
      modPressed = false;
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
      modPressed = false;
    };
  }, dependencyList ?? []);
};

export const useMultiKeyPress = (
  targetKeys: string,
  onKeyPress: () => void,
  dependencyList?: DependencyList
) => {
  const [key1, key2] = targetKeys.split("").map((key) => key.trim());
  let key1Pressed = useRef<boolean>(false);

  const downHandler = (event: KeyboardEvent) => {
    if (event.key === key2 && key1Pressed.current) {
      console.log({ key1Pressed: key1Pressed.current });
      key1Pressed.current = false;
      onKeyPress();
    }
    if (event.key === key1) {
      key1Pressed.current = true;
    } else {
      key1Pressed.current = false;
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      key1Pressed.current = false;
    };
  }, dependencyList ?? []);
};
