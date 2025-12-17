"use client"

import { User, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { getInitials } from "@/lib/helper";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{getInitials(user?.fullName || "")}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
              <CardDescription>TODO: Show creation month</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">TODO: Create Roles for users?</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">TODO: Show creation date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

