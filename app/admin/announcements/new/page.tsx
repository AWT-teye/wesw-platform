import AnnouncementForm from "../AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold">새 한마디</h1>
      <AnnouncementForm />
    </div>
  );
}
