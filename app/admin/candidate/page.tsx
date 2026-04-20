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
type Story = { title?: string; body?: string };

export default async function CandidateEditPage() {
  const c = await getOrCreatePrimaryCandidate();
  const profile = ((c.profile_json ?? {}) as ProfileJson) || {};
  const stories = Array.isArray(c.stories_json)
    ? (c.stories_json as Story[])
    : [];

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
        }}
      />
    </div>
  );
}
