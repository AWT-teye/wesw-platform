import { createClient } from "@/lib/supabase/server";
import IntroClient, {
  type IntroData,
  type ProfileJson,
  type Story,
  type SnsLinks,
} from "./IntroClient";

export const revalidate = 60;

export default async function IntroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidates")
    .select(
      "name, photo_url, profile_json, stories_json, sns_links, slogan, vision, bio, declaration, office_info, show_slogan, show_vision, show_bio, show_declaration, show_office, show_profile_info, show_stories"
    )
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const flag = (v: unknown) => (v === false ? false : true);
  const profile = (data?.profile_json ?? {}) as ProfileJson;
  const rawStories: Story[] = Array.isArray(data?.stories_json)
    ? (data!.stories_json as Story[])
    : [];
  const stories = rawStories.map((s) => ({
    title: s?.title ?? "",
    body: s?.body ?? "",
    show: typeof s?.show === "boolean" ? s.show : true,
  }));

  const payload: IntroData = {
    name: data?.name ?? "정희윤",
    photoUrl: data?.photo_url ?? "",
    profile,
    stories,
    sns: (data?.sns_links ?? {}) as SnsLinks,
    slogan: (data?.slogan ?? "").trim(),
    vision: (data?.vision ?? "").trim(),
    bio: (data?.bio ?? "").trim(),
    declaration: (data?.declaration ?? "").trim(),
    officeInfo: (data?.office_info ?? "").trim(),
    visibility: {
      slogan: flag(data?.show_slogan),
      vision: flag(data?.show_vision),
      bio: flag(data?.show_bio),
      declaration: flag(data?.show_declaration),
      office: flag(data?.show_office),
      profile: flag(data?.show_profile_info),
      stories: flag(data?.show_stories),
    },
  };

  return <IntroClient data={payload} />;
}
