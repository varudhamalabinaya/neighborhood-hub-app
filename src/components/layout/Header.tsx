
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would navigate to search results
    console.log("Search for:", searchQuery);
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-1 w-8 h-8 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold text-primary hidden md:block">LocalLens</h1>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex relative max-w-sm">
          <Input
            type="search"
            placeholder="Search posts..."
            className="w-64 pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </form>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate("/create-post")}
                variant="outline"
                size="sm"
                className="hidden md:flex gap-1"
              >
                <Plus className="h-4 w-4" /> New Post
              </Button>
              
              <Button
                onClick={() => navigate("/create-post")}
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
