import type { Formation, QuizQuestion } from '@flm/shared';
import * as fis_01_recargos from './fis-01-recargos';
import * as fis_02_verifactu from './fis-02-verifactu';
import * as fis_03_gastos from './fis-03-gastos';
import * as lab_01_despido from './lab-01-despido';
import * as lab_02_jornada from './lab-02-jornada';
import * as lab_03_contratos from './lab-03-contratos';
import * as mer_01_derivar from './mer-01-derivar';
import * as mer_02_perdidas from './mer-02-perdidas';
import * as mer_03_cuentas from './mer-03-cuentas';
import * as con_01_boicac_147 from './con-01-boicac-147';
import * as con_02_devengo from './con-02-devengo';
import * as con_03_amortizacion from './con-03-amortizacion';
import * as con_04_importaciones_dua from './con-04-importaciones-dua';
import * as con_05_amortizaciones from './con-05-amortizaciones';
import * as con_06_bienes_inversion from './con-06-bienes-inversion';
import * as con_07_anticipos from './con-07-anticipos';

const modules = [fis_01_recargos, fis_02_verifactu, fis_03_gastos, lab_01_despido, lab_02_jornada, lab_03_contratos, mer_01_derivar, mer_02_perdidas, mer_03_cuentas, con_01_boicac_147, con_02_devengo, con_03_amortizacion, con_04_importaciones_dua, con_05_amortizaciones, con_06_bienes_inversion, con_07_anticipos];

/** Formaciones del campus por área, cada una en su archivo (al menos tres por área). */
export const formations: Formation[] = modules.map((m) => m.formation).filter((f): f is Formation => f !== null);

/** Bancos de preguntas por formación (para las evaluaciones sectoriales). */
export const banks: Record<string, QuizQuestion[]> = Object.fromEntries(modules.filter((m) => m.formation).map((m) => [m.formation!.id, m.bank]));
