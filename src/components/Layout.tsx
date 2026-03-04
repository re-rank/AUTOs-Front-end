import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: '대시보드' },
  { to: '/orders', label: '주문 목록' },
  { to: '/mappings', label: '상품 매핑' },
  { to: '/settings', label: '설정' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="header">
        <h1>자동주문 시스템</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-secondary" onClick={logout} style={{ padding: '6px 12px', fontSize: '12px' }}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="tabs">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
