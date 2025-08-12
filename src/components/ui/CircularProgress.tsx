"use client";

import { cn } from "@/lib/utils";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

interface CircularProgressProps {
  items: {
    value: number;
    color: string;
    label: string;
  }[];
  size?: number;
  thickness?: number;
}

export function CircularProgress({
  items,
  size = 80,
  thickness = 12,
}: CircularProgressProps) {
  const radius = size / 2 - thickness;
  const circumference = 2 * Math.PI * radius;
  const total = items.reduce((acc, item) => acc + item.value, 0) || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  
  useEffect(() => {
    const controls = animate(count, total, { 
      duration: 0.5,
      ease: "easeOut"
    });
    return controls.stop;
  }, [count, total]);

  let currentOffset = 0;
  
  return (
    <div className="flex justify-between items-center gap-4">
      {/* Labels */}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <motion.div 
            key={index} 
            className="flex items-center gap-2 text-sm whitespace-nowrap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.label}:</span>
            <motion.span 
              className="text-muted-foreground"
              key={item.value}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {item.value}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          style={{ width: size, height: size }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={thickness}
            fill="none"
          />
          
          {/* Progress segments */}
          {items.map((item, index) => {
            const percentage = total > 0 ? item.value / total : 0;
            const strokeDasharray = circumference;
            const strokeDashoffset = Number.isFinite(circumference * (1 - percentage)) 
              ? circumference * (1 - percentage) 
              : circumference;
            const rotateAngle = total > 0 ? (currentOffset / total) * 360 : 0;
            currentOffset += item.value;

            return (
              <motion.circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={thickness}
                fill="none"
                initial={{ strokeDasharray: 0, strokeDashoffset: circumference }}
                animate={{ 
                  strokeDasharray: strokeDasharray,
                  strokeDashoffset: strokeDashoffset,
                  rotate: rotateAngle
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                style={{
                  transformOrigin: "center",
                }}
              />
            );
          })}
        </svg>

        {/* Center total */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <motion.div 
              key={total}
              className="text-2xl font-bold"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {total}
            </motion.div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}
