import { NextResponse } from "next/server";
import { getActiveSiteVideos } from "@/services/site-videos";

export async function GET() {
  const videos = await getActiveSiteVideos();
  return NextResponse.json(videos);
}
