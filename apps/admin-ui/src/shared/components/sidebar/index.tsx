"use client"

import useAdmin from 'apps/admin-ui/src/hooks/useAdmin'
import useSidebar from 'apps/admin-ui/src/hooks/useSidebar'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import Box from '../box'
import { Sidebar } from './sidebar.styles'
import Link from 'next/link'
import Logo from 'apps/admin-ui/src/app/assets/svgs/logo'
import SidebarItem from './sidebar.item'
import { BellPlus, BellRing, DollarSign, FileClock, Home, ListOrdered, LogOut, PackageSearch, PencilRuler, Settings, Store, Users } from 'lucide-react'
import SidebarMenu from './sidebar.menu'

const SidebarWrapper = () => {
    const {activeSidebar, setActiveSidebar} = useSidebar()
    const pathName = usePathname()
    const {admin} =useAdmin()

    useEffect(() => {
        setActiveSidebar(pathName)
    },[pathName, setActiveSidebar])

    const getIconColor = (route: string) => activeSidebar === route ? "#oo855ff" : "#969696"

  return (
    <Box
        css={{
            height: "120vh",
            zIndex: 202,
            position: "sticky",
            padding: "8px",
            top: "0",

            scrollbarColor: "none",
        }}
        className='sidebar-wrapper'
        >
            <Sidebar.Header>
                <Box className='flex justify-between gap-4'>
                    <Link href={"/"} className='flex justify-center text-center gap-2'>
                        <Logo/>
                    </Link>
                    <div>
                        <h3 className='text-xl font-medium text-[#ecedee]'>
                        {admin?.name}
                    </h3>
                    <h5 className='font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap'>
                        {admin?.email}
                    </h5>
                    </div>
                </Box>

            </Sidebar.Header>
            <div className="block my-3 h-full">
                <Sidebar.Body className='body sidebar'>
                    <SidebarItem
                        title="Dashboard"
                        icon={<Home fill={getIconColor("/dashboard")}/>}
                        isActive= {activeSidebar === "/dashboard"}
                        href="/dashboard"
                    />
                    <div className="mt-2 block">
                        <SidebarMenu title='Main Menu'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/orders"}
                                title= "Orders"
                                href="/dashboard/orders"
                                icon={
                                    <ListOrdered
                                        size={26}
                                        color={getIconColor("/dashboard/orders")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/payments"}
                                title= "Payments"
                                href="/dashboard/payments"
                                icon={
                                    <DollarSign
                                        size={26}
                                        color={getIconColor("/dashboard/payments")}
                                    />
                                }
                            />
                             <SidebarItem
                                isActive={activeSidebar === "/dashboard/products"}
                                title= "Products"
                                href="/dashboard/products"
                                icon={
                                    <PackageSearch
                                        size={26}
                                        color={getIconColor("/dashboard/products")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/events"}
                                title= "Events"
                                href="/dashboard/events"
                                icon={
                                    <BellPlus
                                        size={26}
                                        color={getIconColor("/dashboard/events")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/users"}
                                title= "Users"
                                href="/dashboard/users"
                                icon={
                                    <Users
                                        size={26}
                                        color={getIconColor("/dashboard/users")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/sellers"}
                                title= "Sellers"
                                href="/dashboard/sellers"
                                icon={
                                    <Store
                                        size={26}
                                        color={getIconColor("/dashboard/sellers")}
                                    />
                                }
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Controllers'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/loggers"}
                                title= "Loggers"
                                href="/dashboard/loggers"
                                icon={
                                    <FileClock
                                        size={26}
                                        color={getIconColor("/dashboard/loggers")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/management"}
                                title= "Management"
                                href="/dashboard/management"
                                icon={
                                    <Settings
                                        size={26}
                                        color={getIconColor("/dashboard/management")}
                                    />
                                }
                            />
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/notifications"}
                                title= "Notifications"
                                href="/dashboard/notifications"
                                icon={
                                    <BellRing
                                        size={26}
                                        color={getIconColor("/dashboard/notifications")}
                                    />
                                }
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Customization'>
                            <SidebarItem
                                isActive={activeSidebar === "/dashboard/customization"}
                                title= "All Customization"
                                href="/dashboard/customization"
                                icon={
                                    <PencilRuler
                                        size={26}
                                        color={getIconColor("/dashboard/customization")}
                                    />
                                }
                            />
                        </SidebarMenu>
                        <SidebarMenu title='Extras'>
                            <SidebarItem
                                isActive={activeSidebar === "/logout"}
                                title= "Logout"
                                href="/"
                                icon={
                                    <LogOut
                                        size={26}
                                        color={getIconColor("/logout")}
                                    />
                                }
                            />

                        </SidebarMenu>
                    </div>

                </Sidebar.Body>
            </div>
    </Box>
  )
}

export default SidebarWrapper
