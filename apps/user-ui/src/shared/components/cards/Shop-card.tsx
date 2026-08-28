import  { StarFilled } from 'apps/user-ui/src/assets/svgs/star';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

interface avatar {
    id: string;
    shopId: string;
    url: string
}

interface ShopCardProps {
    shop: {
        id:string;
        name:string;
        description?:string;
        avatar:avatar;
        coverBanner?:string;
        address?:string;
        followers?:[];
        rating?:number;
        category?:string;
    
    }
}

const ShopCard = ({shop}:ShopCardProps) => {

  return (
    <div className='w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-md overflow-hidden transition'>
        {/* Cover photo */}
        <div className="h-[120px] w-full relative">
            <Image
                src={shop?.coverBanner || "https://ik.imagekit.io/amark97/products/Cover-Shops.jpg"}
                alt='Cover'
                fill
                className='object-cover w-full h-full'
            
            />
        </div>
        {/* avatar */}
        <div className="relative flex justify-center -mt-8">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md">
                <Image
                    src={shop?.avatar?.url || "https://ik.imagekit.io/amark97/products/3135715.png?updatedAt=1783949179738"}
                    alt={shop.name}
                    width={64}
                    height={64}
                    className='object-cover'
                />
            </div>
        </div>
        {/* info */}
        <div className="px-4 pb-4 pt-2 text-center">
            <h3 className='text-base font-semibold text-gray-800'>{shop?.name}</h3>
            <p className='text-xs text-gray-500 mt-0.5'>
                {shop?.followers?.length ?? 0} Followers
            </p>

            {/* address & rating */}
            <div className="flex items-center justify-center text-xs text-gray-500 mt-2" gap-4 flex-wrap>
                {shop.address && (
                    <span className='flex items-center gap-1 max-w-[120px]'>
                        <MapPin className='w-4 h-4 shrink-0'/>
                        <span className='truncate'>{shop.address}</span>
                    </span>
                )}
            </div>
            <span className='flex items-center gap-1'>
                <StarFilled />
                {shop.rating ?? "N/A"}

            </span>
             {/* category */}
        {shop?.category && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className='bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-md'>
                {shop.category}
            </span>
        </div>
        )}
        {/* Visit button */}

        <div className="mt-4">
            <Link
            href={`/store/${shop.id}`}
            className='inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-900'
            >
                Visit Shop
                <ArrowUpRight className='w-4 h-4 ml-1'/>
            </Link>
        </div>
        </div>

       
      
    </div>
  )
}

export default ShopCard
