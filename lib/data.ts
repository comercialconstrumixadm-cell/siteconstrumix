export const WA_PHONE = '5579999196363';

export function waLink(text: string) {
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

export interface Category {
  slug: string;
  title: string;
  tagline: string;
  color1: string;
  color2: string;
}

export interface Product {
  id: number;
  cat: string;
  name: string;
  price: number;
  unit?: string;
  from?: boolean;
  tag?: string;
  glyph: string;
  bg1: string;
  bg2: string;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'pisos', title: 'Pisos & Revestimentos', tagline: 'Porcelanato, cerâmica, laminado', color1: '#3ec055', color2: '#1a8a2e' },
  { slug: 'portas', title: 'Portas & Madeiras', tagline: 'Portas, batentes, ripas, MDF', color1: '#a06a3b', color2: '#5b3a22' },
  { slug: 'hidraulica', title: 'Hidráulica', tagline: 'PVC, conexões, registros, caixas', color1: '#2563eb', color2: '#1e3a8a' },
  { slug: 'eletrica', title: 'Elétrica', tagline: 'Fios, disjuntores, tomadas, lâmpadas', color1: '#f59e0b', color2: '#b45309' },
  { slug: 'tintas', title: 'Tintas & Acabamento', tagline: 'Acrílica, esmalte, texturas', color1: '#ef4444', color2: '#991b1b' },
  { slug: 'ferramentas', title: 'Ferramentas', tagline: 'Manual, elétrica e a bateria', color1: '#475569', color2: '#1e293b' },
  { slug: 'metais', title: 'Metais & Louças', tagline: 'Torneiras, chuveiros, cubas', color1: '#0891b2', color2: '#0e7490' },
  { slug: 'fundicao', title: 'Fundição', tagline: 'Cimento, areia, brita, blocos', color1: '#737373', color2: '#404040' },
];

export const PRODUCTS: Product[] = [
  { id: 1, cat: 'Pisos', name: 'Porcelanato Acetinado 84x84 Marmorizado', price: 42.90, unit: 'm²', from: true, tag: 'TOP VENDA', glyph: 'PISO', bg1: '#475569', bg2: '#1e293b' },
  { id: 2, cat: 'Portas', name: 'Porta de Madeira Maciça Almofadada 80cm', price: 389.00, tag: 'OFERTA', glyph: 'PORTA', bg1: '#a06a3b', bg2: '#5b3a22' },
  { id: 3, cat: 'Hidráulica', name: 'Tubo PVC Soldável 25mm Tigre Barra 6m', price: 38.50, unit: 'barra', glyph: 'PVC', bg1: '#2563eb', bg2: '#1e3a8a' },
  { id: 4, cat: 'Tintas', name: 'Tinta Acrílica Premium Suvinil 18L Branco', price: 269.00, tag: 'NOVO', glyph: 'TINTA', bg1: '#ef4444', bg2: '#991b1b' },
  { id: 5, cat: 'Elétrica', name: 'Fio Flexível 2,5mm 100m Antichama', price: 189.00, glyph: 'FIO', bg1: '#f59e0b', bg2: '#b45309' },
  { id: 6, cat: 'Pisos', name: 'Cerâmica Esmaltada 60x60 Bege Acetinado', price: 32.90, unit: 'm²', from: true, tag: 'OFERTA', glyph: 'CER', bg1: '#d4a574', bg2: '#8b6f47' },
  { id: 7, cat: 'Metais', name: 'Torneira Monocomando Banheiro Cromada', price: 179.00, glyph: 'METAL', bg1: '#0891b2', bg2: '#0e7490' },
  { id: 8, cat: 'Ferramentas', name: 'Furadeira de Impacto 650W Profissional', price: 259.00, tag: 'OFERTA', glyph: 'FURA', bg1: '#475569', bg2: '#1e293b' },
  { id: 9, cat: 'Fundição', name: 'Cimento CP-II Saco 50kg Votoran', price: 38.90, glyph: 'CIM', bg1: '#737373', bg2: '#404040' },
  { id: 10, cat: 'Hidráulica', name: "Caixa d'Água 1000L Polietileno Fortlev", price: 489.00, glyph: 'CAIXA', bg1: '#2563eb', bg2: '#1e3a8a' },
  { id: 11, cat: 'Tintas', name: 'Massa Corrida PVA 25kg Coral', price: 79.90, glyph: 'MASSA', bg1: '#ef4444', bg2: '#991b1b' },
  { id: 12, cat: 'Portas', name: 'Batente de Madeira Angelim 80cm', price: 159.00, glyph: 'BAT', bg1: '#a06a3b', bg2: '#5b3a22' },
];

export const TESTIMONIALS: Testimonial[] = [
  { name: 'Marcos Vieira', role: 'Pedreiro autônomo • Aracaju', text: 'Comprei piso e revestimento pra obra inteira. Preço bom, entregaram no dia certo e ainda me orientaram na quantidade. Tô voltando.' },
  { name: 'Aline Costa', role: 'Arquiteta • Aracaju', text: 'Atendimento muito atencioso. O vendedor me mandou fotos e amostras pelo zap, fechei tudo de casa. Salvou minha semana.' },
  { name: 'José Ribeiro', role: 'Cliente • Lagarto/SE', text: 'Sou do interior e a entrega chegou em 2 dias. Material todo certinho, sem quebra. Recomendo demais a Construmix.' },
];
