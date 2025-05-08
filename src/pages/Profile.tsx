
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="pb-8 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl mb-2">{user.username}</CardTitle>
                    <div className="text-muted-foreground">Member since {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <Button>Edit Profile</Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-muted-foreground mb-4">
                    {user.bio || "Tell your community about yourself..."}
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6">Location</h3>
                  <p className="text-muted-foreground">
                    {user.location || "Add your neighborhood or area"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {badge}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-muted-foreground">
                        No badges yet. Keep participating to earn badges!
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6">Contact</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
