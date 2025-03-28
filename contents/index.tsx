import type { PlasmoCSConfig } from "plasmo"

import { useCallback, useEffect, useRef, useState, type ReactEventHandler } from "react";

import cssText from "data-text:~/contents/styles.css";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
}

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
}

const Content = () => {
  const arrClicRef = useRef([]);
  const [isRecord, setIsRecord] = useState(false);
  
  const isAutoClickStart = useRef(false);
  const [isAutoClick, setIsAutoClick] = useState(false);

  const timer = useRef(null);

  const changeRecord = (e) => {
    e.stopPropagation();
    arrClicRef.current = [];
    setIsRecord(!isRecord);
  }

  const recordClickPosition = useCallback((e) => {
    console.log(`${e.clientX}, ${e.clientY}`);

    arrClicRef.current.push({
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    });

    console.log('temp arrClicRef.current', e.target, arrClicRef.current);
  }, [isRecord]);

  const handleAutoClick = (e) => {
    document.removeEventListener("click", recordClickPosition);
    
    e.stopPropagation();
    setIsRecord(false);

    setIsAutoClick(!isAutoClick);

    isAutoClickStart.current = !isAutoClick;

    if (isAutoClickStart.current) {
      let temp = arrClicRef.current.slice();
      console.log('arrClicRef.current', arrClicRef.current);
      const func = () => {
        const clickInfo = temp.shift();
        if (clickInfo) {
          const { x, y, time } = clickInfo;
          const element = document.elementFromPoint(x, y);
          if (element) {
            (element as HTMLElement).click();
          }

          console.log('isAutoClickStart.current', isAutoClickStart.current, element);
          if (isAutoClickStart.current && temp.length > 0) {
            timer.current = setTimeout(() => {
              func();
            }, temp[0].time - time);
            console.log('temp[0].time - time', temp[0].time - time);
          } else if (isAutoClickStart.current) {
            clearTimeout(timer.current);
            temp = arrClicRef.current.slice();
            console.log('restart');
            func();
          }
        }
      };
      func();
    }
  };

  useEffect(() => {
    if (isRecord) {
      document.addEventListener("click", recordClickPosition);
    } else {
      document.removeEventListener("click", recordClickPosition);
    }
    return () => {
      document.removeEventListener("click", recordClickPosition);
    }
  }, [isRecord]);

  return (
    <div
      className="content"
    >
      <button
        className="record-btn"
        onClick={changeRecord}
      >
        {isRecord ? "结束记录" : "开始记录"}
      </button>

      <button
        className="record-btn"
        onClick={handleAutoClick}
      >
        {isAutoClick ? "结束自动点击" : "开始自动点击"}
      </button>
    </div>
  )
};

export default Content;
