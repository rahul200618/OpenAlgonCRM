"use client";

import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

export function InteractiveLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative flex items-center justify-center">
          {/* Outer glowing ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-24 w-24 rounded-full border-t-2 border-primary/40 border-r-2 border-r-transparent"
          />
          
          {/* Inner pulsing ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-16 w-16 rounded-full border-b-2 border-primary border-l-2 border-l-transparent"
          />

          {/* Core Logo Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary backdrop-blur-sm"
          >
            <Hexagon className="h-6 w-6 fill-primary/20" />
          </motion.div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            OrvixCRM
          </motion.h1>
          <motion.div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
