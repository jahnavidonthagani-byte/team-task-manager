import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Kanban from "./pages/Kanban";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Navbar from "./components/Navbar";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Auth />} />

        <Route path="/dashboard"
          element={<Protected><Dashboard /></Protected>}
        />

        <Route path="/projects"
          element={<Protected><Projects /></Protected>}
        />

        <Route path="/tasks"
          element={<Protected><Tasks /></Protected>}
        />

        <Route path="/kanban"
          element={<Protected><Kanban /></Protected>}
        />

        <Route path="/calendar"
          element={<Protected><Calendar /></Protected>}
        />

        <Route path="/reports"
          element={<Protected><Reports /></Protected>}
        />

      </Routes>

    </BrowserRouter>
  );
}
