import React from "react";
import Router from './Router';
import { AuthProvider } from './authContext/index';
import { ThemeProvider } from './context/ThemeContext'; // Correct path

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;