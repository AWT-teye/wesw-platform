import { createClient } from "@/lib/supabase/server";
import AdminObserversClient, {
  type Application,
  type Station,
} from "./AdminObserversClient";

export const dynamic = "force-dynamic";

export default async function AdminObserversPage() {
  const supabase = await createClient();

  const [stationsRes, appsRes] = await Promise.all([
    supabase
      .from("polling_stations")
      .select(
        "id, district, station_name, address, max_observers, current_observer_count"
      )
      .eq("is_active", true)
      .order("district")
      .order("station_name"),
    supabase
      .from("observer_applications")
      .select(
        "id, station_id, name, phone, district, residence, is_party_member, status, created_at"
      )
      .order("created_at", { ascending: false }),
  ]);

  const stations = (stationsRes.data ?? []) as Station[];
  const applications = (appsRes.data ?? []) as Application[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">참관인 신청 관리</h1>
      <p className="mt-2 text-sm text-gray-600">
        신청 접수된 참관인을 관리합니다. 취소 처리하면 해당 투표소의 공석이 즉시
        복구됩니다.
      </p>

      {appsRes.error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {appsRes.error.message}
        </p>
      )}

      <div className="mt-6">
        <AdminObserversClient
          stations={stations}
          applications={applications}
        />
      </div>
    </div>
  );
}
