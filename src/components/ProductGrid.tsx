import { motion } from "motion/react";
import { 
  CircleDollarSign, 
  Heart, 
  Briefcase, 
  Gem, 
  Search, 
  MapPin, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";

const PRODUCTS = [
  {
    id: "daily-luck",
    icon: <Gem className="text-gold" />,
    title: "Daily Luck & Muhurat",
    desc: "Find your luck score, lucky colors, and energy alignment for today.",
    price: 12,
    originalPrice: 49,
    time: "Instant"
  },
  {
    id: "business-success",
    icon: <TrendingUp className="text-cyan-400" />,
    title: "Business Success Timer",
    desc: "Know the best time to launch a business, sign deals, or start ventures.",
    price: 29,
    originalPrice: 99,
    time: "2 Mins"
  },
  {
    id: "love-compatibility",
    icon: <Heart className="text-rose-500" />,
    title: "Love Compatibility Snapshot",
    desc: "Discover emotional compatibility, attraction levels, and relationship energy.",
    price: 19,
    originalPrice: 79,
    time: "Instant"
  },
  {
    id: "numerology-destiny",
    icon: <CircleDollarSign className="text-emerald-400" />,
    title: "Numerology Destiny",
    desc: "Reveal your life path number, hidden strengths, and lucky dates.",
    price: 21,
    originalPrice: 69,
    time: "Instant"
  },
  {
    id: "marriage-muhurat",
    icon: <Calendar className="text-orange-400" />,
    title: "Marriage Muhurat Finder",
    desc: "Favorable wedding dates based on deep Vedic star calculations.",
    price: 49,
    originalPrice: 199,
    time: "5 Mins"
  },
  {
    id: "vastu-energy",
    icon: <MapPin className="text-yellow-400" />,
    title: "Vastu Energy Scan",
    desc: "Check if your home energy alignment supports wealth and peace.",
    price: 39,
    originalPrice: 149,
    time: "3 Mins"
  }
];

export const ProductGrid = ({ onSelect }: { onSelect: (id: string, price: number) => void }) => {
  return (
    <section id="products" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-amber-200">Micro Reports</h2>
           <p className="text-gray-400 mt-2">Personalized insights at pocket-friendly prices.</p>
        </div>
        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 mr-2">
          Limited Time: ₹12 Offer
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect(product.id, product.price)}
            className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {product.icon}
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500 line-through">₹{product.originalPrice}</div>
                <div className="text-xl font-black text-amber-400 leading-none mt-1">₹{product.price}</div>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2 group-hover:text-amber-300 transition-colors">{product.title}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">{product.desc}</p>

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock size={10} />
                  Delivery: {product.time}
               </div>
               <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all">
                  <ChevronRight size={16} />
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
