"use client"

import axiosInstance from "apps/admin-ui/src/shared/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import {  useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search,  Star, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const EventsPage = () => {
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [page] = useState<number>(1);
    // const deferredGlobalFilter = useDeferredValue(globalFilter);
    const limit = 10;
    
    const {data, isLoading} = useQuery({
        queryKey: ['events',  page],
        queryFn: async () => {
            const res = await axiosInstance.get(`/admin/get-all-events?page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const allEvents = data?.data || []


    // const filteredEvents = useMemo(() => {
    //     return allEvents.filter((event:any) => {
    //         const values = Object.values(event).join(" ").toLowerCase();
    //         return values.includes(deferredGlobalFilter.toLowerCase());
    //     })
    // },[allEvents,deferredGlobalFilter]);


    const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          console.log(row.original);
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "starting_date",
        header: "Start",
        cell: ((row) => new Date(row.original.starting_date).toLocaleDateString( ))
      },
      {
        accessorKey: "ending_date",
        header: "End",
        cell: ((row) => new Date(row.original.ending_date).toLocaleDateString( ))
      },
      {
        accessorKey: "category",
        header: "Category",
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />{" "}
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        accessorKey: "Shop",
        header: "Shop",
        cell: ({ row }: any) => (
          <span className="text-sky-500 ">
            {row.original.Shop?.name || "Guest"}
          </span>
        ),
      },
     
    ],
    [],
  );
    const table = useReactTable({
      data: allEvents,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: "includesString",
      state: { globalFilter },
      onGlobalFilterChange: setGlobalFilter,
    });

     return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
       
      </div>
      {/* breadcrumbs */}
      <div className=" flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Products</span>
      </div>

      {/* searchBar */}
      <div className="mb-4 p-2 flex items-center bg-gray-900 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* table */}

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading products...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
  
}

export default EventsPage;