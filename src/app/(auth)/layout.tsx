import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Jornada Bíblica</span>
          </Link>

          <div>
            <blockquote className="text-2xl font-light leading-relaxed mb-6 italic">
              &ldquo;Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.&rdquo;
            </blockquote>
            <p className="text-white/70">Salmos 119:105</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Livros", value: "66" },
              { label: "Capítulos", value: "1.189" },
              { label: "Versículos", value: "31.102" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Jornada Bíblica</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
