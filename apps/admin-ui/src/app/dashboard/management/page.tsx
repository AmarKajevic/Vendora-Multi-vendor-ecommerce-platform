"use client"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import axiosInstance from 'apps/admin-ui/src/shared/utils/axiosInstance'
import React, { useState } from 'react'
import Breadcrumbs from  'apps/admin-ui/src/shared/components/breadcrumbs'

const columns = [
    {accessorKey: "name", header: "Name"},
    {accessorKey: "email", header: "Email"},
    {accessorKey: "role", header: "Role"},
]

const page = () => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedRole, setSelectedRole] = useState('user')

    const queryClient = useQueryClient()

    const{data, isLoading, isError} = useQuery({
        queryKey: ["admins"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-all-admins")    
            console.log("Admins data:", res.data.admins); // Log the response data
            return res.data.admins || []
        }
    })

    const {mutate: updateRole, isPending:updating} = useMutation({
        mutationFn: async () => {
            return await axiosInstance.put("/admin/api/add-new-admin", {email: search, role: selectedRole})
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admins"]});
            setOpen(false)
            setSearch('')
            setSelectedRole('user')
        },
        onError: (err) => {
            console.log("Role update failed", err)
        }
    })

    const table = useReactTable({
        data: data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleSubmit = (e: any) => {
        e.preventDefault()
        updateRole()
    }

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold tracking-wide">Team Management</h2>
            <button
                onClick={() => setOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
                Add Admin
            </button>
        </div>
        <div className="mb-4">
            <Breadcrumbs title="Team Management" />
        </div>
        <div className="!rounded shadow-xl border border-slate-700 overflow-hidden">
            <table className="min-w-full text-left">
                <thead className="bg-gray-800 text-slate-300">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header)=> (
                                <th key={header.id} className="p-3">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}

                        </tr>
                    ))}

                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="p-3 text-center text-slate-300">
                                Loading admins...
                            </td>
                        </tr>
                    ): isError ?(
                        <tr>
                            <td colSpan={columns.length} className="p-3 text-center text-slate-300">
                                Error fetching admins.
                            </td>
                        </tr>

                    ): (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-900 transition">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>

            </table>
        </div>
        {open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900 p-6 rounded shadow-lg w-96">
                    <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">
                        &times;
                    </button>
                    <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>   
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-1">Email:</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                                placeholder="johnSmith@gmail.com"
                            />
                        </div>
                        <label htmlFor="role" className="block mb-1">Role:</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <div className="flex gap-8 pt-2">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Add Admin"}

                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      
    </div>
  )
}

export default page
