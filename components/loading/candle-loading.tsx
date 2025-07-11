"use client"

export default function CandleLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Container da vela */}
      <div className="relative">
        {/* Base da vela */}
        <div className="w-8 h-16 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-lg shadow-lg relative">
          {/* Textura da vela */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-b-lg" />

          {/* Pavio */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-amber-800 -translate-y-1" />
        </div>

        {/* Chama da vela */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            {/* Chama principal */}
            <div className="w-3 h-6 bg-gradient-to-t from-orange-400 via-yellow-300 to-yellow-100 rounded-full animate-pulse">
              {/* Núcleo da chama */}
              <div
                className="absolute inset-1 bg-gradient-to-t from-orange-300 to-yellow-200 rounded-full animate-bounce"
                style={{ animationDuration: "1.5s" }}
              />
            </div>

            {/* Efeito de glow */}
            <div
              className="absolute inset-0 w-3 h-6 bg-yellow-300/60 rounded-full blur-sm animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Efeito de luz ambiente */}
        <div
          className="absolute -inset-4 bg-gradient-radial from-amber-200/30 via-amber-100/20 to-transparent rounded-full animate-pulse"
          style={{ animationDuration: "3s" }}
        />

        {/* Partículas flutuantes */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300/80 rounded-full animate-float"
              style={{
                left: `${-10 + i * 5}px`,
                top: `${i * 3}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Texto de loading */}
      <div className="mt-6 text-center">
        <p className="text-amber-800 font-medium animate-pulse">Acendendo as velas...</p>
        <div className="flex justify-center mt-2 space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
