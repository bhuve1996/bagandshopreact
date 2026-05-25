import Image from "next/image";
import Link from "next/link";

const instagramPosts = [
  "photo-1523275335684-37898b6baf30",
  "photo-1590874103328-eac38a683ce7",
  "photo-1586023492125-27b2c045efd7",
  "photo-1601784551446-20c9e07cdbdb",
  "photo-1553062407-98eeb64c6a62",
  "photo-1601784551446-20c9e07cdbdb",
].map(
  (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&h=400&q=80`
);

export function InstagramSection() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            @bagandshop
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            Follow the lifestyle
          </h2>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            View on Instagram
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {instagramPosts.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-xl"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="200px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
