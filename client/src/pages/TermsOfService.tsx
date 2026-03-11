import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
    return (
        <main className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full'>
            <div className='w-full max-w-sm md:max-w-3xl'>
                {" "}
                <div className='flex flex-col gap-6'>
                    <Card className='overflow-hidden'>
                        <CardContent className='p-8 md:p-12'>
                            {" "}
                            <div className='flex flex-col gap-6'>
                                <h1 className='text-3xl font-bold tracking-tight'>
                                    Terms of Service
                                </h1>
                                
                                <div className='text-muted-foreground space-y-4 leading-relaxed'>
                                    <p className="leading-relaxed mb-4 text-justify">
                                    Welcome to the Comprehensive Student Consultation Platform. By accessing or using our platform, you agree to be bound by these Terms of Service. This system is strictly designed to facilitate academic communication, scheduling, and consultations between students and registered instructors. All users are expected to maintain respectful and professional conduct during all interactions. We reserve the right to suspend or terminate access for any user who violates these community guidelines, misuses the scheduling system, or engages in inappropriate behavior. The platform and its services are provided on an "as is" basis, and while we strive for maximum uptime, we are not liable for missed consultations due to technical disruptions. Your continued use of this platform constitutes your acknowledgment and acceptance of these terms.
                                    </p>
                                </div>
                                
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}