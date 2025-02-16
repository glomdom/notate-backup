"use client";

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Notebook, Rocket } from "lucide-react";
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="w-full absolute top-0 right-0 p-6 flex justify-end">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/login">
            Student Portal
            <Rocket className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl text-center space-y-8"
        >
          <div className="inline-flex items-center justify-center gap-3">
            <Notebook className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">
              Notate
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure assignment portal with real-time feedback and progress tracking
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                <Rocket className="h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
