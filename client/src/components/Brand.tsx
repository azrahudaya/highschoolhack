import { Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`flex items-center gap-2 font-semibold ${inverse ? 'text-white' : 'text-[#101b3f]'}`} to="/">
      <span className={`grid size-9 place-items-center rounded-lg ${inverse ? 'bg-white/10' : 'bg-[#15224a] text-white'}`}>
        <Lightbulb className="size-5" aria-hidden="true" />
      </span>
      HighschoolHack
    </Link>
  );
}
