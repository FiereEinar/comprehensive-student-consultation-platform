import { Card, CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";

export default function PrivacyPolicy() {
  return (
    <main className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        {" "}
        {/* Adjusted max-width slightly for text readability */}
        <div className='flex flex-col gap-6'>
          <Card className='overflow-hidden'>
            <CardContent className='p-8 md:p-12'>
              {" "}
              {/* Single column padding */}
              <div className='flex flex-col gap-6'>
                <h1 className='text-3xl font-bold tracking-tight'>
                  Privacy Policy
                </h1>

                <div className='space-y-6 text-base text-muted-foreground leading-relaxed'>
                  <section>
                    <h2 className='text-xl font-semibold text-foreground mb-2'>
                      1. Information We Collect
                    </h2>
                    <p>
                      We collect student and instructor identification details
                      (Name, ID, University Email) strictly to facilitate and
                      manage academic consultations.
                    </p>
                  </section>

                  <hr />

                  <section>
                    <h2 className='text-xl font-semibold text-foreground mb-2'>
                      2. How We Use Your Information
                    </h2>
                    <p>
                      Your data is used solely for scheduling, automated
                      notifications (reminders), and to provide instructors with
                      necessary context for academic support within the
                      university system.
                    </p>
                  </section>

                  <hr />

                  <section>
                    <h2 className='text-xl font-semibold text-foreground mb-2'>
                      3. Data Sharing
                    </h2>
                    <p>
                      We do not sell your personal data. Information is shared
                      only between the student and the selected instructor to
                      prepare for sessions. Authorized University Administration
                      may access records for institutional reporting or support.
                    </p>
                  </section>
                </div>
              </div>
            </CardContent>
          </Card>

          <FieldDescription className='px-6 text-center text-sm'>
            Last Updated: March 11, 2026. <br />
            By using this system, you agree to these terms.
          </FieldDescription>
          <FieldDescription className='px-6 text-center'>
            Return to{" "}
            <a
              href='/login'
              className='underline underline-offset-4 hover:text-primary'
            >
              Login
            </a>
            .
          </FieldDescription>
        </div>
      </div>
    </main>
  );
}
