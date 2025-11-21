
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCreator } from '../contexts/CreatorContext';
import { ROLE_STYLES, NAVIGATION_LINKS } from '../constants';

const Sidebar = () => {
  const { activeRole } = useAuth();
  const { creatorInfo } = useCreator();

  if (!activeRole) return null;

  const roleStyle = ROLE_STYLES[activeRole];
  
  const navLinks = NAVIGATION_LINKS.filter(link => {
      return link.roles.includes(activeRole);
  });
  
  const activeLinkClass = "bg-white/10 border-l-4 border-white";
  const inactiveLinkClass = "hover:bg-white/5";

  return (
    <aside className={`w-64 bg-gray-800 text-white flex flex-col h-screen fixed left-0 top-0 z-20 bg-gradient-to-b ${roleStyle.gradient}`}>
      <div className="p-6 text-center border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-wider">{creatorInfo.appName}</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <RouterNavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center p-4 rounded-lg transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <Icon className="w-6 h-6 mr-4 flex-shrink-0" />
            <span className="font-medium">{label}</span>
          </RouterNavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 text-center">
        <img src={creatorInfo.logo} alt="Creator Logo" className="w-16 h-16 rounded-full mx-auto mb-2" />
        <p className="text-sm font-semibold">{creatorInfo.creatorName}</p>
        <p className="text-xs text-white/70">{creatorInfo.contactEmail}</p>
        <p className="text-xs text-white/50 mt-2">{creatorInfo.copyrightText}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
