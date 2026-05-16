import Image from 'next/image';

interface MascotProps {
  height?: number;
  pose?: 'wave' | 'arms';
  style?: React.CSSProperties;
}

export default function Mascot({ height = 360, pose = 'wave', style = {} }: MascotProps) {
  const src = pose === 'arms' ? '/assets/mascote-bracos.png' : '/assets/mascote-acolhe.png';
  return (
    <Image
      src={src}
      alt="Mascote Construmix"
      width={0}
      height={height}
      sizes="100vw"
      style={{
        height,
        width: 'auto',
        display: 'block',
        filter: 'drop-shadow(0 22px 32px rgba(13,74,26,.35))',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
      draggable={false}
    />
  );
}
