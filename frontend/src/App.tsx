import MainView from "@/routes/MainView";
import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeContext } from "./context";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainView />,
  },
]);

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <RouterProvider router={router} />
    </ThemeContext.Provider>
  );
}
