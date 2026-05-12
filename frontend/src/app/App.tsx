import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RoleProvider } from "./context/RoleContext";
import { DataProvider } from "./context/DataContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <RoleProvider>
      <DataProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </DataProvider>
    </RoleProvider>
  );
}