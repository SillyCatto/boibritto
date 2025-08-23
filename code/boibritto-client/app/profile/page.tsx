import UserDashboard from "@/components/profile/UserDashboard";
import GenreStats from "@/components/profile/GenreStats";

export default function ProfilePage() {
  return (
    <div>
      <UserDashboard />
      <div className="grid md:grid-cols-2 gap-6">
        {/* Genre Stats Component */}
        <GenreStats />
      </div>
    </div>
  );
};