import { Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(13_148_136_/_0.25),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgb(45_212_191_/_0.1),_transparent_60%)]" />

        <Link to="/" className="relative z-10 flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-400/30">
            <Anchor className="h-5 w-5 text-teal-400" />
          </div>
          <span className="font-display text-lg font-semibold">WTAP</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight text-white">
            Navigate Nigeria&apos;s waterways with confidence.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Real-time vessel tracking, weather intelligence, and regulatory advisories
            for the Niger–Benue corridor.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-400">
          Water Transport Advisory Portal &copy; {new Date().getFullYear()}
        </p>
      </div>

      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 text-navy-900">
              <Anchor className="h-6 w-6 text-teal-600" />
              <span className="font-display font-semibold">Water Transport Portal</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          </div>

          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
