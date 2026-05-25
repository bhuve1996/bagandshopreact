import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Legacy shop-by-device URLs → /collections/[slug] */
export default async function DeviceCollectionRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/collections/${slug}`);
}
