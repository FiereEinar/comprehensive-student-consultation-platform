import type { Consultation, ConsultationStatus } from "@/types/consultation";
import { Card, CardContent } from "./ui/card";
import { Ban, Check, Ellipsis, UserRound } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemTitle } from "./ui/item";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { startCase } from "lodash";
import axiosInstance from "@/api/axios";
import { toast } from "sonner";
import { queryClient } from "@/main";
import { QUERY_KEYS } from "@/constants";
import { useUserStore } from "@/stores/user";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type ConsultationCardProps = {
  consultation: Consultation;
  info?: "student" | "instructor";
};

export default function ConsultationCard({
  consultation,
  info = "student",
}: ConsultationCardProps) {
  const { user } = useUserStore((state) => state);
  const onButtonClick = async (
    consultationID: string,
    status: ConsultationStatus
  ) => {
    try {
      const { data } = await axiosInstance.patch(
        `/consultation/${consultationID}`,
        { status }
      );

      toast.success(data.message);
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONSULTATIONS, "pending"],
      });
    } catch (error: any) {
      console.error(`Failed to ${status} consultation`, error);
      toast.error(error.message ?? `Failed to ${status} consultation`);
    }
  };

  return (
    <Sheet>
      <SheetTrigger className='w-full'>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between w-full'>
              <div className='flex gap-3 items-center'>
                <UserRound className='w-8 h-8' />
                <ItemContent className='gap-0'>
                  <ItemTitle>{startCase(consultation.title)}</ItemTitle>
                  <ItemDescription className='text-left'>
                    {info === "student"
                      ? startCase(consultation.student.name)
                      : startCase(consultation.instructor.name)}
                  </ItemDescription>
                </ItemContent>
              </div>
              <div className='text-right h-fit text-sm flex flex-col items-end gap-1'>
                <Badge variant='default'>
                  {startCase(consultation.status)}
                </Badge>
                <p>
                  {format(
                    new Date(consultation.scheduledAt),
                    "MMM dd, yyyy - hh:mm a"
                  )}
                </p>
              </div>
            </div>

            <div className='flex items-center justify-between gap-3 w-full'>
              <div className='flex gap-2'>
                <Item className='text-xs p-1 px-4 bg-muted' variant='outline'>
                  T106
                </Item>
                <Item className='text-xs p-2 px-5 bg-muted' variant='outline'>
                  IT137
                </Item>
              </div>

              <div className='flex items-center gap-3'>
                {user?.role === "instructor" && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Ellipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <button
                            className='flex gap-1'
                            onClick={() =>
                              onButtonClick(consultation._id, "accepted")
                            }
                          >
                            <Check />
                            <p>Accept</p>
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <button
                            className='flex gap-1'
                            onClick={() =>
                              onButtonClick(consultation._id, "declined")
                            }
                          >
                            <Ban />
                            <p>Cancel</p>
                          </button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator></DropdownMenuSeparator>
                        {consultation.status === "accepted" && (
                          <DropdownMenuItem>
                            <button
                              className='flex gap-1'
                              onClick={() =>
                                onButtonClick(consultation._id, "completed")
                              }
                            >
                              <Check />
                              <p>Mark as done</p>
                            </button>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <p className='text-xl font-medium'>Consultation Details</p>
          <Separator />
          <div className='flex flex-col gap-3 m-3'>
            <div>
              <p className='text-2xl font-semibold'>{consultation.title}</p>
              <p>{consultation.description}</p>
            </div>
            <div>
              <Item variant={"outline"}>
                <UserRound className='w-8 h-8' />
                <div className='flex flex-col items-center'>
                  <p className='font-medium'>
                    {startCase(consultation.student.name)}
                  </p>
                  <p className='font-light'>
                    {consultation.student.institutionalID}
                  </p>
                </div>
              </Item>
            </div>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
