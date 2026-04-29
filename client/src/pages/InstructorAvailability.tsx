import InstructorAvailabilities from "@/components/InstructorAvailabilities";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/ui/header";
import UpdateAvailability from "@/components/UpdateAvailability";
import EditInstructorAvailability from "@/components/forms/EditInstructorAvailability";
import { useUserStore } from "@/stores/user";
import { useState } from "react";
import type { User } from "@/types/user";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type AvailabilityType = {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  slots: string;
  user: string;
};

export default function InstructorAvailability() {
  const user = useUserStore((state) => state.user);
  const [editOpen, setEditOpen] = useState(false);
  const [schoolYear, setSchoolYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [semester, setSemester] = useState("1");
  const [editAvailability, setEditAvailability] =
    useState<AvailabilityType | null>(null);

  const handleEdit = (availability: AvailabilityType) => {
    setEditAvailability(availability);
    setEditOpen(true);
  };

  return (
    <section className='space-y-5 w-full'>
      <div className='flex items-center justify-between'>
        <Header size='md'>My Availabilities</Header>

        <div className='flex gap-4 items-center'>
          <div className='w-[150px]'>
            <Select onValueChange={setSchoolYear} value={schoolYear}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='School Year' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>School Year</SelectLabel>
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    const value = `${year}-${year + 1}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='w-[150px]'>
            <Select onValueChange={setSemester} value={semester}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Semester' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Semester</SelectLabel>
                  <SelectItem value='1'>1st Semester</SelectItem>
                  <SelectItem value='2'>2nd Semester</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
        {/* LEFT – Create Availability */}
        <Card className='md:col-span-1 shadow-sm rounded-2xl'>
          <CardContent>
            <h2 className='font-semibold text-lg mb-4'>Add Availability</h2>
            <UpdateAvailability user={user as User} schoolYear={schoolYear} semester={semester} />
          </CardContent>
        </Card>

        {/* RIGHT – List of availabilities */}
        <Card className='md:col-span-2 shadow-sm rounded-2xl'>
          <CardContent>
            <h2 className='font-semibold text-lg mb-4'>Your Schedule</h2>
            <div className='max-h-105 overflow-y-auto pr-2'>
              <InstructorAvailabilities
                instructorID={user?._id ?? ""}
                schoolYear={schoolYear}
                semester={semester}
                onEdit={handleEdit}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <EditInstructorAvailability
        availability={editAvailability}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </section>
  );
}
