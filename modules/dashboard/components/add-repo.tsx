
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Image from "next/image"

const AddRepo = () => {
  return (
    <div
      aria-disabled="true"
      title="GitHub import is coming soon"
      className="group relative rounded-xl px-6 py-8 flex flex-row justify-between items-center border border-accent/20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-500/10 dark:via-accent/5 dark:to-pink-500/10 cursor-not-allowed overflow-hidden opacity-60
      transition-smooth"
    >
      <div className="relative flex flex-row justify-center items-start gap-4 z-10">
        <div className="flex justify-center items-center w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30">
          <ArrowDown size={28} />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Open Repository
          </h1>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Import from GitHub — coming soon
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden z-10">
        <Image
          src={"/github.svg"}
          alt="Open GitHub repository"
          width={120}
          height={120}
          className="opacity-40"
        />
      </div>
    </div>
  )
}

export default AddRepo



