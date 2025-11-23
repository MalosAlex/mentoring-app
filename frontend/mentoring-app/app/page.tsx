import Link from "next/link";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to Mentoring App</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with mentors, join communities, and accelerate your learning journey
        </p>
        <Link href="/communities">
          <Button size="lg">
            Explore Communities
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <Card>
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Join Communities</CardTitle>
            <CardDescription>
              Connect with like-minded individuals and experts in various fields
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Share Knowledge</CardTitle>
            <CardDescription>
              Post your insights, ask questions, and learn from others&apos; experiences
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Grow Together</CardTitle>
            <CardDescription>
              Track your progress and build meaningful connections with mentors
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
