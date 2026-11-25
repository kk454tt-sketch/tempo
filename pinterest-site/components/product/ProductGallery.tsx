'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

const MAX_THUMBNAILS = 3;

/**
 * Both layouts use the same `sizes`, so whichever image the browser preloads
 * resolves to the same URL on desktop and mobile. 526px = (1100px - 48px gap) / 2.
 */
const IMAGE_SIZES = '(min-width: 768px) 526px, 100vw';

function imageAlt(name: string, index: number): string {
  return index === 0 ? name : `${name} - image ${index + 1}`;
}

/**
 * Product gallery.
 * Desktop (768px and up): a 4:3 main image with up to 3 equal thumbnails; the
 * first thumbnail is the main image, and the thumbnails are hidden when there
 * is only one image.
 * Mobile: a horizontal scroll-snap carousel with dot indicators.
 */
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [slide, setSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[16px] border border-[#E2E8F0] bg-surface-container text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] leading-none" aria-hidden="true">
          image
        </span>
      </div>
    );
  }

  const thumbnails = images.slice(0, MAX_THUMBNAILS);

  function handleScroll() {
    const element = carouselRef.current;
    if (!element || element.clientWidth === 0) return;
    setSlide(Math.round(element.scrollLeft / element.clientWidth));
  }

  function goToSlide(index: number) {
    const element = carouselRef.current;
    if (!element) return;
    element.scrollTo({ left: index * element.clientWidth, behavior: 'smooth' });
  }

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-surface-container">
          <Image
            src={thumbnails[selected] ?? images[0]}
            alt={imageAlt(name, selected)}
            fill
            priority={selected === 0}
            sizes={IMAGE_SIZES}
            className="object-cover"
          />
        </div>

        {thumbnails.length > 1 && (
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {thumbnails.map((src, index) => {
              const isSelected = index === selected;
              return (
                <li key={src}>
                  <button
                    type="button"
                    aria-label={`Show image ${index + 1} of ${thumbnails.length}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(index)}
                    className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[12px] border bg-surface-container transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
                      isSelected
                        ? 'border-[#F59E0B] ring-1 ring-[#F59E0B]'
                        : 'border-[#E2E8F0] hover:border-primary/40'
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="170px" className="object-cover" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Product images"
          tabIndex={0}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[16px] border border-[#E2E8F0] bg-surface-container [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <div
              key={src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
            >
              <Image
                src={src}
                alt={imageAlt(name, index)}
                fill
                priority={index === 0}
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="mt-2 flex justify-center">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to image ${index + 1} of ${images.length}`}
                aria-current={index === slide ? 'true' : undefined}
                onClick={() => goToSlide(index)}
                className="flex h-6 items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-all ${
                    index === slide ? 'w-6 bg-primary' : 'w-2 bg-[#CBD5E1]'
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
