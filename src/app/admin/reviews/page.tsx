import { createAdminClient } from "@/lib/supabase/server";
import ReviewsClient from "./ReviewsClient";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, products(name, slug), users(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Reviews Moderation</h1>
        <p className="text-ink-muted text-sm mt-1">Approve or reject customer reviews</p>
      </div>
      <ReviewsClient initialReviews={reviews || []} />
    </div>
  );
}
