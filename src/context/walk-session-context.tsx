import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

type WalkSessionContextValue = {
  isActive: boolean;
  isCollapsed: boolean;
  beginWalk: () => void;
  collapseWalkUi: () => void;
  expandWalkUi: () => void;
  endWalk: () => void;
};

const WalkSessionContext = createContext<WalkSessionContextValue | null>(null);

export function WalkSessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const beginWalk = useCallback(() => {
    setIsActive(true);
    setIsCollapsed(false);
  }, []);

  const collapseWalkUi = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandWalkUi = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const endWalk = useCallback(() => {
    setIsActive(false);
    setIsCollapsed(false);
  }, []);

  const value = useMemo(
    () => ({
      isActive,
      isCollapsed,
      beginWalk,
      collapseWalkUi,
      expandWalkUi,
      endWalk,
    }),
    [isActive, isCollapsed, beginWalk, collapseWalkUi, expandWalkUi, endWalk],
  );

  return (
    <WalkSessionContext.Provider value={value}>{children}</WalkSessionContext.Provider>
  );
}

export function useWalkSession() {
  const ctx = useContext(WalkSessionContext);
  if (!ctx) {
    throw new Error('useWalkSession must be used within WalkSessionProvider');
  }
  return ctx;
}

/** Extra bottom inset for scroll/content when the minimized walk bar is visible. */
const WALK_COLLAPSED_BAR_BLOCK = 72;

export function useWalkCollapsedBarInset(): number {
  const { isActive, isCollapsed } = useWalkSession();
  const insets = useSafeAreaInsets();
  if (!isActive || !isCollapsed) {
    return 0;
  }
  return WALK_COLLAPSED_BAR_BLOCK + Math.max(insets.bottom, Spacing.two);
}
