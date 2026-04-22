/**
 * MediaPipe FaceMesh loader
 *
 * Loads the FaceMesh model from the official CDN (no self-hosting needed).
 * Returns a singleton instance so the 15MB WASM model is only loaded once
 * per page session.
 *
 * CDN: https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh
 */

let faceMeshInstance = null;
let loadPromise = null;

/**
 * Returns a ready-to-use FaceMesh instance.
 * Safe to call multiple times — returns the cached instance after first load.
 */
export async function getFaceMesh() {
  if (faceMeshInstance) return faceMeshInstance;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Dynamically inject the MediaPipe scripts so they only load when needed
    const scripts = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
    ];

    let loaded = 0;

    function onScriptLoad() {
      loaded++;
      if (loaded < scripts.length) return;

      // All scripts loaded — initialise FaceMesh
      try {
        // eslint-disable-next-line no-undef
        const fm = new window.FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        fm.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        fm.onResults((results) => {
          // Results are handled per-call via the callback set before send()
          fm._lastResults = results;
        });

        fm.initialize().then(() => {
          faceMeshInstance = fm;
          resolve(fm);
        }).catch(reject);
      } catch (err) {
        reject(err);
      }
    }

    function onScriptError(e) {
      reject(new Error(`Failed to load MediaPipe script: ${e.target?.src}`));
    }

    scripts.forEach((src) => {
      // Don't re-add if already present
      if (document.querySelector(`script[src="${src}"]`)) {
        loaded++;
        if (loaded === scripts.length) onScriptLoad();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.crossOrigin = "anonymous";
      s.onload  = onScriptLoad;
      s.onerror = onScriptError;
      document.head.appendChild(s);
    });
  });

  return loadPromise;
}

/**
 * Run FaceMesh on a canvas element.
 * Returns the array of 468 normalised landmarks, or null if no face detected.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Array|null>}
 */
export async function detectLandmarks(canvas) {
  const fm = await getFaceMesh();

  return new Promise((resolve, reject) => {
    fm.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        resolve(results.multiFaceLandmarks[0]);
      } else {
        resolve(null);
      }
    });

    fm.send({ image: canvas }).catch(reject);
  });
}

/**
 * Reset the cached instance (useful for testing / cleanup).
 */
export function resetFaceMesh() {
  if (faceMeshInstance) {
    try { faceMeshInstance.close(); } catch {}
  }
  faceMeshInstance = null;
  loadPromise = null;
}
