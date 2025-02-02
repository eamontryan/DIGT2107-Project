import React from 'react';
import Tasks from './Tasks';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1 className="text-primary">Task Manager</h1>
      </div>
      <Tasks />
    </div>
  );
}

export default App;