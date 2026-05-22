import { AdminShell } from "@/components/layout/admin-shell";
import { UsersContent } from "@/components/users/users-content";
import { getUsers } from "@/lib/actions/users";
import { auth } from "@/lib/auth";

export default async function UsersPage() {
  const [users, session] = await Promise.all([getUsers(), auth()]);
  const currentUserId = session?.user?.id ?? "";

  return (
    <AdminShell>
      <UsersContent users={users} currentUserId={currentUserId} />
    </AdminShell>
  );
}
