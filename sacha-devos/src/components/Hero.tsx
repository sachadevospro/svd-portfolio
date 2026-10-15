"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo as PhotoData } from "@/lib/content";
import { coverSizes } from "@/lib/sizes";
import { Photo } from "./Photo";
import { useReducedMotion } from "@/lib/hooks";
import { useFitText } from "@/lib/fit";

type Props = {
  photos: PhotoData[];
  videos: { src: string; type: string }[];
  name: string;
  title: string;
  location: string;
  availability: string;
};

const SLIDE_MS = 7000;

export function Hero({ photos, videos, name, title, location, availability }: Props) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false); // other slides load only after the first one
  const [useVideo, setUseVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  useFitText(nameRef, ".hero__line > span");
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const multiple = photos.length > 1 && !useVideo;

  // Respect "reduce motion": no automatic slideshow or video.
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  // A background video is only used when motion is welcome and data is not limited.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setUseVideo(videos.length > 0 && !reduced && !conn?.saveData);
  }, [videos.length, reduced]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, useVideo]);

  // Pause while the tab is in the background; resume unless the visitor paused it.
  const userPaused = useRef(false);
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPlaying(false);
      else if (!userPaused.current && !reduced) setPlaying(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reduced]);

  const current = photos[index];
  const go = (i: number) => setIndex((i + photos.length) % photos.length);

  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__media">
        {useVideo ? (
          <video
            ref={videoRef}
            className="hero__video"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={photos[0]?.fallback}
            aria-hidden="true"
          >
            {videos.map((v) => (
              <source key={v.src} src={v.src} type={v.type} />
            ))}
          </video>
        ) : (
          photos.map((p, i) =>
            i === 0 || ready ? (
              <div key={p.id} className={`hero__slide${i === index ? " is-active" : ""}`} aria-hidden={i !== index}>
                <Photo
                  photo={p}
                  sizes={coverSizes(p.ratio, 100)}
                  fit="cover"
                  priority={i === 0}
                  onLoad={i === 0 ? () => window.setTimeout(() => setReady(true), 1200) : undefined}
                />
              </div>
            ) : null,
          )
        )}
        <div className="hero__shade" />
      </div>

      <div className="hero__frame" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="hero__content">
        <div className="hero__lines">
          <p className="hero__role label">{title}</p>
          <p className="hero__place label">
            <span className="nowrap">
              {availability} <span aria-hidden="true">·</span>
            </span>{" "}
            <span className="nowrap">{location}</span>
          </p>
        </div>
        <h1 ref={nameRef} className="hero__name" aria-label={name}>
          <span className="hero__line" aria-hidden="true">
            <span>{first}</span>
          </span>{" "}
          <span className="hero__line" aria-hidden="true">
            <span>{last}</span>
          </span>
        </h1>
      </div>

      <div className="hero__bar">
        <a className="hero__scroll" href="#selected-work">
          <span className="hero__scroll-line" aria-hidden="true" />
          Scroll
        </a>

        <div className="hero__controls">
          {current && !useVideo && (
            <p className="hero__caption" aria-live="polite">
              <span className="hero__caption-title">{current.title || " "}</span>
              {current.demo && <span className="hero__demo">Demonstration image</span>}
            </p>
          )}
          {multiple && (
            <ol className="hero__dots">
              {photos.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`hero__dot${i === index ? " is-active" : ""}`}
                    aria-label={`Show photograph ${i + 1} of ${photos.length}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => go(i)}
                  >
                    <span
                      className="hero__dot-fill"
                      style={{ "--dur": `${SLIDE_MS}ms`, "--state": playing ? "running" : "paused" } as React.CSSProperties}
                      onAnimationEnd={() => i === index && go(index + 1)}
                    />
                  </button>
                </li>
              ))}
            </ol>
          )}
          {(multiple || useVideo) && (
            <button
              type="button"
              className="hero__play"
              onClick={() => {
                userPaused.current = playing;
                setPlaying(!playing);
              }}
              aria-label={playing ? (useVideo ? "Pause video" : "Pause slideshow") : useVideo ? "Play video" : "Play slideshow"}
            >
              {playing ? (
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
                  <rect x="1" y="1" width="2.2" height="10" fill="currentColor" />
                  <rect x="6.8" y="1" width="2.2" height="10" fill="currentColor" />
                </svg>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
                  <path d="M1.5 1l7.5 5-7.5 5z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
