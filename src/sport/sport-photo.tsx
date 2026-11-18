"use client";

import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { knownPhoto, loadPhotos } from "./photo-store";

/** Displayable source of a session photo: inline as is, or read from the device photo store. */
export function usePhotoSrc(photo: string): string | undefined {
  const known = knownPhoto(photo);
  const [loaded, setLoaded] = useState<{ photo: string; src?: string } | null>(null);
  useEffect(() => {
    if (known) return;
    let live = true;
    loadPhotos([photo])
      .then((found) => {
        if (live) setLoaded({ photo, src: found.get(photo) });
      })
      .catch(() => {
        if (live) setLoaded({ photo });
      });
    return () => {
      live = false;
    };
  }, [photo, known]);
  return known ?? (loaded?.photo === photo ? loaded.src : undefined);
}

/** `<img>` for a session photo, whether it is inline (friends, cloud) or a reference to this device. */
export function SportPhoto({
  src,
  alt,
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; alt: string }) {
  const photo = usePhotoSrc(src);
  // eslint-disable-next-line @next/next/no-img-element -- local data URL, nothing to optimize
  return photo ? <img src={photo} alt={alt} {...props} /> : null;
}
