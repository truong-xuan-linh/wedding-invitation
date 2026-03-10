"use client";
import { Suspense } from "react";
import Loading from "./component/loading/loading";
import { ToastProvider } from "./context/toastContext";
import ToastContainer from "./component/toast";

function Sublayout({ children }) {
  return (
    <ToastProvider>
      <Suspense fallback={<Loading />}>{children}</Suspense>
      <ToastContainer />
    </ToastProvider>
  );
}

export default Sublayout;
