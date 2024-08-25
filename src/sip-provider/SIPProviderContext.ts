import { createContext, useContext, useEffect, useState } from "react";

import {
  IProviderContext,
  RegisterStatus,
  CONNECT_STATUS,
  SessionDirection,
  Timer,
} from "../type";
import { Inviter } from "sip.js";

export const ProviderContext = createContext<IProviderContext>({
  sessionManager: null,
  connectAndRegister: () => {},
  connectStatus: CONNECT_STATUS.WAIT_REQUEST_CONNECT,
  registerStatus: RegisterStatus.UNREGISTERED,
  sessions: {},
  sessionTimer: {},
});

export const useSIPProvider = () => {
  return useContext(ProviderContext);
};

export const useSessionCall = (sessionId?: string) => {
  const { sessions, sessionManager, sessionTimer } = useSIPProvider();

  const session = sessionId ? sessions[sessionId] : null;

  const [isMuted, setIsMuted] = useState<boolean>(
    (session && sessionManager?.isMuted(session)) || false
  );
  const [isHeld, setIsHeld] = useState<boolean>(
    (session && sessionManager?.isHeld(session)) || false
  );

  useEffect(() => {
    if (session && sessionManager) {
      setIsMuted(sessionManager.isMuted(session));
      setIsHeld(sessionManager.isHeld(session));
    }
  }, [session, sessionManager]);

  const direction =
    session instanceof Inviter
      ? SessionDirection.OUTGOING
      : SessionDirection.INCOMING;

  const timer = sessionId ? sessionTimer[sessionId] : undefined;

  if (!session) {
    return null;
  }

  if (session) {
    return {
      direction,
      session: session,
      timer,
      hold: () => {
        sessionManager?.hold(session);
        setIsHeld(true);
      },
      unhold: () => {
        sessionManager?.unhold(session);
        setIsHeld(false);
      },
      isHeld: isHeld,

      mute: () => {
        sessionManager?.mute(session);
        setIsMuted(true);
      },
      unmute: () => {
        sessionManager?.unmute(session);
        setIsMuted(false);
      },
      isMuted: isMuted,
      answer: () => sessionManager?.answer(session),
      decline: () => sessionManager?.decline(session),
      hangup: () => sessionManager?.hangup(session),
    };
  }
};
