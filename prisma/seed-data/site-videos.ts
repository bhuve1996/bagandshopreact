/** Initial homepage videos — written to DB by db:seed only (not used at runtime). */
const DEMO_VIDEOS = {
  flower:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  friday:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
  bbb: "https://www.w3schools.com/html/mov_bbb.mp4",
  sample:
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
  reel: "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
  elephants:
    "https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4",
} as const;

const SEED_VIDEOS = [
  {
    id: "seed-mock-video-1",
    title: "Everyday carry, elevated",
    src: DEMO_VIDEOS.flower,
    href: "/collections",
  },
  {
    id: "seed-mock-video-2",
    title: "Designed for how you move",
    src: DEMO_VIDEOS.friday,
    href: "/collections/new-arrivals",
  },
  {
    id: "seed-mock-video-3",
    title: "Details that last",
    src: DEMO_VIDEOS.bbb,
    href: "/collections/gift-sets",
  },
  {
    id: "seed-mock-video-4",
    title: "Work anywhere essentials",
    src: DEMO_VIDEOS.sample,
    href: "/collections/work-anywhere",
  },
  {
    id: "seed-mock-video-5",
    title: "Built for the commute",
    src: DEMO_VIDEOS.reel,
    href: "/collections/everyday",
  },
  {
    id: "seed-mock-video-6",
    title: "Gift-ready favourites",
    src: DEMO_VIDEOS.elephants,
    href: "/collections/gift-sets",
  },
] as const;

export const seedSiteVideos = SEED_VIDEOS.map((v, i) => ({
  id: v.id,
  title: v.title,
  src: v.src,
  poster: "/products/_placeholders/placeholder-bagnshop.png",
  href: v.href,
  sortOrder: i,
  active: true,
}));
