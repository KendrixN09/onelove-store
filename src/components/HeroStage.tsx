'use client';

import { useEffect, useRef } from 'react';

export function HeroStage({
  imageOne,
  altOne,
  tagOne,
  imageTwo,
  altTwo,
  tagTwo,
}: {
  imageOne: string;
  altOne: string;
  tagOne: string;
  imageTwo: string;
  altTwo: string;
  tagTwo: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardOneRef = useRef<HTMLDivElement>(null);
  const cardTwoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const stage = stageRef.current;
    const cardOne = cardOneRef.current;
    const cardTwo = cardTwoRef.current;
    if (!stage || !cardOne || !cardTwo) return;

    function onMove(e: MouseEvent) {
      const r = stage!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cardOne!.style.transform = `rotateY(${-16 + px * 14}deg) rotateX(${6 - py * 10}deg) rotateZ(-4deg) translateZ(60px) translate(${px * 10}px,${py * 10}px)`;
      cardTwo!.style.transform = `rotateY(${14 + px * 10}deg) rotateX(${-4 - py * 8}deg) rotateZ(3deg) translateZ(10px) translate(${px * -8}px,${py * -8}px)`;
    }
    function onLeave() {
      cardOne!.style.transform = 'rotateY(-16deg) rotateX(6deg) rotateZ(-4deg) translateZ(40px)';
      cardTwo!.style.transform = 'rotateY(14deg) rotateX(-4deg) rotateZ(3deg) translateZ(0px)';
    }
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    return () => {
      stage.removeEventListener('mousemove', onMove);
      stage.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="hero-stage" ref={stageRef}>
      <div className="grid-floor" />
      <div className="float-orbit orbit-one">
        <div className="float-tag tag-one">{tagOne}</div>
        <div className="float-card one" ref={cardOneRef}>
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />
          <img src={imageOne} alt={altOne} />
        </div>
      </div>
      <div className="float-orbit orbit-two">
        <div className="float-tag tag-two">{tagTwo}</div>
        <div className="float-card two" ref={cardTwoRef}>
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />
          <img src={imageTwo} alt={altTwo} />
        </div>
      </div>
    </div>
  );
}
