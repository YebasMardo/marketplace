import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '../../lib/schemas';
import { useLoginMutation } from '../../features/auth/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setToken } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../lib/errorUtils';
import {
  AuthLayout,
  AuthSocialRow,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authSubmitClass,
} from '../../components/layout/AuthLayout';
import { BUYER_SLIDES } from './authShowcase';

export function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, isError, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(setToken(result.access_token));
      navigate('/');
    } catch {
      // isError du hook gère déjà l'affichage de l'erreur
    }
  };

  return (
    <AuthLayout
      title="Bon retour"
      subtitle="Entrez vos identifiants pour retrouver votre compte."
      showcaseTitle={
        <>
          Ce que disent
          <br />
          nos acheteurs.
        </>
      }
      slides={BUYER_SLIDES}
      callout={{
        title: 'Achetez directement à ceux qui fabriquent',
        body: 'Des milliers de produits publiés par des vendeurs indépendants, sans intermédiaire.',
      }}
      footer={
        <>
          Pas de compte ?{' '}
          <Link to="/register" className="font-medium text-ink hover:underline underline-offset-4">
            S'inscrire
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            aria-invalid={errors.email ? true : undefined}
            {...register('email')}
            className={authInputClass}
          />
          {errors.email && <p className={authErrorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className={authLabelClass}>
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            {...register('password')}
            className={authInputClass}
          />
          {errors.password && <p className={authErrorClass}>{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-4 pt-0.5">
          <label className="flex items-center gap-2 text-[13px] text-ink-soft cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line-strong accent-clay"
            />
            Rester connecté
          </label>
          {/* Aucune route de réinitialisation n'existe côté backend pour
              l'instant : bouton présent mais désactivé plutôt qu'un lien mort. */}
          <button
            type="button"
            disabled
            title="Réinitialisation — bientôt disponible"
            className="text-[13px] font-medium text-ink-faint disabled:cursor-not-allowed"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {isError && (
          <p role="alert" className="text-sm text-clay-dark">
            {getErrorMessage(error)}
          </p>
        )}

        <button type="submit" disabled={isLoading} className={authSubmitClass}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <AuthSocialRow />
    </AuthLayout>
  );
}
