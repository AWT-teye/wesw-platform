import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import CandidateForm from "./CandidateForm";

export const dynamic = "force-dynamic";

type ProfileJson = {
  title?: string;
  birth?: string;
  hometown?: string;
  residence?: string;
  military?: string;
  election?: string;
  education?: string;
  awards?: string;
  career?: string;
};
type Story = { title?: string; body?: string; show?: boolean };

export default async function CandidateEditPage() {
  const c = await getOrCreatePrimaryCandidate();
  const profile = ((c.profile_json ?? {}) as ProfileJson) || {};
  const stories = Array.isArray(c.stories_json)
    ? (c.stories_json as Story[])
    : [];

  // 누락된 show_* 컬럼은 아직 마이그레이션 전일 수 있으므로 안전 기본값 true.
  const showFlag = (v: unknown) => (v === false ? false : true);
  const showStory = (s: Story | undefined) =>
    s && typeof s.show === "boolean" ? s.show : true;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-extrabold">후보 소개 편집</h1>
      <CandidateForm
        initial={{
          name: c.name ?? "",
          position_type: c.position_type ?? "mayor",
          district: c.district ?? "",
          photo_url: c.photo_url ?? "",
          bio: c.bio ?? "",
          declaration: c.declaration ?? "",
          vision: c.vision ?? "",
          slogan: c.slogan ?? "",
          office_info: c.office_info ?? "",
          profile_title: profile.title ?? "",
          profile_birth: profile.birth ?? "",
          profile_hometown: profile.hometown ?? "",
          profile_residence: profile.residence ?? "",
          profile_military: profile.military ?? "",
          profile_election: profile.election ?? "",
          profile_education: profile.education ?? "",
          profile_awards: profile.awards ?? "",
          profile_career: profile.career ?? "",
          story1_title: stories[0]?.title ?? "",
          story1_body: stories[0]?.body ?? "",
          story2_title: stories[1]?.title ?? "",
          story2_body: stories[1]?.body ?? "",
          story3_title: stories[2]?.title ?? "",
          story3_body: stories[2]?.body ?? "",
          show_slogan: showFlag(c.show_slogan),
          show_vision: showFlag(c.show_vision),
          show_bio: showFlag(c.show_bio),
          show_declaration: showFlag(c.show_declaration),
          show_office: showFlag(c.show_office),
          show_profile_info: showFlag(c.show_profile_info),
          show_stories: showFlag(c.show_stories),
          show_story1: showStory(stories[0]),
          show_story2: showStory(stories[1]),
          show_story3: showStory(stories[2]),
        }}
      />
    </div>
  );
}
