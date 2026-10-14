import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    from: number | null;
    to: number | null;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    lastPage,
    total,
    from,
    to,
    onPageChange,
    className = '',
}) => {
    if (lastPage <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (lastPage <= maxVisible + 2) {
            for (let i = 1; i <= lastPage; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(lastPage - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < lastPage - 2) {
                pages.push('...');
            }

            pages.push(lastPage);
        }

        return pages;
    };

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
            <p className="text-sm text-[#6E8BA3]">
                Menampilkan <span className="font-semibold text-[#3B4D3A]">{from ?? 0}</span> - <span className="font-semibold text-[#3B4D3A]">{to ?? 0}</span> dari <span className="font-semibold text-[#3B4D3A]">{total}</span> data
            </p>

            <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-[#6E8BA3] hover:bg-[#3B4D3A]/10 hover:text-[#3B4D3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Halaman pertama"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-[#6E8BA3] hover:bg-[#3B4D3A]/10 hover:text-[#3B4D3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Halaman sebelumnya"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-2 py-1 text-[#6E8BA3] text-sm">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page as number)}
                                className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
                                    currentPage === page
                                        ? 'bg-[#3B4D3A] text-white shadow-md shadow-[#3B4D3A]/20'
                                        : 'text-[#6E8BA3] hover:bg-[#3B4D3A]/10 hover:text-[#3B4D3A]'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                {/* Next Page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="p-2 rounded-lg text-[#6E8BA3] hover:bg-[#3B4D3A]/10 hover:text-[#3B4D3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Halaman berikutnya"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(lastPage)}
                    disabled={currentPage === lastPage}
                    className="p-2 rounded-lg text-[#6E8BA3] hover:bg-[#3B4D3A]/10 hover:text-[#3B4D3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Halaman terakhir"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
