"use client";

import {
  useQueryClient,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/shared/utils/axiosInstance";
import {  ChevronRight } from "lucide-react";
import React, { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Avatar{
  id:string;
  shopId: string;
  url: string;
}

type Seller = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: Avatar
  createdAt: string;
};

type SellersResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
  };
};

// Komponenta se zove Page (konvencija u Next.js)
const Page = () => {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;
  const queryClient = useQueryClient();

  // Ispravljena tipizacija – bez trećeg generičkog parametra
  const { data, isLoading, error } = useQuery<SellersResponse, Error>({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`,
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5, // 5 minuta
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await axiosInstance.post(`/admin/ban-user/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setErrorMessage(null);
      setIsModalOpen(false);
      setSelectedSeller(null);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Došlo je do greške pri banovanju.");
      // Modal ostaje otvoren da bi korisnik mogao da vidi grešku
    },
  });

  const allSellers = data?.data || [];
  console.log("All Sellers:", allSellers);
  // Filtriranje – pretražujemo samo ime, email i ulogu
  const filteredSellers = useMemo(() => {
    return allSellers.filter((seller: Seller) => {
      const matchedRole = roleFilter
        ? seller.role.toLowerCase() === roleFilter.toLowerCase()
        : true;
      const searchTerm = deferredGlobalFilter.toLowerCase();
      const matchedGlobal = deferredGlobalFilter
        ? seller.name.toLowerCase().includes(searchTerm) ||
          seller.email.toLowerCase().includes(searchTerm) ||
          seller.role.toLowerCase().includes(searchTerm)
        : true;
      return matchedRole && matchedGlobal;
    });
  }, [allSellers, roleFilter, deferredGlobalFilter]);

  const totalSellers = data?.meta?.totalSellers ?? 0;
  const totalPages = Math.ceil(totalSellers / limit);

  // Definicija kolona – ispravljen pristup za akcije
  const columns = useMemo(
    () => [
        {
            id: "avatar",
            accessorKey: "avatar",
            header: "Avatar",
            cell: ({ row }: any) => {
                return (
                    <Image
                        width={40}
                        height={40}
                        src={row.original.shop?.avatar?.url || "https://ik.imagekit.io/amark97/products/3135715.png?updatedAt=1783949179738"}
                        alt={row.original.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                );
            }
        },
      {
        id: "name",
        header: "Name",
        accessorKey: "name" as const,
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email" as const,
      },
      {
        id: "Shop Name",
        accessorKey: "shopName",
        header: "Shop Name",
        cell: ({ row }: any) => {
          return (<span className ="text-sky-700">{row.original.shop?.name || "N/A"}</span>);
        }
      },
    {
        id: "Address",
        accessorKey: "Address",
        header: "Address",
        cell: ({ row }: any) => {
          return row.original.shop?.address || "N/A";
        }
      },
        {
            id: "joined",
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }: any) => {
                const date = new Date(row.original.createdAt);
                return date.toLocaleDateString();
            }
        }
     
     
     
    ],
    [],
  );

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Users</h2>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Users</span>
      </div>

      {/* Filteri i pretraga */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <select
          className="bg-gray-800 border border-gray-700 outline-none text-white p-2 rounded-md"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <div className="flex-1 min-w-[200px] p-2 bg-gray-900 rounded-md">
          <input
            type="text"
            placeholder="Search by name, email or role..."
            className="w-full bg-transparent text-white outline-none"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading Sellers...</p>
        ) : error ? (
          <p className="text-center text-red-400">
            Greška pri učitavanju: {error.message}
          </p>
        ) : filteredSellers.length === 0 ? (
          <p className="text-center text-gray-400">Nema prodavaca.</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                {columns.map((column) => (
                  <th key={column.id} className="p-3 text-left">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="border-b border-gray-800">
                  {columns.map((column) => (
                    <td key={column.id} className="p-3">
                      {column.cell
                        ? column.cell({ row: { original: seller } })
                        : seller[column.accessorKey as keyof Seller]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginacija */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-white">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            previous
          </button>
          <span>
            page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            next
          </button>
        </div>
      )}

      {/* Modal za banovanje */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl text-white font-semibold">Ban Seller</h3>
            </div>
            <p className="text-white mb-4">
              Are you sure you want to ban <strong>{selectedSeller.name}</strong>?
            </p>

            {errorMessage && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMessage(null);
                  setSelectedSeller(null);
                }}
                disabled={banUserMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  banUserMutation.mutate(selectedSeller.id);
                }}
                disabled={banUserMutation.isPending}
              >
                {banUserMutation.isPending ? "Banovanje..." : "Ban Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;


