import { redirect } from "next/navigation";

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchString = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      searchString.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(v => searchString.append(key, v));
    }
  });

  const query = searchString.toString();
  redirect(`/ads${query ? `?${query}` : ""}`);
}
