import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return (
    <div className="bg-white rounded-brand shadow-card p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Profile Details</h1>
      
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-ink/8">
        <div className="w-20 h-20 rounded-full bg-cream-dark border-4 border-white shadow-soft overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-muted font-bold text-2xl">
              {user?.full_name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold text-ink text-xl">{user?.full_name}</h2>
          <p className="text-ink-muted mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">
        <div className="bg-cream-dark/30 p-5 rounded-xl border border-ink/10">
          <h3 className="font-semibold text-ink mb-2">Account Information</h3>
          <p className="text-sm text-ink-muted">
            Your profile information is synced automatically from your sign-in provider. To update your name or email, please use the settings in your authentication provider.
          </p>
        </div>
        
        {/* Placeholder for future features like saved addresses */}
        <div>
          <h3 className="font-display font-semibold text-ink text-lg mb-4">Saved Addresses</h3>
          <p className="text-sm text-ink-muted bg-cream-dark/30 p-4 rounded-xl border border-ink/10">
            You have no saved addresses. Addresses will be saved automatically when you place an order.
          </p>
        </div>
      </div>
    </div>
  );
}
