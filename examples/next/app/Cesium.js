"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { Cartesian3, Color } from "cesium";
import { useEffect, useRef, useState } from "react";
import { Entity, Viewer } from "resium";

// Cesium loads its workers/assets relative to this URL.
// They are linked into /public/cesium by the postinstall script.
window.CESIUM_BASE_URL = "/cesium";

export default function Cesium() {
  const [flag, setFlag] = useState(false);
  const viewerRef = useRef(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!spinning) return;

    let animationId;
    const spin = () => {
      const viewer = viewerRef.current?.cesiumElement;
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.camera.rotateRight(0.003);
      }
      animationId = requestAnimationFrame(spin);
    };
    animationId = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(animationId);
  }, [spinning]);

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1,
        }}
      >
        <button onClick={() => setSpinning((s) => !s)}>
          {spinning ? "Stop Rotate" : "Rotate"}
        </button>
      </div>
      <Viewer full ref={viewerRef}>
        <Entity
          name="Tokyo"
          position={Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
          point={{ pixelSize: 20, color: Color.WHITE }}
          description="hoge"
          onClick={() => setFlag((f) => !f)}
        />
        {flag && (
          <Entity
            position={Cartesian3.fromDegrees(139.767052, 34.681167, 100)}
            point={{ pixelSize: 20, color: Color.RED }}
          />
        )}
      </Viewer>
    </>
  );
}
