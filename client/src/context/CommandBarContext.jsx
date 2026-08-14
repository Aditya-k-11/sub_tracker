import React, { createContext, useContext, useState, useEffect } from 'react';

const CommandBarContext = createContext(null);

export const CommandBarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CommandBarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CommandBarContext.Provider>
  );
};

export const useCommandBar = () => {
  const context = useContext(CommandBarContext);
  if (!context) {
    throw new Error('useCommandBar must be used within a CommandBarProvider');
  }
  return context;
};
