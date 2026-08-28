"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileIcon } from "apps/user-ui/src/assets/svgs/profile-icon";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quick-action-card";
import StatCard from "apps/user-ui/src/shared/components/cards/stat-card";
import ChangePassword from "apps/user-ui/src/shared/components/change-password";
import NavItem from "apps/user-ui/src/shared/components/nav/nav-item";
import ShippingAddressSection from "apps/user-ui/src/shared/components/shippingAddress";
import OrdersTable from "apps/user-ui/src/shared/components/tables/order-table";
import { User } from "apps/user-ui/src/types/user";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import {
    BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOutIcon,
  MapPin,
  PencilIcon,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,

} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";


const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { user, isLoading } = useRequireAuth() as { user: User | null; isLoading: boolean };
  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  const fetchOrders = async () => {
      const res = await axiosInstance.get(`/order/api/get-user-orders`)
        return res.data.orders
  } 
  const {data: orders=[]} = useQuery({
          queryKey: ["user-orders"],
          queryFn: fetchOrders,
          staleTime: 1000 * 60 * 5
      })

  const totalOrders = orders.length;
  const processingOrders = orders.filter(
    (o:any) => 
      o?.deliveryStatus !== "Delivered" && o?.deliveryStatus !== "Canceled"
   ).length

   const completedOrders = orders.filter(
    (o:any) => o?.deliveryStatus === "Delivered"
   ).length

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab]);

  const logoutHandler = async () => {
    await axiosInstance.get("/api/logout-user").then((res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/login");
    });
  };

  const {data: notifications, isLoading:notificationLoading} = useQuery({
    queryKey:["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-user-notifications");
      return res.data.notifications
    }
  })

     const markAsRead = async (notificationId: string) => {
        await axiosInstance.post("/seller/api/mark-notification-as-read", {
            notificationId
        })
    }

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="max-w-7xl mx-auto">
        {/* greeting */}
        <div className="text-center mb-10 ">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-sky-600 ">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.name || "User"}`
              )}
            </span>{" "}
            👋
          </h1>
        </div>
        {/* profile overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={totalOrders} Icon={Clock} />
          <StatCard title="Processing Orders" count={processingOrders} Icon={Truck} />
          <StatCard title="Completed Orders" count={completedOrders} Icon={CheckCircle} />
        </div>
        {/* sidebar */}
        <div className="mt-10 flex md:flex:row gap-6 ">
          <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={ProfileIcon}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => router.push("/inbox")}
              />
              <NavItem
                label="Notification"
                Icon={Bell}
                active={activeTab === "Notification"}
                onClick={() => setActiveTab("Notification")}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />
              <NavItem
                label="Logout"
                Icon={LogOutIcon}
                danger
                onClick={() => logoutHandler()}
              />
            </nav>
          </div>
          {/* main content */}
          <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 md:w-[65%] w-full  ">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>
            {activeTab === "Profile" && !isLoading && user ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={
                      user?.avatar ||
                      "https://ik.imagekit.io/amark97/products/3135715.png?updatedAt=1783949179738"
                    }
                    alt=""
                    width={60}
                    height={60}
                    className="w-16 h-16 rounded-full border border-gray-200 "
                  />
                  <button
                    className="flex items-center gap-1 text-sky-600 text-xs font-medium"

                  >
                    <PencilIcon className="w-4 h-4"/> Change Photo

                  </button>
                </div>
                <p>
                    <span className="font-semibold">Name: </span>{user.name}
                </p>
                 <p>
                    <span className="font-semibold">Email: </span>{user.email}
                </p>
                 <p>
                    <span className="font-semibold">Joined: </span>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
                 <p>
                    <span className="font-semibold">Earned Points: </span>{" "}
                    {user.points || 0}
                </p>
              </div>
            ) : activeTab === "Shipping Address" ? (
                <ShippingAddressSection/>
            ): activeTab === "My Orders" ? (
              <OrdersTable/>
            ) :activeTab === "Change Password" ?(
              <ChangePassword/>
            ): activeTab === "Notification" ? (
              <div className="space-y-4 text-sm text-gray-700">
                {!notificationLoading && notifications?.length === 0 &&(
                  <p className="">No Notifications available yet!</p>
                )}

                {!notificationLoading && notifications?.lenthg > 0 && (
                   <div className="md-w-[80%] my-6 rounded-lg divide-y divide-gray-800 text-gray-200 bg-black/40 backdrop-blur-lg shadow-sm">
                   {notifications.map((d:any) => (
                    <Link
                        key={d.id}
                        href={d.redirect_link}
                        className={`block px-5 py-4 transition ${
                            d.status !== "Unread"
                            ? "hover:bg-gray-800/40"
                            :"bg-gray-800/50 hover:bg-gray-800/70"
                        }`}
                        onClick={() => markAsRead(d.id)}
                    >
                    
                    <div className="flex items-start gap-3">
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{d.title}</span>
                            <span className="text-gray-300 text-sm">{d.message}</span>
                            <span className="text-gray-500 text-xs mt-1">
                                {new Date(d.createdAt).toLocaleString("en-UK", {
                                    dateStyle: "medium",
                                    timeStyle:  "short"
                                })}
                            </span>
                        </div>
                    </div>
                    </Link>
                   ))}
                </div>
                )}
              </div>
            ): <></>
            
            } 
          </div>
          {/* Right qucik panel */}
          <div className="w-full md:w-1/4 space-y-4 cursor-pointer shadow-md">
            <QuickActionCard
                Icon={Gift}
                title= "Referral Program"
                description="invite friends and earn rewards."
            />
            <QuickActionCard
                Icon={BadgeCheck}
                title= "Your Badges"
                description="view your earned achievements."
            />
            <QuickActionCard
                Icon={Settings}
                title= "Account Settings"
                description="Manage preferences and security."
            />
            <QuickActionCard
                Icon={Receipt}
                title= "Billing History"
                description="Check your recent payments."
            />
            <QuickActionCard
                Icon={PhoneCall}
                title= "Support Center"
                description="Need help? Contact support."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
