"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ALT_TEXT = "Portraits à situer géographiquement — l'identité est révélée après ta réponse";

export interface DuoPhotos {
  manSrc: string;
  womanSrc: string;
}

export function DuoPortraitFull({ manSrc, womanSrc }: DuoPhotos) {
  return (
    <div className="eg-portrait eg-portrait--full">
      <Image src={manSrc} alt="" aria-hidden="true" width={480} height={600} priority className="eg-portrait-img" />
      <Image src={womanSrc} alt="" aria-hidden="true" width={480} height={600} priority className="eg-portrait-img" />
    </div>
  );
}

/** Small always-visible copy of the round's photos; tap to see them full-screen again. */
export function DuoPortraitThumbnail({ manSrc, womanSrc }: DuoPhotos) {
  const [expanded, setExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => previousFocus?.focus();
  }, [expanded]);

  return (
    <>
      <button
        type="button"
        className="eg-portrait-thumb"
        onClick={() => setExpanded(true)}
        aria-label="Revoir les portraits en grand"
      >
        <Image src={manSrc} alt="" aria-hidden="true" width={480} height={600} className="eg-portrait-img" />
        <Image src={womanSrc} alt="" aria-hidden="true" width={480} height={600} className="eg-portrait-img" />
      </button>
      {expanded ? (
        <div
          className="eg-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Portraits du duo"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setExpanded(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setExpanded(false);
          }}
        >
          <div className="eg-lightbox-photos">
            <Image
              src={manSrc}
              alt={ALT_TEXT}
              width={480}
              height={600}
              className="eg-lightbox-img"
              onClick={(event) => event.stopPropagation()}
            />
            <Image
              src={womanSrc}
              alt=""
              aria-hidden="true"
              width={480}
              height={600}
              className="eg-lightbox-img"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <button
            type="button"
            className="eg-lightbox-close"
            onClick={() => setExpanded(false)}
            aria-label="Fermer"
            ref={closeButtonRef}
          >
            ✕
          </button>
        </div>
      ) : null}
    </>
  );
}
