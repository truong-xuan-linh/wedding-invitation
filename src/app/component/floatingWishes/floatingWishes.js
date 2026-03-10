"use client";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import styles from "./floatingWishes.module.scss";
import { WISH_API_LINK } from "@/app/configs/ui";
import Love from "@/app/icons/love";
import Sad from "@/app/icons/sad";
import Angry from "@/app/icons/angry";

const cx = classNames.bind(styles);

const FLOAT_DURATION = 10000; // ms each bubble lives
const SPAWN_INTERVAL = 3500; // ms between spawns
const MAX_ACTIVE = 5;

function FloatingWishes() {
  const [wishes, setWishes] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const indexRef = useRef(0);
  const keyRef = useRef(0);
  const wishesRef = useRef([]);

  useEffect(() => {
    fetch(WISH_API_LINK)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // shuffle so order feels fresh
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setWishes(shuffled);
          wishesRef.current = shuffled;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (wishes.length === 0) return;

    const spawn = () => {
      setBubbles((prev) => {
        if (prev.length >= MAX_ACTIVE) return prev;
        const wish = wishesRef.current[indexRef.current % wishesRef.current.length];
        indexRef.current++;

        const x = 4 + Math.random() * 68; // % from left, keep within viewport
        const rotStart = (Math.random() - 0.5) * 6; // -3 to +3 deg
        const rotEnd = (Math.random() - 0.5) * 8;
        const key = keyRef.current++;

        return [...prev, { key, wish, x, rotStart, rotEnd }];
      });
    };

    spawn(); // fire immediately
    const id = setInterval(spawn, SPAWN_INTERVAL);
    return () => clearInterval(id);
  }, [wishes]);

  // listen for a newly posted wish and immediately spawn it as a bubble
  useEffect(() => {
    const handleNewWish = (e) => {
      const wish = e.detail;
      if (!wish) return;

      // prepend to pool so it can cycle through later too
      wishesRef.current = [wish, ...wishesRef.current];

      const x = 4 + Math.random() * 68;
      const rotStart = (Math.random() - 0.5) * 6;
      const rotEnd = (Math.random() - 0.5) * 8;
      const key = keyRef.current++;

      setBubbles((prev) => {
        const capped = prev.length >= MAX_ACTIVE ? prev.slice(1) : prev;
        return [...capped, { key, wish, x, rotStart, rotEnd }];
      });

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.key !== key));
      }, FLOAT_DURATION);
    };

    window.addEventListener("wishPosted", handleNewWish);
    return () => window.removeEventListener("wishPosted", handleNewWish);
  }, []);

  // remove a bubble after its animation ends
  const handleAnimEnd = (key) => {
    setBubbles((prev) => prev.filter((b) => b.key !== key));
  };

  const renderIcon = (type) => {
    if (type === "yes") return <Love className={cx("icon")} />;
    if (type === "no") return <Sad className={cx("icon")} />;
    if (type === "or") return <Angry className={cx("icon")} />;
    return null;
  };

  return (
    <div className={cx("stage")} aria-hidden="true">
      {bubbles.map(({ key, wish, x, rotStart, rotEnd }) => (
        <Bubble
          key={key}
          wish={wish}
          x={x}
          rotStart={rotStart}
          rotEnd={rotEnd}
          duration={FLOAT_DURATION}
          onEnd={() => handleAnimEnd(key)}
          renderIcon={renderIcon}
        />
      ))}
    </div>
  );
}

function Bubble({ wish, x, rotStart, rotEnd, duration, onEnd, renderIcon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cx("bubble", { expanded })}
      style={{
        left: `${x}%`,
        "--rot-start": `${rotStart}deg`,
        "--rot-end": `${rotEnd}deg`,
        "--duration": `${duration}ms`,
      }}
      onAnimationEnd={onEnd}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className={cx("header")}>
        {renderIcon(wish.isAttend)}
        <span className={cx("name")}>{wish.name}</span>
      </div>
      <p className={cx("text", { clamped: !expanded })}>{wish.wish}</p>
      {!expanded && wish.wish?.length > 80 && (
        <span className={cx("more")}>tap to read more</span>
      )}
      <span className={cx("heart")}>♡</span>
    </div>
  );
}

export default FloatingWishes;
