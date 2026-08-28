'use client'

import { useStore } from 'apps/user-ui/src/store'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CheckCircle, Truck } from 'lucide-react'

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const router = useRouter()

  useEffect(() => {
    // Isprazni korpu
    useStore.setState({ cart: [] })

    // Confetti eksplozija
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center transition-all duration-300 hover:shadow-2xl">
        {/* Ikona sa pozadinom */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 mx-auto">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Payment Successful! 🎉
        </h1>

        <p className="text-gray-600 text-base md:text-lg mb-1">
          Thank you for your purchase.
        </p>
        <p className="text-gray-500 text-sm md:text-base mb-8">
          Your order has been placed successfully.
        </p>

        {/* Dugme */}
        <button
          onClick={() => router.push(`/profile?active=My+orders`)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Truck className="w-5 h-5" />
          Track Order
        </button>

        {/* Session ID */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Order Reference
          </p>
          <p className="text-sm font-mono text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-block">
            {sessionId}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage