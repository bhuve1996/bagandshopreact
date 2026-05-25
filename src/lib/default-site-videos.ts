import type { SiteVideoSlide } from "@/services/site-videos";

/** CC0 / demo MP4s with anonymous read access (Google gtv bucket is no longer public). */
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

/** Public sample clips — replace via Admin → Videos when you have real assets. */
export const defaultSiteVideos: SiteVideoSlide[] = [
  {
    id: "mock-video-1",
    title: "Everyday carry, elevated",
    src: DEMO_VIDEOS.flower,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections",
  },
  {
    id: "mock-video-2",
    title: "Designed for how you move",
    src: DEMO_VIDEOS.friday,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections/new-arrivals",
  },
  {
    id: "mock-video-3",
    title: "Details that last",
    src: DEMO_VIDEOS.bbb,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections/gift-sets",
  },
  {
    id: "mock-video-4",
    title: "Work anywhere essentials",
    src: DEMO_VIDEOS.sample,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections/work-anywhere",
  },
  {
    id: "mock-video-5",
    title: "Built for the commute",
    src: DEMO_VIDEOS.reel,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections/everyday",
  },
  {
    id: "mock-video-6",
    title: "Gift-ready favourites",
    src: DEMO_VIDEOS.elephants,
    poster: "/products/_placeholders/category.jpg",
    href: "/collections/gift-sets",
  },
];

export const seedSiteVideos = defaultSiteVideos.map((v, i) => ({
  id: `seed-${v.id}`,
  title: v.title,
  src: v.src,
  poster: v.poster ?? null,
  href: v.href ?? null,
  sortOrder: i,
  active: true,
}));
