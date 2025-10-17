import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/ui/header";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ban, UserRound } from "lucide-react";

export default function InstructorConsultations() {
  return (
    <section className="space-y-5">
      <div>
        <Tabs defaultValue="Upcoming" className="space-y-5">
          <div className="flex justify-between">
            <Header>Instructor Consultations</Header>
            <TabsList className="self-end">
              <TabsTrigger
                className="cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none"
                value="Upcoming"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                className="cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none"
                value="Requests"
              >
                Requests
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            className="flex justify-start flex-col gap-3"
            value="Upcoming"
          >
            <Card className="w-fit">
              <CardContent className="flex items-center gap-20">
                <div className="flex items-center gap-3">
                  <UserRound className="w-8 h-8" />
                  <ItemContent>
                    <ItemTitle>Chapter 1 Revisions</ItemTitle>
                    <ItemDescription>Nick Xylan Melloria</ItemDescription>
                  </ItemContent>
                </div>

                <div className="text-right">
                  <ItemTitle>17:00</ItemTitle>
                  <ItemTitle>10/03/2025</ItemTitle>
                </div>

                <div className="flex gap-2">
                  <Item variant="outline">T106</Item>
                  <Item variant="outline">IT137</Item>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Invite"
                  >
                    <Ban />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="w-fit">
              <CardContent className="flex items-center gap-20">
                <div className="flex items-center gap-3">
                  <UserRound className="w-8 h-8" />
                  <ItemContent>
                    <ItemTitle>Chapter 1 Revisions</ItemTitle>
                    <ItemDescription>Nick Xylan Melloria</ItemDescription>
                  </ItemContent>
                </div>

                <div className="text-right">
                  <ItemTitle>17:00</ItemTitle>
                  <ItemTitle>10/03/2025</ItemTitle>
                </div>

                <div className="flex gap-2">
                  <Item variant="outline">T106</Item>
                  <Item variant="outline">IT137</Item>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Invite"
                  >
                    <Ban />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Requests">Requests</TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
