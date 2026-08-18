import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="navbar">
      <div className="search-box">
        <Search size={18} />
        <input type="text" placeholder="Search purchases..." />
      </div>
      <div className="navbar-right">
        <button className="icon-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="profile">
          <div className="avatar">S</div>
          <div>
            <p className="profile-name">Simra</p>
            <p className="profile-role">User</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;