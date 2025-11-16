"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function JoinTrip({ params } : { params: { id: string } }) {
  const router = useRouter();
  const tripId = params.id;

  useEffect(() => {
    joinTrip();
  }, []);

  async function joinTrip() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // redirect to login but come back
      router.push(`/login?redirect=/join/trip/${tripId}`);
      return;
    }

    // Add user as traveller
    await supabase.from("trip_users").insert([
      { trip_id: tripId, user_id: user.id, role: "traveller" }
    ]).match(() => {}); // ignore "duplicate" error

    router.push(`/trip/${tripId}`);
  }

  return (
    <div className="p-4 text-center">
      Joining trip...
    </div>
  );
}
