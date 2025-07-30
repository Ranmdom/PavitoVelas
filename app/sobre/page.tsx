import type { Metadata } from "next"
import Image from "next/image"
import { Flame, Heart, Leaf, Users, Award, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Sobre Nós | Pavito Velas",
  description: "Conheça a história da Pavito Velas e nossa paixão por criar velas artesanais únicas e especiais.",
}

export default function AboutPage() {
   const ano = 2018;
   const cidade = "São Paulo";
   const criadora = "Maria Elena";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBE1D0]/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#631C21] to-[#882335] py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/flame-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#F4847B]/20 p-4">
                <Flame className="h-12 w-12 text-[#F4847B]" />
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">Nossa História</h1>
            <p className="text-xl text-white/90 md:text-2xl">
              Uma jornada de paixão, dedicação e amor pelo artesanato que ilumina lares e aquece corações
            </p>
          </div>
        </div>
      </section>

      {/* História Principal */}
      {/* <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-[#F4847B]/10 px-4 py-2">
                <span className="text-sm font-medium text-[#882335]">Como tudo começou</span>
              </div>
              <h2 className="text-3xl font-bold text-[#631C21] md:text-4xl">A chama que acendeu nossos sonhos</h2>
              <div className="space-y-4 text-[#631C21]/80 leading-relaxed">
                <p>
                  Em {ano}, em uma pequena casa em {cidade}, {criadora} descobriu sua paixão pelas velas
                  artesanais. O que começou como um hobby para relaxar após longos dias de trabalho, rapidamente se
                  transformou em algo muito maior.
                </p>
                <p>
                  A primeira vela que criou foi para sua filha, que estava passando por um momento difícil. O aroma
                  suave de lavanda e a luz dourada que dançava pela sala trouxeram uma paz que ela nunca havia
                  experimentado. Foi nesse momento que percebeu o poder transformador das velas artesanais.
                </p>
                <p>
                  O nome "Pavito" surgiu de uma palavra carinhosa que sua avó italiana usava para se referir às pequenas
                  chamas das velas da igreja. Significa "pequena chama" em dialeto italiano, representando nossa crença
                  de que pequenos gestos podem iluminar grandes momentos.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#FBE1D0] to-[#F4847B]/20">
                <Image
                  src="/placeholder.svg?height=600&width=480"
                  alt="{criadora} criando velas artesanais"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-white p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#F4847B]/20 p-2">
                    <Heart className="h-5 w-5 text-[#882335]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#631C21]">Desde {ano}</p>
                    <p className="text-sm text-[#631C21]/70">Criando momentos especiais</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Valores */}
      <section className="bg-[#FBE1D0]/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#631C21] md:text-4xl">Nossos Valores</h2>
            <p className="mx-auto max-w-2xl text-[#631C21]/80">
              Cada vela que criamos carrega em si os valores que nos guiam e a paixão que nos move
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-[#F4847B]/20 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#F4847B]/20 p-3">
                    <Leaf className="h-8 w-8 text-[#882335]" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#631C21]">Sustentabilidade</h3>
                <p className="text-[#631C21]/80">
                  Utilizamos apenas ingredientes naturais e sustentáveis, respeitando o meio ambiente em cada etapa do
                  processo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#F4847B]/20 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#F4847B]/20 p-3">
                    <Heart className="h-8 w-8 text-[#882335]" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#631C21]">Amor pelo Artesanato</h3>
                <p className="text-[#631C21]/80">
                  Cada vela é criada à mão com dedicação e carinho, preservando a tradição artesanal em cada detalhe.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#F4847B]/20 bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#F4847B]/20 p-3">
                    <Users className="h-8 w-8 text-[#882335]" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#631C21]">Conexão Humana</h3>
                <p className="text-[#631C21]/80">
                  Acreditamos que nossas velas criam momentos de conexão, relaxamento e bem-estar para toda a família.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Processo Artesanal */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[#631C21] md:text-4xl">Nosso Processo Artesanal</h2>
            <p className="mx-auto max-w-2xl text-[#631C21]/80">
              Cada vela passa por um processo cuidadoso que combina tradição, qualidade e inovação
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#882335] text-white">
                  <span className="text-xl font-bold">1</span>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#631C21]">Seleção dos Ingredientes</h3>
              <p className="text-sm text-[#631C21]/80">
                Escolhemos cuidadosamente cera de soja 100% natural e óleos essenciais puros de alta qualidade.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#882335] text-white">
                  <span className="text-xl font-bold">2</span>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#631C21]">Criação da Fragrância</h3>
              <p className="text-sm text-[#631C21]/80">
                Desenvolvemos blends únicos de aromas, testando cada combinação até alcançar a perfeição.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#882335] text-white">
                  <span className="text-xl font-bold">3</span>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#631C21]">Moldagem Artesanal</h3>
              <p className="text-sm text-[#631C21]/80">
                Cada vela é moldada à mão em pequenos lotes, garantindo atenção aos mínimos detalhes.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#882335] text-white">
                  <span className="text-xl font-bold">4</span>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#631C21]">Controle de Qualidade</h3>
              <p className="text-sm text-[#631C21]/80">
                Testamos cada vela para garantir queima uniforme, duração e intensidade aromática ideais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      {/* <section className="bg-gradient-to-r from-[#631C21] to-[#882335] py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Clock className="h-8 w-8 text-[#F4847B]" />
              </div>
              <div className="mb-1 text-3xl font-bold">6+</div>
              <div className="text-white/80">Anos de experiência</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Flame className="h-8 w-8 text-[#F4847B]" />
              </div>
              <div className="mb-1 text-3xl font-bold">50+</div>
              <div className="text-white/80">Fragrâncias exclusivas</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Heart className="h-8 w-8 text-[#F4847B]" />
              </div>
              <div className="mb-1 text-3xl font-bold">5000+</div>
              <div className="text-white/80">Clientes satisfeitos</div>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <Award className="h-8 w-8 text-[#F4847B]" />
              </div>
              <div className="mb-1 text-3xl font-bold">100%</div>
              <div className="text-white/80">Ingredientes naturais</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Missão */}
      <section className="bg-[#FBE1D0]/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-[#882335]/20 p-4">
                <Flame className="h-12 w-12 text-[#882335]" />
              </div>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-[#631C21] md:text-4xl">Nossa Missão</h2>
            <p className="mb-8 text-xl text-[#631C21]/80 leading-relaxed">
              "Iluminar lares e aquecer corações através de velas artesanais que despertam memórias, criam atmosferas
              acolhedoras e promovem momentos de bem-estar e conexão."
            </p>
            <div className="rounded-2xl bg-white/60 p-8 backdrop-blur-sm">
              <p className="text-[#631C21]/80 leading-relaxed">
                Acreditamos que cada vela tem o poder de transformar um ambiente comum em um espaço especial. Nossa
                paixão vai além da criação de produtos - queremos fazer parte dos seus momentos mais preciosos, seja um
                jantar romântico, um banho relaxante ou uma noite aconchegante em família.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
