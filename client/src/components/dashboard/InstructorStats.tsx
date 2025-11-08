import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Users, BookOpen, Star, DollarSign } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 20, stiffness: 100 });
  const displayValue = useTransform(springValue, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    motionValue.set(value);
  }, [value]);

  return (
    <motion.span>
      {displayValue}
    </motion.span>
  );
};

const socket = io("http://localhost:4000"); // your backend URL

const InstructorStats = ({ className = "" }) => {
  const [stats, setStats] = useState<Stat[]>([]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const instructorId = storedUser ? JSON.parse(storedUser).id : null;

    if (instructorId) {
      socket.emit("registerInstructor", instructorId);
      console.log("📡 Registered instructor for real-time stats:", instructorId);
    } else {
      console.warn("⚠️ No instructor ID found — stats won't load.");
    }

    socket.on("statsUpdate", (data) => {
      if (data) {
        setStats([
          {
            title: "Total Students",
            value: data.totalStudents.toString(),
            icon: <Users className="w-6 h-6" />,
            color: "bg-blue-500",
          },
          {
            title: "Courses Created",
            value: data.totalCourses.toString(),
            icon: <BookOpen className="w-6 h-6" />,
            color: "bg-emerald-500",
          },
          {
            title: "Average Rating",
            value: parseFloat(data.averageRating).toFixed(1),
            icon: <Star className="w-6 h-6" />,
            color: "bg-amber-400",
          },
          {
            title: "Total Earnings",
            value: `$${Number(data.totalEarnings).toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6" />,
            color: "bg-blue-600",
          },
        ]);
      }
    });

    return () => {
      socket.off("statsUpdate");
    };
  }, []);
  if (stats.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        Waiting for analytics data...
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.15, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-5 flex items-center justify-between transition-all"
        >
          <div>
            <h3 className="text-gray-400 text-sm">{stat.title}</h3>
            <p className="text-2xl font-bold text-white mt-1">
              {stat.title === "Total Earnings"
                ? `$${Number(stat.value.replace(/[^0-9.-]+/g, ""))}`
                : <AnimatedNumber value={Number(stat.value)} />}
            </p>
          </div>
          <div className={`p-3 rounded-full ${stat.color} bg-opacity-20 text-white`}>
            {stat.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default InstructorStats;
