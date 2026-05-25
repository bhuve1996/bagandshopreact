import Image from "next/image";
import Link from "next/link";
import { devices } from "@/lib/mock-data";

export function ShopByDevice() {
  return (
    <section className="section-padding border-y border-border bg-card">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shop by device
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">
            Perfect fit for your tech
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6">
          {devices.map((device) => (
            <Link
              key={device.id}
              href={`/collections/${device.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="card-premium relative aspect-square w-full max-w-[120px] overflow-hidden sm:max-w-none">
                <Image
                  src={device.image}
                  alt={device.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="120px"
                />
              </div>
              <span className="mt-3 text-xs font-medium sm:text-sm">
                {device.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
