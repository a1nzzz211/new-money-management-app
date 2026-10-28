import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { LogOutIcon } from "lucide-react";
import type { Profile } from "@/lib/types";

export function Topbar({
  profile,
  leftElement,
}: {
  profile: Profile | null;
  leftElement?: React.ReactNode;
}) {
  const name = profile?.display_name ?? "Anda";
  const initials = (profile?.display_name ?? "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:px-6 bg-card/60 backdrop-blur">
      <div className="flex items-center gap-2">{leftElement}</div>
      <div className="flex items-center gap-2">
        <div
          className="flex cursor-default select-none items-center"
          aria-label={`Profil ${name}`}
          title={name}
        >
          <Avatar size="sm">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={name} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            title="Keluar"
            aria-label="Keluar"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
