"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface WebcamHandle {
  capture: () => string | null;
}

const Webcam = forwardRef<WebcamHandle>(function Webcam(_props, ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        setError("カメラにアクセスできません");
      });

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useImperativeHandle(ref, () => ({
    capture: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg", 0.8);
    },
  }));

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {error ? (
        <p className="text-sm text-zinc-400">{error}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
});

export default Webcam;
