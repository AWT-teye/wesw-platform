import { getOrCreatePrimaryCandidate } from "@/lib/candidate";
import CandidateForm from "./CandidateForm";

export const dynamic = "force-dynamic";

export default async function CandidateEditPage() {
  const c = await getOrCreatePrimaryCandidate();

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
        }}
      />
    </div>
  );
}
