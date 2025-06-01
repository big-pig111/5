"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { useGridStore } from "@/hooks/use-grid-store"

export default function AirdropCountdown() {
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00")
  const [isAirdropping, setIsAirdropping] = useState(false)
  const { toast } = useToast()
  const { connected, publicKey } = useSolanaWallet()
  const { grid } = useGridStore()

  // Check if the current user owns any grid blocks
  const ownsBlocks = connected && publicKey && grid.some((block) => block.owner === publicKey.toString())

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(nextHour.getHours() + 1)
      nextHour.setMinutes(0)
      nextHour.setSeconds(0)
      nextHour.setMilliseconds(0)

      const difference = nextHour.getTime() - now.getTime()

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return {
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
        total: difference,
      }
    }

    const simulateAirdrop = () => {
      if (connected && ownsBlocks) {
        setIsAirdropping(true)

        // Simulate airdrop process
        setTimeout(() => {
          toast({
            title: "Airdrop Received!",
            description: "Tokens have been sent to your wallet",
          })
          setIsAirdropping(false)
        }, 3000)
      }
    }

    const updateCountdown = () => {
      const time = calculateTimeLeft()
      setTimeLeft(`${time.hours}:${time.minutes}:${time.seconds}`)

      // Check if we've reached the top of the hour
      if (time.total < 1000) {
        simulateAirdrop()
      }
    }

    // Initial update
    updateCountdown()

    // Update every second
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [connected, ownsBlocks, toast])

  return (
    <div className="flex flex-col items-center">
      <div
        className={`text-xl font-mono font-bold ${isAirdropping ? "text-green-400 animate-pulse" : "text-purple-400"}`}
      >
        {isAirdropping ? "Airdropping..." : timeLeft}
      </div>
      <div className="flex items-center mt-1">
        <Clock className={`h-4 w-4 mr-1 ${ownsBlocks ? "text-green-400" : "text-gray-500"}`} />
        <span className={`text-xs ${ownsBlocks ? "text-green-400" : "text-gray-500"}`}>
          {ownsBlocks ? "You are eligible" : "Not eligible"}
        </span>
      </div>
    </div>
  )
}
