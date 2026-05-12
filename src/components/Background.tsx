import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const Background = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 1.5 + 0.5}px`,
      duration: `${Math.random() * 5 + 3}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="cosmic-bg pointer-events-none">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
      
      {/* Stardust Texture Layer */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}
      />

      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            "--duration": star.duration
          } as any}
        />
      ))}
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] zodiac-wheel opacity-[0.02]">
        <img 
          src="https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800" 
          alt="Zodiac Wheel"
          className="w-full h-full object-contain filter invert"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="absolute top-1/4 left-1/4 w-[1px] h-[100px] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
      <div className="absolute top-1/2 right-[10%] w-[1px] h-[150px] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
    </div>
  );
};
