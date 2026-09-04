const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = [
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
];

function tresDigitos(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const partes: string[] = [];
  const centena = Math.floor(n / 100);
  const resto = n % 100;

  if (centena > 0) partes.push(CENTENAS[centena]);

  if (resto > 0) {
    if (partes.length > 0) partes.push('e');
    if (resto < 10) {
      partes.push(UNIDADES[resto]);
    } else if (resto < 20) {
      partes.push(DEZ_A_DEZENOVE[resto - 10]);
    } else {
      const dezena = Math.floor(resto / 10);
      const unidade = resto % 10;
      partes.push(unidade === 0 ? DEZENAS[dezena] : `${DEZENAS[dezena]} e ${UNIDADES[unidade]}`);
    }
  }

  return partes.join(' ');
}

/** Números inteiros por extenso, em português — suporta até 999.999.999. */
export function numeroPorExtenso(n: number): string {
  if (n === 0) return 'zero';

  const milhao = Math.floor(n / 1_000_000);
  const resto1 = n % 1_000_000;
  const milhar = Math.floor(resto1 / 1000);
  const resto2 = resto1 % 1000;

  const partes: string[] = [];

  if (milhao > 0) {
    partes.push(milhao === 1 ? 'um milhão' : `${tresDigitos(milhao)} milhões`);
  }
  if (milhar > 0) {
    partes.push(milhar === 1 ? 'mil' : `${tresDigitos(milhar)} mil`);
  }
  if (resto2 > 0) {
    if (partes.length > 0 && (resto2 < 100 || resto2 % 100 === 0)) {
      partes.push('e');
    }
    partes.push(tresDigitos(resto2));
  }

  return partes.join(' ');
}

/** Valor em reais por extenso, ex: 200 -> "duzentos reais", 125.50 -> "cento e vinte e cinco reais e cinquenta centavos". */
export function valorPorExtenso(valor: number): string {
  const arredondado = Math.round(valor * 100) / 100;
  const inteiro = Math.floor(arredondado);
  const centavos = Math.round((arredondado - inteiro) * 100);

  const parteReais = inteiro === 0 ? 'zero reais' : `${numeroPorExtenso(inteiro)} ${inteiro === 1 ? 'real' : 'reais'}`;

  if (centavos === 0) return parteReais;

  const parteCentavos = `${numeroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  return `${parteReais} e ${parteCentavos}`;
}
