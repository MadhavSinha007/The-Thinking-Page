import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./landingpage/LandingPage.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

import Render from "./render/render.jsx";
import Saved from "./pages/save/Save.jsx";
import History from "./pages/history/History.jsx";
import Home from "./pages/home/home.jsx";
import BookDetail from "./components/bookdetail.jsx";
import Profile from "./pages/settings/Profile.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import BookReaderPage from "./pages/books/BookReaderPage.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected fullscreen reader */}
        <Route element={<ProtectedRoute />}>
          <Route path="/read/:id" element={<BookReaderPage />} />
        </Route>

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Render />}>
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book/:id" element={<BookDetail />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;