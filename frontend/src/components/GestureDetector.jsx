import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic, X } from "lucide-react";
import { toast } from "react-toastify";

// MediaPipe
import { Hands } from "@mediapipe/hands";

export const GestureDetector = ({ onGesture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const rafRef = useRef(null);
  const prevWristX = useRef(null);
  const prevTime = useRef(null);

  const [detectedGesture, setDetectedGesture] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [gestureStatus, setGestureStatus] = useState("Waiting for gesture...");
  const [listening, setListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true); // keep UI style same

  // Start camera using getUserMedia (keeps original appearance/behavior)
  useEffect(() => {
    if (!isEnabled) return;
    let localStream;
    const start = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
        toast.success("🎥 Camera activated for gesture control");
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Could not access camera for gesture detection");
      }
    };
    start();

    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
    };
  }, [isEnabled]);

  // MediaPipe Hands setup and frame feeding
  useEffect(() => {
    if (!isEnabled || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    handsRef.current = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    // Initialize MediaPipe with optimized settings for better detection
    handsRef.current.setOptions({
      maxNumHands: 1,
      modelComplexity: 1, // Increased for better accuracy
      minDetectionConfidence: 0.5, // Lowered for more consistent detection
      minTrackingConfidence: 0.5, // Lowered for better tracking
    });

    handsRef.current.onResults((results) => {
      // clear canvas (we keep canvas hidden for styling parity)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        prevWristX.current = null;
        return;
      }

      const landmarks = results.multiHandLandmarks[0];
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const indexMid = landmarks[7];
      const middleTip = landmarks[12];
      const middleMid = landmarks[11];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      const now = performance.now();
      const dt = prevTime.current ? (now - prevTime.current) / 1000 : 0.016;
      prevTime.current = now;

      if (!isProcessing) {
        // Helper functions for gesture detection
        const isFingerRaised = (tipLandmark, midLandmark) => {
          return tipLandmark.y < midLandmark.y;
        };

        const fingersDistance = (tip1, tip2) => {
          return Math.hypot(tip1.x - tip2.x, tip1.y - tip2.y);
        };

        // Play: Only index finger raised
        const isIndexRaised = isFingerRaised(indexTip, indexMid);
        const isMiddleDown = !isFingerRaised(middleTip, middleMid);
        const isIndexAlone = fingersDistance(indexTip, middleTip) > 0.1;
        
        if (isIndexRaised && isMiddleDown && isIndexAlone && indexTip.y < wrist.y - 0.15) {
          triggerGesture("👆 Play");
        }

        // Pause: Palm facing camera with fingers spread
        const areFingersSeparated = fingersDistance(indexTip, middleTip) > 0.08 &&
                                  fingersDistance(middleTip, ringTip) > 0.08 &&
                                  fingersDistance(ringTip, pinkyTip) > 0.08;
        const areAllFingersRaised = isFingerRaised(indexTip, indexMid) &&
                                  isFingerRaised(middleTip, middleMid);
        
        if (areFingersSeparated && areAllFingersRaised) {
          triggerGesture("✋ Pause");
        }

        // Next/Previous: Horizontal hand swipe
        if (prevWristX.current != null) {
          const velX = (wrist.x - prevWristX.current) / dt;
          const swipeThreshold = 1.0;
          const isHorizontalMove = Math.abs(wrist.y - prevWristX.current) < 0.1;
          
          if (isHorizontalMove) {
            if (velX > swipeThreshold) {
              triggerGesture("👈 Previous");
            } else if (velX < -swipeThreshold) {
              triggerGesture("👉 Next");
            }
          }
        }

        // Camera Off: Victory sign (index and middle fingers separated)
        const isVictorySign = isFingerRaised(indexTip, indexMid) &&
                            isFingerRaised(middleTip, middleMid) &&
                            fingersDistance(indexTip, middleTip) > 0.05 &&
                            indexTip.y < wrist.y - 0.15;
        
        if (isVictorySign) {
          triggerGesture("✌️ Off Camera");
        }
      }

      prevWristX.current = wrist.x;
    });

    // Frame feeder using requestAnimationFrame (feeds the current video frame to MediaPipe)
    const feedFrame = async () => {
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(feedFrame);
        return;
      }
      try {
        await handsRef.current.send({ image: video });
      } catch (e) {
        // ignore transient errors
      }
      rafRef.current = requestAnimationFrame(feedFrame);
    };

    feedFrame();

    const handleKeyPress = (e) => {
      if (!isEnabled) return;
      switch (e.key.toLowerCase()) {
        case "p":
          triggerGesture("👆 Play");
          break;
        case "s":
          triggerGesture("✋ Pause");
          break;
        case "n":
          triggerGesture("👉 Next");
          break;
        case "b":
          triggerGesture("👈 Previous");
          break;
        case "o":
          triggerGesture("✌️ Off Camera");
          break;
      }
    };

    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (handsRef.current) handsRef.current.close();
    };
  }, [isEnabled, isProcessing, onGesture]);

  const triggerGesture = (gesture) => {
    if (isProcessing) return;

    if (gesture === "✌️ Off Camera") {
      toast.info("Camera turned off");
      setGestureStatus("Camera Off");
      setDetectedGesture("✌️ Off Camera");
      onGesture("CameraOff");
      setIsEnabled(false);
      return;
    }

    setDetectedGesture(gesture);
    setGestureStatus(`Detected: ${gesture}`);
    setIsProcessing(true);
    onGesture(gesture);
    toast.success(`Gesture recognized: ${gesture}`);

    setTimeout(() => {
      setDetectedGesture("");
      setGestureStatus("Waiting for gesture...");
      setIsProcessing(false);
    }, 1400);
  };

  // 🎤 VOICE COMMAND CONTROL (kept unchanged)
  useEffect(() => {
    if (!isEnabled) return;

    if (!("webkitSpeechRecognition" in window)) {
      // silently ignore if not supported
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setListening(true);
      toast.info("🎤 Voice control activated");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

      if (transcript.includes("play")) onGesture("👆 Play");
      else if (transcript.includes("pause") || transcript.includes("stop"))
        onGesture("✋ Pause");
      else if (transcript.includes("next")) onGesture("👉 Next");
      else if (transcript.includes("previous") || transcript.includes("back"))
        onGesture("👈 Previous");
      else if (transcript.includes("camera off")) {
        onGesture("✌️ Off Camera");
        setIsEnabled(false);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice recognition error");
    };

    recognition.onend = () => setListening(false);

    recognition.start();

    return () => recognition.stop();
  }, [isEnabled, onGesture]);

  if (!isEnabled) return null;

  return (
    <Card className="fixed bottom-20 right-4 sm:right-6 p-4 bg-card/95 backdrop-blur-sm shadow-xl z-50 w-[calc(100vw-2rem)] sm:w-80 border-2 border-primary/20">
      <div className="flex justify-between items-center mb-3">
        <Badge className="bg-success/90 text-success-foreground">
          <Camera className="h-3 w-3 mr-1" /> Active
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setIsEnabled(false);
            toast.info("Gesture control disabled");
          }}
          className="h-6 w-6 text-gray-500 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-2 text-xs text-muted-foreground">
        <strong>Status:</strong>{" "}
        <span className="text-success">{gestureStatus}</span>
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-40 rounded-lg bg-muted object-cover"
        />
        <canvas ref={canvasRef} width={320} height={240} className="hidden" />
      </div>

      <div className="mt-3 text-xs text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground mb-1">Supported gestures:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { gesture: "👆 Play", key: "P", desc: "Say 'play'" },
            { gesture: "✋ Pause", key: "S", desc: "Say 'pause'" },
            { gesture: "👉 Next", key: "N", desc: "Say 'next'" },
            { gesture: "👈 Prev", key: "B", desc: "Say 'previous'" },
            { gesture: "✌️ Off Camera", key: "O", desc: "Say 'camera off'" },
          ].map(({ gesture, key, desc }) => (
            <div
              key={gesture}
              className={`p-2 rounded-lg border transition-all ${
                detectedGesture.includes(gesture.split(" ")[0])
                  ? "bg-accent border-accent-foreground"
                  : "bg-muted/30 border-border"
              }`}
            >
              <div className="font-semibold">{gesture}</div>
              <div className="text-[10px] opacity-70">{desc}</div>
              <div className="text-[10px] opacity-50">Press {key}</div>
            </div>
          ))}
        </div>

        {listening && (
          <div className="flex items-center justify-center mt-2 text-success text-[11px]">
            <Mic className="h-3 w-3 mr-1 animate-pulse" /> Listening...
          </div>
        )}
      </div>
    </Card>
  );
};