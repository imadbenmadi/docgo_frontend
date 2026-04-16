import { useEffect } from "react";

let lockCount = 0;
let previousBodyOverflow;
let previousHtmlOverflow;

const lock = () => {
  lockCount += 1;
  if (lockCount !== 1) return;

  const body = document.body;
  const html = document.documentElement;

  previousBodyOverflow = body.style.overflow;
  previousHtmlOverflow = html.style.overflow;

  body.style.overflow = "hidden";
  html.style.overflow = "hidden";
};

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) return;

  const body = document.body;
  const html = document.documentElement;

  body.style.overflow = previousBodyOverflow ?? "";
  html.style.overflow = previousHtmlOverflow ?? "";
};

export default function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;
    lock();
    return () => unlock();
  }, [isLocked]);
}
