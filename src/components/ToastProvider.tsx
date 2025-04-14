import React, { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type ToastType = "success" | "danger" | "warning" | "info";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = (message: string, type: ToastType = "success") => {
    setMessage(message);
    setType(type);
    setShow(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        className="position-fixed top-0 start-50 translate-middle-x p-3"
        style={{ zIndex: 1000 }}
      >
        <Toast 
          show={show} 
          onClose={() => setShow(false)} 
          delay={5000} 
          autohide
          bg={type}
        >
          <Toast.Body className="text-white">
            {message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}