import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/user';
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from './ui/command';
import _ from 'lodash';
import { QUERY_KEYS } from '@/constants';
import { useDebounce } from './hooks/useDebounce';

type Props = {
	role: 'student' | 'instructor';
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

export default function SearchableCombobox({
	role,
	value,
	onChange,
	placeholder,
}: Props) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState('');
	const debounced = useDebounce(search);

	const { data: users, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.USERS, { role, search: debounced }],
		queryFn: () => fetchUsers({ role, search: debounced }),
	});

	const selectedUser = users?.find((u) => u._id === value)?.name ?? placeholder;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className='w-full border rounded px-3 py-2 text-sm text-left'>
				{_.startCase(selectedUser)}
			</PopoverTrigger>

			<PopoverContent className='w-[300px] p-0'>
				<Command>
					<CommandInput
						placeholder={`Search ${role}s...`}
						value={search}
						onValueChange={setSearch}
					/>

					<CommandList>
						{isLoading ? (
							<CommandEmpty>Loading...</CommandEmpty>
						) : users && users.length ? (
							<CommandGroup>
								{users.map((u) => (
									<CommandItem
										key={u._id}
										value={u.name}
										onSelect={() => {
											onChange(u._id);
											setOpen(false);
										}}
									>
										{_.startCase(u.name)}
									</CommandItem>
								))}
							</CommandGroup>
						) : (
							<CommandEmpty>No {role}s found</CommandEmpty>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
