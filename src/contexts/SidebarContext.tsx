import { createContext, useContext } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
}

export const SidebarContext = createContext<SidebarContextType>({
  isSidebarOpen: false,
});

export function useSidebarContext() {
  return useContext(SidebarContext);
}
