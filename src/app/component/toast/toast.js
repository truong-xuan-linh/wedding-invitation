"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { ToastContext } from "@/app/context/toastContext";
import classNames from "classnames/bind";
import styles from "./toast.module.scss";

const cx = classNames.bind(styles);

const ICONS = {
  success: "♡",
  error: "✕",
  info: "✦",
};

function ToastItem({ toast }) {
  const { removeToast } = useContext(ToastContext);

  return (
    <motion.div
      layout
      className={cx("toast", toast.type)}
      initial={{ opacity: 0, y: 48, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      onClick={() => removeToast(toast.id)}
      role="alert"
    >
      <span className={cx("icon")}>{ICONS[toast.type]}</span>
      <span className={cx("message")}>{toast.message}</span>
      <div
        className={cx("progress")}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </motion.div>
  );
}

function ToastContainer() {
  const { toasts } = useContext(ToastContext);

  return (
    <div className={cx("container")}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastContainer;
