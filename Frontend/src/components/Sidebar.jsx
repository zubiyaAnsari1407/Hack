import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  ShieldCheck,
  RotateCcw,
  ChartNoAxesCombined,
  Bot,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Purchases", path: "/purchases", icon: ShoppingBag },
  { name: "Receipts", path: "/receipts", icon: Receipt },
  { name: "Warranties", path: "/warranties", icon: ShieldCheck },
  { name: "Returns", path: "/returns", icon: RotateCcw },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "AI Assistant", path: "/assistant", icon: Bot },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        Smart<span>Purchase</span>
      </div>
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;