import { lazy, Suspense, type ReactNode } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router';
import { AppShell } from './layout/AppShell';
import { RouteFallback } from './layout/RouteFallback';
import { RequireRole } from './layout/RequireRole';
import { HomePage } from './features/home/HomePage';
import { RouteError } from './features/errors/RouteError';

const page = (loader: () => Promise<{ default: React.ComponentType }>) => {
  const C = lazy(loader);
  return (
    <Suspense fallback={<RouteFallback />}>
      <C />
    </Suspense>
  );
};

const guard = (role: 'autor' | 'admin', el: ReactNode) => <RequireRole min={role}>{el}</RequireRole>;

const router = createHashRouter([
  {
    path: '/acceso',
    element: page(() => import('./features/auth/AccessPage')),
    errorElement: <RouteError standalone />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError standalone />,
    children: [
      {
        // Sin ruta propia: el error de una página se muestra dentro del armazón (cabecera y navegación siguen)
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'aprender', element: page(() => import('./features/learn/LearnHub')) },
          { path: 'aprender/:area', element: page(() => import('./features/learn/AreaPage')) },
          { path: 'aprender/:area/evaluacion', element: page(() => import('./features/learn/AssessmentPage')) },
          { path: 'aprender/:area/:slug', element: page(() => import('./features/learn/FormationPage')) },
          { path: 'aprender/:area/:slug/test', element: page(() => import('./features/learn/QuizPage')) },
          { path: 'consultar', element: page(() => import('./features/library/ConsultHub')) },
          { path: 'consultar/actualidad', element: page(() => import('./features/library/NewsList')) },
          { path: 'consultar/actualidad/:slug', element: page(() => import('./features/library/NewsDetail')) },
          { path: 'consultar/notas', element: page(() => import('./features/library/NotesPage')) },
          { path: 'consultar/notas/:id', element: page(() => import('./features/library/NotesPage')) },
          { path: 'consultar/lecturas', element: page(() => import('./features/library/ReadingsPage')) },
          { path: 'consultar/lecturas/:id', element: page(() => import('./features/library/ReadingsPage')) },
          { path: 'participar', element: page(() => import('./features/community/ParticipateHub')) },
          { path: 'participar/agenda', element: page(() => import('./features/community/AgendaPage')) },
          { path: 'participar/agenda/:slug', element: page(() => import('./features/community/AgendaPage')) },
          { path: 'participar/calendario', element: page(() => import('./features/community/CalendarPage')) },
          { path: 'participar/contribuye', element: page(() => import('./features/community/ContributePage')) },
          { path: 'perfil', element: page(() => import('./features/profile/ProfilePage')) },
          { path: 'perfil/ajustes', element: page(() => import('./features/profile/SettingsPage')) },
          { path: 'gestion', element: guard('autor', page(() => import('./features/manage/ManagePage'))) },
          { path: 'gestion/nuevo', element: guard('autor', page(() => import('./features/manage/CreatePage'))) },
          { path: 'gestion/nuevo/:type', element: guard('autor', page(() => import('./features/manage/EditorPage'))) },
          { path: 'gestion/editar/:id', element: guard('autor', page(() => import('./features/manage/EditorPage'))) },
          { path: 'admin', element: guard('admin', page(() => import('./features/admin/AdminPage'))) },
          { path: 'admin/:section', element: guard('admin', page(() => import('./features/admin/AdminPage'))) },
          { path: 'sobre', element: page(() => import('./features/about/AboutPage')) },
          ...(import.meta.env.DEV ? [{ path: 'dev/widgets', element: page(() => import('./features/learn/widgets/Gallery')) }] : []),
          { path: 'inicio', element: <Navigate to="/" replace /> },
          { path: '*', element: page(() => import('./features/errors/NotFound')) },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
