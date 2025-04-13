// ToastProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Toast, ToastContainer } from "react-bootstrap";

export type ToastType = "Primary" | "Success" | "Danger";

interface ToastContextProps {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState("success");
  const [message, setMessage] = useState("");

  const showToast = useCallback((type: ToastType, msg: string) => {
    setMessage(msg);
    setShow(true);
    setTimeout(() => {
      setShow(false);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastContainer
        position="bottom-end"
        className="p-3 z-50 absolute"
      >
        <Toast
          onClose={() => setShow(false)}
          show={show}
          bg={type}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}
