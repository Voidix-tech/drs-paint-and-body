# Hero video assets

Place the generated transformation intro here as `hero-intro.mp4`. Optionally add the matching headlights-only loop as `hero-idle.mp4`.

Set in `.env.local`:

```dotenv
NEXT_PUBLIC_HERO_VIDEO_URL=/videos/hero-intro.mp4
NEXT_PUBLIC_HERO_IDLE_VIDEO_URL=/videos/hero-idle.mp4
```

Then restart the development server (or rebuild a production preview). With no clip configured, the current generated photo stays as the hero background. The intro plays once; its end triggers the GSAP text reveal. The optional idle clip then loops. Reduced-motion visitors receive the still image and visible content. Video files have not been supplied yet.
