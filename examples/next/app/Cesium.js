"use client";

import "@cesium/widgets/Source/widgets.css";
import { Cartesian3, Color, Math as CesiumMath, Matrix3, Transforms } from "cesium";
import { useCallback, useEffect, useRef, useState } from "react";
import { Entity, Moon, Sun, Viewer } from "resium";

window.CESIUM_BASE_URL = "/cesium";

const scratchV = new Matrix3();
const scratchVT = new Matrix3();

function getViewRotation(camera) {
  const r = camera.rightWC;
  const u = camera.upWC;
  const d = camera.directionWC;
  return new Matrix3(
    r.x, r.y, r.z,
    u.x, u.y, u.z,
    -d.x, -d.y, -d.z,
  );
}

const origIcrfToFixed = Transforms.computeIcrfToFixedMatrix;
const origTemeToFixed = Transforms.computeTemeToPseudoFixedMatrix;

let V0 = null;
let activeCamera = null;

function correctTransform(T) {
  if (!T || !V0 || !activeCamera) return T;
  const Vcurr = getViewRotation(activeCamera);
  Matrix3.transpose(Vcurr, scratchV);
  Matrix3.multiply(V0, T, scratchVT);
  return Matrix3.multiply(scratchV, scratchVT, T);
}

Transforms.computeTemeToPseudoFixedMatrix = function (date, result) {
  const T = origTemeToFixed(date, result);
  return correctTransform(T);
};

Transforms.computeIcrfToFixedMatrix = function (date, result) {
  const T = origIcrfToFixed(date, result);
  return correctTransform(T);
};

export default function Cesium() {
  const [flag, setFlag] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [speed, setSpeed] = useState(500);
  const speedRef = useRef(500);
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
      const camera = viewer.scene.camera;

      if (!V0) {
        V0 = getViewRotation(camera);
      }
      activeCamera = camera;

      const EARTH_DEG_PER_SEC = 360 / 86400;
      let lastTime = performance.now();
      listenerRef.current = viewer.clock.onTick.addEventListener(() => {
        const now = performance.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        const degPerSec = EARTH_DEG_PER_SEC * speedRef.current;
        camera.rotate(Cartesian3.UNIT_Z, CesiumMath.toRadians(degPerSec * dt));
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
        // name="Tokyo"
        name="LCF"
        // position={Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
        position={Cartesian3.fromDegrees(34.20969, -118.200139, 100)}
        point={{ pixelSize: 20, color: Color.WHITE }}
        description="hoge"
        onClick={() => setFlag((f) => !f)}
      />
      {flag && (
        <Entity
          // position={Cartesian3.fromDegrees(139.767052, 34.681167, 100)}
          position={Cartesian3.fromDegrees(34.20969, -118.200139, 100)}
          point={{ pixelSize: 20, color: Color.RED }}
        />
      )}
      <Moon show={true}/>
      <Sun show={true} glowFactor={1000}/>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: 6,
        }}
      >
        <button
          onClick={toggleRotate}
          style={{ padding: "6px 14px", cursor: "pointer" }}
        >
          {rotating ? "Stop" : "Rotate"}
        </button>
        <input
          type="range"
          min={1}
          max={1000}
          value={speed}
          onChange={(e) => {
            const v = Number(e.target.value);
            setSpeed(v);
            speedRef.current = v;
          }}
          style={{ width: 140 }}
        />
        <span style={{ color: "white", fontSize: 13, minWidth: 50 }}>
          {speed}x
        </span>
      </div>
    </Viewer>
  );
}
