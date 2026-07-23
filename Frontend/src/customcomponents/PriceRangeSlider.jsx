import React, { useRef, useEffect, useCallback } from "react";

export default function PriceRangeSlider({ min = 0, max = 100000, value, onChange }) {
  const [minVal, maxVal] = value;
  const range = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);
  const trackRef = useRef(null);

  const getPercent = useCallback(
    (val) => Math.round(((val - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    if (minThumbRef.current) {
      minThumbRef.current.style.left = `${getPercent(minVal)}%`;
    }
    if (maxThumbRef.current) {
      maxThumbRef.current.style.left = `${getPercent(maxVal)}%`;
    }
    if (trackRef.current) {
      trackRef.current.style.left = `${getPercent(minVal)}%`;
      trackRef.current.style.width = `${getPercent(maxVal) - getPercent(minVal)}%`;
    }
  }, [minVal, maxVal, getPercent]);

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - 100);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + 100);
    onChange([minVal, val]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", color: "#333" }}>
        <span>&#8377;{minVal.toLocaleString()}</span>
        <span>&#8377;{maxVal.toLocaleString()}</span>
      </div>

      <div style={{ position: "relative", height: "6px", margin: "10px 0" }}>
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "6px",
            borderRadius: "3px",
            background: "#ddd",
          }}
        />
        <div
          ref={trackRef}
          style={{
            position: "absolute",
            height: "6px",
            borderRadius: "3px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
          }}
        />
        <input
          ref={minThumbRef}
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          style={{
            position: "absolute",
            width: "100%",
            height: "6px",
            background: "transparent",
            pointerEvents: "none",
            WebkitAppearance: "none",
            appearance: "none",
            outline: "none",
            top: "-7px",
            zIndex: 3,
          }}
          className="slider-thumb"
        />
        <input
          ref={maxThumbRef}
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          style={{
            position: "absolute",
            width: "100%",
            height: "6px",
            background: "transparent",
            pointerEvents: "none",
            WebkitAppearance: "none",
            appearance: "none",
            outline: "none",
            top: "-7px",
            zIndex: 4,
          }}
          className="slider-thumb"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999" }}>
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
