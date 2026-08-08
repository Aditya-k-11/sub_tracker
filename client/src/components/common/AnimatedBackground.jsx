import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = React.memo(() => {
  
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100, 
      size: Math.random() * 2 + 2, 
      duration: Math.random() * 12 + 18, 
      delayStart: Math.random() * 10,
      sway: (Math.random() - 0.5) * 60, 
      opacity: Math.random() * 0.2 + 0.05, 
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-gray-50 flex items-center justify-center">
      
      {}
      <div className="absolute inset-0 opacity-60">
        <motion.div
          className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-300/40 via-primary-300/10 to-transparent"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            x: ["-50%", "-30%", "-60%", "-50%"],
            y: ["-50%", "-60%", "-30%", "-50%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute top-[60%] left-[70%] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-300/30 via-accent-300/10 to-transparent"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            x: ["-50%", "-70%", "-30%", "-50%"],
            y: ["-50%", "-40%", "-70%", "-50%"],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute top-[80%] left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-warning-300/20 via-warning-300/5 to-transparent"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            x: ["-50%", "-30%", "-60%", "-50%"],
            y: ["-50%", "-20%", "-60%", "-50%"],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute top-[20%] left-[80%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-danger-300/20 via-danger-300/5 to-transparent"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            x: ["-50%", "-60%", "-40%", "-50%"],
            y: ["-50%", "-30%", "-60%", "-50%"],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div
          className="absolute top-[40%] left-[40%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-200/30 via-primary-200/5 to-transparent"
          style={{ x: "-50%", y: "-50%" }}
          animate={{
            x: ["-50%", "-40%", "-60%", "-50%"],
            y: ["-50%", "-60%", "-40%", "-50%"],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary-500" 
            style={{
              width: p.size,
              height: p.size,
              left: `${p.startX}%`,
              bottom: "-20px", 
            }}
            animate={{
              y: ["0vh", "-120vh"], 
              x: [0, p.sway, -p.sway, 0], 
              opacity: [0, p.opacity, p.opacity, 0],
            }}
            transition={{
              y: {
                duration: p.duration,
                repeat: Infinity,
                ease: "linear",
                delay: p.delayStart,
              },
              x: {
                duration: p.duration * 0.7,
                repeat: Infinity,
                ease: "linear", 
                delay: p.delayStart,
              },
              opacity: {
                duration: p.duration,
                repeat: Infinity,
                ease: "linear",
                delay: p.delayStart,
                times: [0, 0.2, 0.8, 1], 
              }
            }}
          />
        ))}
      </div>
      
    </div>
  );
});

export default AnimatedBackground;
