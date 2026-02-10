import { Pose, Results, POSE_LANDMARKS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

export class PoseDetector {
    private pose: Pose | null = null;
    private camera: Camera | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private onResultsCallback: ((results: Results) => void) | null = null;

    constructor() {
        this.initializePose();
    }

    private initializePose() {
        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        this.pose.onResults(this.onResults.bind(this));
    }

    private onResults(results: Results) {
        if (this.onResultsCallback) {
            this.onResultsCallback(results);
        }
    }

    public setOnResults(callback: (results: Results) => void) {
        this.onResultsCallback = callback;
    }

    public async start(videoElement: HTMLVideoElement) {
        this.videoElement = videoElement;

        if (!this.pose) {
            this.initializePose();
        }

        if (this.videoElement) {
            // Using Camera utils from MediaPipe
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.pose && this.videoElement) {
                        await this.pose.send({ image: this.videoElement });
                    }
                },
                width: 1280,
                height: 720
            });
            await this.camera.start();
        }
    }

    public async stop() {
        if (this.camera) {
            await this.camera.stop();
            this.camera = null;
        }
    }
}
