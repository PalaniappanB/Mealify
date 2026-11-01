import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext(null);

// App-wide replacement for Alert.alert — renders a themed modal instead of the
// native OS dialog, and resolves a promise the same way Alert's callback would.
export function ConfirmProvider({ children }) {
  const { t } = useTranslation();
  const [state, setState] = useState(null); // { title, message, confirmLabel, cancelLabel, destructive }
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel || t('common.confirm'),
          cancelLabel: options.cancelLabel || t('common.cancel'),
          destructive: !!options.destructive
        });
      }),
    [t]
  );

  const handle = (result) => {
    setState(null);
    if (resolver.current) {
      resolver.current(result);
      resolver.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        visible={!!state}
        title={state?.title}
        message={state?.message}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        destructive={state?.destructive}
        onConfirm={() => handle(true)}
        onCancel={() => handle(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}
