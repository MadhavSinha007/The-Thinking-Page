import React from "react";
import Router from './Router';
import { AuthProvider } from './authContext/index';

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;