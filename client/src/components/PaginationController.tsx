import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
} from './ui/pagination';

type PaginationControllerProps = {
	prevPage?: number;
	nextPage?: number;
	currentPage?: number;
	setPage: (page: number) => void;
	prefetchFn?: (page: number) => void;
	size?: 'sm' | 'md' | 'lg';
};

export default function PaginationController({
	currentPage = 1,
	nextPage = 2,
	prevPage = 0,
	setPage,
	prefetchFn,
	size = 'md',
}: PaginationControllerProps) {
	// Prefetch page 2 when on page 1
	if (currentPage === 1 && prefetchFn) {
		prefetchFn(2);
	}

	// Apply size classes
	const sizeClass = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-3 py-1.5',
		lg: 'text-base px-4 py-2',
	}[size];

	const clickPrev = () => {
		if (prevPage === 0) return;
		setPage(currentPage - 1);
		if (currentPage - 2 > 0 && prefetchFn) prefetchFn(currentPage - 2);
	};

	const clickNext = () => {
		if (nextPage === 0) return;
		setPage(currentPage + 1);
		if (prefetchFn) prefetchFn(currentPage + 2);
	};

	return (
		<Pagination className='select-none'>
			<PaginationContent className={sizeClass}>
				<PaginationItem onClick={clickPrev}>
					<ChevronLeftIcon className='transition-all cursor-pointer hover:bg-accent rounded-md' />
					{/* <PaginationPrevious /> */}
				</PaginationItem>

				<PaginationItem>
					{prevPage === 0 ? (
						<PaginationEllipsis />
					) : (
						<PaginationLink>{prevPage}</PaginationLink>
					)}
				</PaginationItem>

				<PaginationItem>
					<PaginationLink isActive>{currentPage}</PaginationLink>
				</PaginationItem>

				<PaginationItem>
					{nextPage === 0 ? (
						<PaginationEllipsis />
					) : (
						<PaginationLink>{nextPage}</PaginationLink>
					)}
				</PaginationItem>

				<PaginationItem onClick={clickNext}>
					<ChevronRightIcon className='transition-all cursor-pointer hover:bg-accent rounded-md' />
					{/* <PaginationNext /> */}
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
