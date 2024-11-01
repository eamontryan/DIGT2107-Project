import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Tasks from './Tasks';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Tasks />} />
    </Routes>
  </Router>
);

export default App;
