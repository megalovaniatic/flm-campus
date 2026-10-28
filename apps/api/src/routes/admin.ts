import { madridDateKey } from '@flm/shared';
import { Hono, type Context } from 'hono';
import { z } from 'zod';
import type { AppContext, AppEnv } from '../context';
import { toCsv, type CsvValue } from '../lib/csv';
import { notFound } from '../lib/errors';
import { queryParams } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { audit, queryAudit } from '../services/audit';
import { getContent } from '../services/content';
import { contentDisposition } from '../services/files';
import { commonErrorsCsv, commonErrorsReport, complianceCsv, complianceReport } from '../services/reports';

function csvResponse(c: Context<AppEnv>, filename: string, csv: { headers: string[]; rows: CsvValue[][] }) {
  return c.body(toCsv(csv.headers, csv.rows), 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': contentDisposition('attachment', filename),
    'Cache-Control': 'private, no-store',
  });
}

/** Informes restringidos (cumplimiento, errores frecuentes, CSV) y registro de auditoría. */
export function adminRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  r.get('/reports/compliance', requirePermission('informes:ver'), (c) => {
    const q = queryParams(c, z.object({ format: z.enum(['json', 'csv']).default('json'), view: z.enum(['personas', 'formaciones']).default('personas') }));
    const now = ctx.now();
    const report = complianceReport(db, now);
    if (q.format === 'csv') {
      audit(db, { actorId: currentUser(c).id, action: 'informe.exportar', entity: 'informe', detail: `Cumplimiento (${q.view})`, ip: c.get('clientIp') }, now);
      return csvResponse(c, `cumplimiento-${q.view}-${madridDateKey(now)}.csv`, complianceCsv(report, q.view));
    }
    return c.json(report);
  });

  r.get('/reports/errors/:contentId', requirePermission('informes:ver'), (c) => {
    const { format } = queryParams(c, z.object({ format: z.enum(['json', 'csv']).default('json') }));
    const row = getContent(db, c.req.param('contentId'));
    if (!row || (row.type !== 'formacion' && row.type !== 'test')) throw notFound('No existe ninguna formación ni evaluación con ese identificador.');
    const report = commonErrorsReport(db, row);
    if (format === 'csv') {
      const now = ctx.now();
      audit(db, { actorId: currentUser(c).id, action: 'informe.exportar', entity: 'informe', entityId: row.id, detail: 'Errores frecuentes', ip: c.get('clientIp') }, now);
      return csvResponse(c, `errores-${row.slug ?? row.id}-${madridDateKey(now)}.csv`, commonErrorsCsv(report));
    }
    return c.json(report);
  });

  r.get('/audit', requirePermission('auditoria:ver'), (c) => {
    const q = queryParams(
      c,
      z.object({
        action: z.string().trim().max(100).optional(),
        entity: z.string().trim().max(50).optional(),
        entityId: z.string().trim().max(200).optional(),
        actorId: z.string().trim().max(200).optional(),
        from: z.string().trim().max(40).optional(),
        to: z.string().trim().max(40).optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100),
        offset: z.coerce.number().int().min(0).default(0),
      }),
    );
    return c.json(queryAudit(db, q));
  });

  return r;
}
