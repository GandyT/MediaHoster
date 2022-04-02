import './App.css';
import React from 'react';

import Home from "./pages/home.js"
import CreateRoom from "./pages/createroom.js"
import JoinRoom from "./pages/joinroom.js"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

class App extends React.Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/createroom" element={<CreateRoom />} />
          <Route path="/joinroom" element={<JoinRoom />} />
        </Routes>
      </Router>
    )
  }
}

export default App;
