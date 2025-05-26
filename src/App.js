import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import Dashboard from "./Dashboard";
import Entrance from "./Entrance";
import Books from "./Books";
import Loans from "./Loans";
import Students from "./Students";
import Reports from "./Reports";
import Users from "./User";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Books" element={<Books />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/students" element={<Students />} />
        <Route path="/entrance" element={<Entrance />} />
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/user" element={<Users/>}/>
      </Routes>
    </Router>
  );
}

export default App;
