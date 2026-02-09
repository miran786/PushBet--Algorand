import 'long';
import '../../node_modules/@mediapipe/pose/pose.js';

console.log('MediaPipe shim: checking window.Pose', window.Pose);

const Pose = window.Pose;
const POSE_CONNECTIONS = window.POSE_CONNECTIONS;
const POSE_LANDMARKS = window.POSE_LANDMARKS;
const POSE_LANDMARKS_LEFT = window.POSE_LANDMARKS_LEFT;
const POSE_LANDMARKS_RIGHT = window.POSE_LANDMARKS_RIGHT;
const POSE_LANDMARKS_NEUTRAL = window.POSE_LANDMARKS_NEUTRAL;

export {
    Pose,
    POSE_CONNECTIONS,
    POSE_LANDMARKS,
    POSE_LANDMARKS_LEFT,
    POSE_LANDMARKS_RIGHT,
    POSE_LANDMARKS_NEUTRAL
};
