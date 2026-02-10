import { NormalizedLandmarkList, POSE_LANDMARKS } from "@mediapipe/pose";

export enum PushupState {
    UP = "UP",
    DOWN = "DOWN",
}

export class RepCounter {
    private count = 0;
    private state: PushupState = PushupState.UP;
    private thresholdDown = 90; // Angle threshold for down position
    private thresholdUp = 160;   // Angle threshold for up position

    // Callback for when a rep is counted
    private onRepCount?: (count: number) => void;

    constructor(onRepCount?: (count: number) => void) {
        this.onRepCount = onRepCount;
    }

    public processLandmarks(landmarks: NormalizedLandmarkList) {
        const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
        const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
        const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];

        const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
        const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
        const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

        // Calculate angles
        const leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
        const rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);

        // Average angle
        const avgAngle = (leftAngle + rightAngle) / 2;

        if (this.state === PushupState.UP) {
            if (avgAngle < this.thresholdDown) {
                this.state = PushupState.DOWN;
            }
        } else if (this.state === PushupState.DOWN) {
            if (avgAngle > this.thresholdUp) {
                this.state = PushupState.UP;
                this.count++;
                if (this.onRepCount) {
                    this.onRepCount(this.count);
                }
            }
        }

        return {
            count: this.count,
            state: this.state,
            angle: avgAngle,
        };
    }

    private calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);

        if (angle > 180.0) {
            angle = 360 - angle;
        }

        return angle;
    }

    public getCount() {
        return this.count;
    }

    public reset() {
        this.count = 0;
        this.state = PushupState.UP;
    }
}
