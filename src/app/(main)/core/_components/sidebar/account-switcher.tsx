"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import { AlertTriangle, XCircle } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api-utils";

function clearAllCookies() {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name === "sidebar_state") continue;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

async function handleLogout(router: ReturnType<typeof useRouter>) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  let login_id = undefined;
  try {
    if (user) {
      const parsed = JSON.parse(user);
      login_id = parsed?.login_id;
    }
  } catch { }
  if (token && login_id) {
    try {
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/log-out/`;
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, login_id }),
      });
    } catch (e) {
      // Ignore API errors, always clear client state
    }
  }
  clearAllCookies();
  sessionStorage.clear();
  localStorage.clear();
  router.push("/auth/v2/login");
}

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const [activeUser, setActiveUser] = useState(users[0]);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  const userInfo = (() => {
    try {
      const userString = localStorage.getItem("user");
      console.log("🔍 Debug: Raw user string from localStorage:", userString);
      const parsed = userString ? JSON.parse(userString) : {};
      console.log("🔍 Debug: Parsed user object:", parsed);
      return parsed;
    } catch (e) {
      console.log("🔍 Debug: Error parsing user from localStorage:", e);
      return {};
    }
  })();

  const userFirstName = userInfo.first_name || activeUser?.name || "User";
  console.log("🔍 Debug: Final userFirstName for logout dialog:", userFirstName);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={activeUser.avatar || undefined} alt={activeUser.name} />
            <AvatarFallback className="rounded-lg">{getInitials(activeUser.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
          {users.map((user) => (
            <DropdownMenuItem
              key={user.email}
              className={cn("p-0", user.id === activeUser.id && "bg-accent/50 border-l-primary border-l-2")}
              onClick={() => setActiveUser(user)}
            >
              <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
                <Avatar className="size-9 rounded-lg">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs capitalize">{user.role}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent
          className="w-[90vw] max-w-sm sm:max-w-md p-4 sm:p-6 rounded-lg mx-auto"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg text-center sm:text-left">
              Logging Out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-center sm:text-left leading-relaxed">
              {`Hey ${userFirstName}, are you sure you want to log out?`} <br />
              You’ll need to log in again to access your FieldLink workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 w-full">
            {/* Cancel Button */}
            <AlertDialogCancel className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2">
              <XCircle className="h-4 w-4 text-gray-500" />
              Cancel
            </AlertDialogCancel>

            {/* Log out Button */}
            <Button
              variant="outline"
              onClick={async () => {
                setShowLogoutDialog(false);
                await handleLogout(router);
              }}
              className={cn(
                "flex items-center justify-center gap-2 w-full sm:w-auto border-red-600 text-red-600",
                "hover:bg-red-50 hover:text-red-700 hover:border-red-700",
                "focus-visible:ring-red-500 focus-visible:ring-offset-2"
              )}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
