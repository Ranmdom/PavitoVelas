"use client"

import { Instagram, Facebook, Twitter, Youtube } from "lucide-react"
import { motion } from "framer-motion"

const socialLinks = [
  {
    name: "Instagram",
    url: "https://instagram.com/pavitovelas",
    icon: <Instagram className="h-5 w-5" />,
    color: "#E1306C",
  },
  {
    name: "Facebook",
    url: "https://facebook.com/pavitovelas",
    icon: <Facebook className="h-5 w-5" />,
    color: "#1877F2",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/pavitovelas",
    icon: <Twitter className="h-5 w-5" />,
    color: "#1DA1F2",
  },
  {
    name: "Youtube",
    url: "https://youtube.com/pavitovelas",
    icon: <Youtube className="h-5 w-5" />,
    color: "#FF0000",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function SocialLinks() {
  return (
    <div>
      <p className="text-muted-foreground mb-4">
        Siga-nos nas redes sociais para acompanhar novidades, lançamentos e dicas sobre nossos produtos.
      </p>

      <motion.div className="grid grid-cols-2 gap-4" variants={container} initial="hidden" animate="show">
        {socialLinks.map((social) => (
          <motion.a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/50 hover:bg-white/80 transition-all border border-white/30"
            variants={item}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="rounded-full p-2" style={{ backgroundColor: `${social.color}20` }}>
              <div style={{ color: social.color }}>{social.icon}</div>
            </div>
            <span className="font-medium">{social.name}</span>
          </motion.a>
        ))}
      </motion.div>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">Compartilhe suas experiências com nossas velas usando a hashtag</p>
        <p className="text-[#631C21] font-medium mt-1">#PavitoVelas</p>
      </div>
    </div>
  )
}
