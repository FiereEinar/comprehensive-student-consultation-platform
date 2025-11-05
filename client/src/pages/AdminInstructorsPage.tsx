import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { fetchInstructors, fetchInvitations } from '@/api/instructor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import _ from 'lodash';
import InviteInstructorForm from '@/components/forms/InviteInstructorForm';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import Header from '@/components/ui/header';

export default function AdminInstructorsPage() {
	const { data: instructors, isLoading: isLoadingInstructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

	const { data: invitations, isLoading: isLoadingInvitations } = useQuery({
		queryKey: [QUERY_KEYS.INVITATIONS],
		queryFn: fetchInvitations,
	});

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<Header size='md'>Instructors</Header>
					{/* <p className='text-muted-foreground'>
						Manage existing instructors and view pending invitations.
					</p> */}
				</div>
				<InviteInstructorForm />
			</div>

			<Tabs defaultValue='active' className='w-full'>
				<TabsList>
					<TabsTrigger value='active'>Active</TabsTrigger>
					<TabsTrigger value='pending'>Pending Invitations</TabsTrigger>
					{/* <TabsTrigger value='all'>All Instructors</TabsTrigger> */}
				</TabsList>

				{/* ACTIVE INSTRUCTORS */}
				<TabsContent value='active'>
					<Card>
						<CardHeader>
							<CardTitle>Active Instructors</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoadingInstructors ? (
								<div className='flex justify-center py-8'>
									<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{instructors?.length ? (
											instructors.map((ins) => (
												<TableRow key={ins._id}>
													<TableCell className='font-medium'>
														{_.startCase(ins.name)}
													</TableCell>
													<TableCell>{ins.email}</TableCell>
													<TableCell>
														<Badge variant='default'>Active</Badge>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={4}
													className='text-center text-muted-foreground py-4'
												>
													No active instructors found.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* PENDING INVITATIONS */}
				<TabsContent value='pending'>
					<Card>
						<CardHeader>
							<CardTitle>Pending Invitations</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoadingInvitations ? (
								<div className='flex justify-center py-8'>
									<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Sent</TableHead>
											<TableHead>Status</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{invitations?.length ? (
											invitations.map((inv) => (
												<TableRow key={inv._id}>
													<TableCell>{_.startCase(inv.name)}</TableCell>
													<TableCell>{inv.email}</TableCell>
													<TableCell>
														{formatDistanceToNow(new Date(inv.createdAt), {
															addSuffix: true,
														})}
													</TableCell>
													<TableCell>
														<Badge variant='outline'>Pending</Badge>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
													className='text-center text-muted-foreground py-4'
												>
													No pending invitations.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* ALL */}
				{/* <TabsContent value='all'>
					<Card>
						<CardHeader>
							<CardTitle>All Instructors</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-muted-foreground text-sm'>
								This tab can show both active and pending users if you wish to
								merge views later.
							</p>
						</CardContent>
					</Card>
				</TabsContent> */}
			</Tabs>
		</div>
	);
}
