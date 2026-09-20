import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DocumentDetail from './pages/DocumentDetail';
import InfoPage from './pages/Info';
import Schemes from './pages/Schemes';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Community from './pages/Community';
import MyTickets from './pages/MyTickets';
import PendingQueue from './pages/PendingQueue';
import History from './pages/History';
import ChatWidget from './components/ChatWidget';
import './index.css';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));

  return (
    <Router>
      <Navbar role={role} setRole={setRole} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setRole={setRole} />} />
          <Route path="/signup" element={<Signup setRole={setRole} />} />
          <Route path="/dashboard" element={<Dashboard role={role} />} />
          <Route path="/info" element={<InfoPage role={role} />} />
          <Route path="/schemes" element={<Schemes role={role} />} />
          <Route path="/document/:id" element={<DocumentDetail role={role} />} />
          <Route path="/community" element={<Community role={role} />} />
          <Route path="/my-tickets" element={<MyTickets role={role} />} />
          <Route path="/pending-queue" element={<PendingQueue role={role} />} />
          <Route path="/history" element={<History role={role} />} />
        </Routes>
      </div>
      {role === 'user' && <ChatWidget />}
    </Router>
  );
}

export default App;
