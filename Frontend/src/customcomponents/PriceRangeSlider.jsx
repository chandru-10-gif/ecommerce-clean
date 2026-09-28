import React, { useRef, useState, useEffect, useCallback } from "react";

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "220px",
    padding: "8px 0",
  },
  labels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },
  trackWrap: {
    position: "relative",
    height: "32px",
    margin: "4px 0 0",
  },
  trackBg: {
    position: "absolute",
    top: "13px",
    left: 0,
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "#e0e0e0",
  },
  trackFill: {
    position: "absolute",
    top: "13px",
    height: "6px",
    borderRadius: "3px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
  },
};

export default function PriceRangeSlider({ min = 0, max = 100000, value, onChange }) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const trackRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value[0], value[1]]);

  const getPercent = useCallback(
    (val) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  const fireChange = useCallback(
    (newMin, newMax) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange([newMin, newMax]);
      }, 300);
    },
    [onChange]
  );

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - 100);
    setMinVal(val);
    fireChange(val, maxVal);
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), minVal + 100);
    setMaxVal(val);
    fireChange(minVal, val);
  };

  const thumbStyle = {
    position: "absolute",
    width: "100%",
    height: "32px",
    background: "transparent",
    WebkitAppearance: "none",
    appearance: "none",
    outline: "none",
    pointerEvents: "none",
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        .slider-arrow::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 14px solid #667eea;
          cursor: pointer;
          pointer-events: auto;
          position: relative;
          top: -4px;
          transition: transform 0.15s;
        }
        .slider-arrow::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .slider-arrow::-moz-range-thumb {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 14px solid #667eea;
          cursor: pointer;
          pointer-events: auto;
          border-radius: 0;
          border-bottom: none;
          position: relative;
          top: -4px;
        }
        .slider-arrow::-ms-thumb {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 14px solid #667eea;
          cursor: pointer;
          pointer-events: auto;
        }
        .slider-arrow {
          -webkit-appearance: none;
          appearance: none;
        }
      `}</style>

      <div style={styles.labels}>
        <span>&#8377;{minVal.toLocaleString()}</span>
        <span>&#8377;{maxVal.toLocaleString()}</span>
      </div>

      <div style={styles.trackWrap}>
        <div style={styles.trackBg} />
        <div
          ref={trackRef}
          style={{
            ...styles.trackFill,
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="slider-arrow"
          style={{ ...thumbStyle, zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="slider-arrow"
          style={{ ...thumbStyle, zIndex: 4 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999" }}>
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
