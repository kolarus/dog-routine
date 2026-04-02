import React, { useCallback, useRef } from 'react';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

/**
 * Manages a dynamic set of Swipeable refs with single-open coordination.
 * Only one swipeable can be open at a time; opening another closes the previous.
 */
export function useSwipeableGroup() {
  const refs = useRef(new Map<string, React.RefObject<SwipeableMethods | null>>());
  const openId = useRef<string | null>(null);

  const getRef = useCallback((id: string) => {
    let ref = refs.current.get(id);
    if (!ref) {
      ref = React.createRef<SwipeableMethods | null>();
      refs.current.set(id, ref);
    }
    return ref;
  }, []);

  const closeOpen = useCallback(() => {
    if (openId.current) {
      refs.current.get(openId.current)?.current?.close();
      openId.current = null;
    }
  }, []);

  const onOpen = useCallback((id: string) => {
    if (openId.current && openId.current !== id) {
      refs.current.get(openId.current)?.current?.close();
    }
    openId.current = id;
  }, []);

  const onClose = useCallback((id: string) => {
    if (openId.current === id) openId.current = null;
  }, []);

  const remove = useCallback((id: string) => {
    openId.current = null;
    refs.current.delete(id);
  }, []);

  return { getRef, closeOpen, onOpen, onClose, remove };
}
