import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import MyBooks from "./pages/author/MyBooks";
import TicketQueue from "./pages/admin/TicketQueue";
import AdminTicketDetails from "./pages/admin/AdminTicketDetails";
import CreateTicket from "./pages/author/CreateTicket";
import MyTickets from "./pages/author/MyTickets";
import TicketDetails from "./pages/author/TicketDetails";

const getSavedUser = () => {
  try {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (
      sessionStorage.getItem("token") &&
      ["AUTHOR", "ADMIN"].includes(user?.role)
    )
      return user;
  } catch {
    // Ignore invalid saved data and show the login page.
  }
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token");
  return null;
};

const App = () => {
  const [user, setUser] = useState(getSavedUser);
  const [notice, setNotice] = useState("");

  const handleLogin = (user, token) => {
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
    setNotice("");
    setUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setNotice("");
    setUser(null);
  };

  useEffect(() => {
    const handleExpiredSession = () => {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      setUser(null);
      setNotice("Your session has expired. Please sign in again.");
    };
    window.addEventListener("session-expired", handleExpiredSession);
    return () =>
      window.removeEventListener("session-expired", handleExpiredSession);
  }, []);

  const home = user?.role === "ADMIN" ? "/admin/tickets" : "/author/books";

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/admin/tickets/:id" element={<ProtectedRoute user={user} role="ADMIN"><AdminTicketDetails user={user} /></ProtectedRoute>} />
        <Route path="/author/tickets/new" element={<ProtectedRoute user={user} role="AUTHOR"><CreateTicket /></ProtectedRoute>} />
        <Route path="/author/tickets" element={<ProtectedRoute user={user} role="AUTHOR"><MyTickets /></ProtectedRoute>} />
        <Route path="/author/tickets/:id" element={<ProtectedRoute user={user} role="AUTHOR"><TicketDetails /></ProtectedRoute>} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={home} replace />
            ) : (
              <Login onLogin={handleLogin} notice={notice} />
            )
          }
        />
        <Route
          path="/author/books"
          element={
            <ProtectedRoute user={user} role="AUTHOR">
              <MyBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute user={user} role="ADMIN">
              <TicketQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? home : "/login"} replace />}
        />
        <Route
          path="*"
          element={
            <main className="mx-auto max-w-6xl px-5 py-16">
              <h1 className="text-2xl font-semibold">Page not found</h1>
              <a
                href={user ? home : "/login"}
                className="mt-4 inline-block text-teal-700 underline">
                Back to {user ? "dashboard" : "login"}
              </a>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
