import { FilesetResolver, PoseLandmarker, FaceLandmarker } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance = null;
let faceLandmarkerInstance = null;
let isLoading = false;
let initPromise = null;

/**
 * Lazy loads and returns self-hosted MediaPipe tasks
 */
export async function getMediaPipeLandmarkers() {
  if (poseLandmarkerInstance && faceLandmarkerInstance) {
    return { poseLandmarker: poseLandmarkerInstance, faceLandmarker: faceLandmarkerInstance };
  }

  if (initPromise) return initPromise;

  initPromise = (async () => {
    isLoading = true;
    try {
      // Point to local self-hosted WASM files
      const vision = await FilesetResolver.forVisionTasks('/mediapipe');

      // 1. PoseLandmarker (lite model for high speed mobile inference)
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/mediapipe/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });

      // 2. FaceLandmarker
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/mediapipe/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1
      });

      poseLandmarkerInstance = poseLandmarker;
      faceLandmarkerInstance = faceLandmarker;
      return { poseLandmarker, faceLandmarker };
    } finally {
      isLoading = false;
    }
  })();

  return initPromise;
}

/**
 * Free memory on unmount
 */
export function cleanupMediaPipe() {
  if (poseLandmarkerInstance) {
    try { poseLandmarkerInstance.close(); } catch (e) {}
    poseLandmarkerInstance = null;
  }
  if (faceLandmarkerInstance) {
    try { faceLandmarkerInstance.close(); } catch (e) {}
    faceLandmarkerInstance = null;
  }
  initPromise = null;
}

