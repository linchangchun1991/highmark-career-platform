'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MatchingLoaderProps {
  progress: number;
  currentStage: string;
  keywords?: string[];
}

export function MatchingLoader({ progress, currentStage, keywords = [] }: MatchingLoaderProps) {
  const [displayedKeywords, setDisplayedKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (keywords.length > 0) {
      // 逐步显示关键词
      const interval = setInterval(() => {
        setDisplayedKeywords((prev) => {
          if (prev.length < keywords.length) {
            return [...prev, keywords[prev.length]];
          }
          return prev;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [keywords]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      {/* 全息扫描进度条 */}
      <div className="w-full max-w-2xl">
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>
        <div className="mt-2 text-center">
          <motion.span
            key={currentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-[#0F172A]"
          >
            {currentStage}
          </motion.span>
        </div>
      </div>

      {/* 关键词展示（在解析简历阶段） */}
      {keywords.length > 0 && displayedKeywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 justify-center max-w-2xl"
        >
          {displayedKeywords.map((keyword, index) => (
            <motion.div
              key={`${keyword}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 bg-[#D97706]/10 text-[#D97706] rounded-full text-sm font-medium"
            >
              {keyword}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 加载动画 */}
      <div className="relative w-32 h-32">
        <motion.div
          className="absolute inset-0 border-4 border-[#D97706]/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-[#D97706] rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}

