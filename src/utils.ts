export const calcularExtras = (
  timeCheckIn: string,
  timeCheckOut: string
): number => {
  if (!timeCheckIn || !timeCheckOut) return 0;

  const entrada = new Date(timeCheckIn);
  const salida = new Date(timeCheckOut);

  const day = entrada.getDay();
  if (day === 0 || day === 6) return 0; // Solo Lunes a Viernes

  const inicioLaboral = new Date(entrada);
  inicioLaboral.setHours(9, 0, 0, 0);

  const finLaboral = new Date(entrada);
  finLaboral.setHours(18, 0, 0, 0);

  const msPerHour = 1000 * 60 * 60;

  const extraAntes = entrada < inicioLaboral
    ? (inicioLaboral.getTime() - entrada.getTime()) / msPerHour
    : 0;

  const extraDespues = salida > finLaboral
    ? (salida.getTime() - finLaboral.getTime()) / msPerHour
    : 0;

  return Math.round((extraAntes + extraDespues) * 100) / 100;
};
