import styles from "./guestbook.module.scss";
import classNames from "classnames/bind";
import { useInView, AnimatePresence, motion } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import Gift from "../gift";
import Sad from "@/app/icons/sad";
import Angry from "@/app/icons/angry";
import Love from "@/app/icons/love";

import Confetti from "react-dom-confetti";
import validation from "@/app/helper/validation";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/toastContext";
import {
  configConfetti,
  guestbookSection,
  WISH_API_LINK,
} from "@/app/configs/ui";
const cx = classNames.bind(styles);

function GuestBook({ fName }) {
  const ref = useRef();
  const viewRef = useRef();
  const isInView = useInView(ref, { once: true });
  const isInViewBox = useInView(viewRef, { once: false });
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [willArrive, setWillArrive] = useState(null);
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submittedNameRef = useRef("");

  const handleChangeRadio = (type) => setWillArrive(type);

  const handleSendMessage = async () => {
    if (isLoading) return;

    const { isValid, message } = validation({
      name,
      wish,
      isAttend: willArrive,
    });

    if (!isValid) {
      addToast(message, "error");
      return;
    }

    const now = new Date();
    const last = new Date(guestbookSection.time);
    if (now.getTime() > last.getTime()) {
      addToast("Hết thời gian gửi lời chúc rồi!", "info");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(WISH_API_LINK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wish, isAttend: willArrive }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Server error");

      // Inject the new wish into FloatingWishes immediately
      window.dispatchEvent(new CustomEvent("wishPosted", { detail: data }));

      submittedNameRef.current = name;
      setName("");
      setWish("");
      setWillArrive(null);
      setActive(true);
      setIsSubmitted(true);
      addToast("Lời chúc của bạn đã được gửi! ♡", "success");
    } catch {
      addToast("Xin lỗi! Có lỗi phía server. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 3000);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (!isSubmitted) return;
    const t = setTimeout(() => setIsSubmitted(false), 5000);
    return () => clearTimeout(t);
  }, [isSubmitted]);

  const renderIcon = (type) => {
    if (type === "yes") return <Love className={cx("emoij")} />;
    if (type === "no") return <Sad className={cx("emoij")} />;
    if (type === "or") return <Angry className={cx("emoij")} />;
    return "";
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")} ref={viewRef}>
        <div className={cx("background")}>
          <h2 className={cx("title")}>Sổ lưu bút</h2>
        </div>
        <div className={cx("img-wrap")}>
          <div
            className={cx("img")}
            style={{
              backgroundImage: `url(${guestbookSection.image})`,
              transform: isInViewBox
                ? "translateX(0) rotate(0deg)"
                : " translateX(-200px) rotate(-180deg)",
              opacity: isInViewBox ? 1 : 0,
              transition: "all 1s cubic-bezier(0.17, 0.55, 0.55, 1)",
            }}
          />
          <div className={cx("frame")} />
        </div>
      </div>

      <div className={cx("container")}>
        <AnimatePresence mode="wait" initial={false}>
          {isSubmitted ? (
            <motion.div
              key="success"
              className={cx("success-panel")}
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className={cx("success-heart")}>♡</span>
              <p className={cx("success-title")}>
                Cảm ơn {submittedNameRef.current}!
              </p>
              <p className={cx("success-subtitle")}>
                Lời chúc của bạn đã được gửi đến Hùng & Thúy
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className={cx("form-inner")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                className={cx("iname")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên hoặc nickname của bạn"
                disabled={isLoading}
              />

              <textarea
                className={cx("iwish")}
                placeholder="Viết lời chúc ở đây ..."
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                disabled={isLoading}
              />

              <div className={cx("radio-box")}>
                <input
                  className={cx("radio")}
                  type="radio"
                  id="yes"
                  name="will_arrive"
                  onChange={() => handleChangeRadio("yes")}
                  value="Sẽ đến dự tiệc"
                  disabled={isLoading}
                />
                <label htmlFor="yes">Sẽ đến dự tiệc</label>
                <input
                  className={cx("radio")}
                  type="radio"
                  id="no"
                  name="will_arrive"
                  value="Không thể đến dự"
                  onChange={() => handleChangeRadio("no")}
                  disabled={isLoading}
                />
                <label htmlFor="no">Không thể đến dự</label>
                <input
                  className={cx("radio")}
                  type="radio"
                  name="will_arrive"
                  id="or"
                  value="Không biết"
                  onChange={() => handleChangeRadio("or")}
                  disabled={isLoading}
                />
                <label htmlFor="or">Không biết</label>
              </div>

              <p className={cx("help-text")}>
                Nếu không thể gửi lời nhắn bằng trình duyệt trong{" "}
                <strong>Messenger</strong>, hãy thử mở trình duyệt bên ngoài (
                <strong>Chrome, Safari,...</strong>)
              </p>

              <button
                ref={ref}
                className={cx("btn")}
                style={{
                  transform: isInView ? "translateY(0)" : "translateY(80px)",
                  opacity: isInView ? 1 : 0,
                  transition: "all 1s cubic-bezier(0.17, 0.55, 0.55, 1)",
                }}
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={cx("spinner")} />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    {renderIcon(willArrive)}
                    Gửi lời nhắn
                    {renderIcon(willArrive)}
                  </>
                )}
              </button>

              <button
                className={cx("btn")}
                style={{
                  transform: isInView ? "translateY(0)" : "translateY(80px)",
                  opacity: isInView ? 1 : 0,
                  transition: "all 1s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s",
                }}
                onClick={() => router.push(`/wish?name=${fName}`)}
              >
                Xem lời chúc
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Confetti active={active} config={configConfetti} />
      <Gift onClose={() => {}} />
    </div>
  );
}

export default GuestBook;
