import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen, handleMouseEnter, handleMouseLeave, logout }) => {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-[#6b55c7] to-[#4c3a91] text-white p-6 z-40 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 className="text-2xl font-bold tracking-wide mb-10">DASHBOARD</h2>
      <nav className="flex flex-col space-y-5">
        <NavLink 
          to="/home" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-4 py-1 rounded border-2 border-purple-950 hover:bg-purple-950 transition-colors"
        >
          <img src="/Home.svg" alt="Home" className="w-10 h-10" />
          <span>HOME</span>
        </NavLink>
        <NavLink 
          to="/history" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-4 py-1 rounded border-2 border-purple-950 hover:bg-purple-950 transition-colors"
        >
          <img src="/History.svg" alt="History" className="w-10 h-10" />
          <span>History</span>
        </NavLink>
        <NavLink 
          to="/generate" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-4 py-1 rounded border-2 border-purple-950 hover:bg-purple-950 transition-colors"
        >
          <img src="/Certification.svg" alt="Certificate" className="w-10 h-10" />
          <span>Certificate Generator</span>
        </NavLink>
        <NavLink 
          to="/tesda" 
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-4 py-1 rounded border-2 border-purple-950 hover:bg-purple-950 transition-colors"
        >
          <img src="/TESDA.svg" alt="TESDA" className="w-10 h-10" />
          <span>TESDA</span>
        </NavLink>
      </nav>
        <div className="absolute bottom-6 left-0 w-full px-6">
        <button
        onClick={logout}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-center"
  >
        Logout
      </button>
      </div>
    </aside>
  );
};

const Dashboard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timer.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timer.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar & Toggle */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        logout={logout}
      />

      {/* Hamburger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-3 z-50 bg-[#6b55c7] text-white p-3 rounded-md shadow-md hover:bg-[#4c3a91] transition"
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 p-6 ml-0 ${isOpen ? 'ml-64' : ''} flex-1`}
      >
        {children}
      </main>
    </div>
  );
};

export default Dashboard;
