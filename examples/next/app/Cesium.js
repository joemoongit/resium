"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { Cartesian3, Color, Math as CesiumMath } from "cesium";
import { useCallback, useEffect, useRef, useState } from "react";
import { Entity, Moon, Sun, Viewer } from "resium";

window.CESIUM_BASE_URL = "/cesium";

export default function Cesium() {
  const [flag, setFlag] = useState(false);
  const [rotating, setRotating] = useState(false);
  const viewerRef = useRef(null);
  const listenerRef = useRef(null);

  const toggleRotate = useCallback(() => {
    setRotating((prev) => !prev);
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    if (rotating) {
      viewer.scene.screenSpaceCameraController.enableInputs = false;
      listenerRef.current = viewer.clock.onTick.addEventListener(() => {
        viewer.scene.camera.rotate(
          Cartesian3.UNIT_Z,
          CesiumMath.toRadians(0.1),
        );
      });
    } else {
      viewer.scene.screenSpaceCameraController.enableInputs = true;
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    }

    return () => {
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.screenSpaceCameraController.enableInputs = true;
      }
    };
  }, [rotating]);

  return (
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
      <Moon show={true} />
      <Sun show={true} glowFactor={1000} />
      <button
        onClick={toggleRotate}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        {rotating ? "Stop" : "Rotate"}
      </button>
    </Viewer>
  );
}
