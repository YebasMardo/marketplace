import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../../lib/schemas';
import { useRegisterMutation } from '../../features/auth/authApi';
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
import { SELLER_SLIDES } from './authShowcase';

const roleOptionClass =
  'flex-1 flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper-raised/70 py-3 text-sm font-medium text-ink-soft cursor-pointer select-none ' +
  'transition-colors has-[:checked]:border-clay has-[:checked]:bg-clay-soft has-[:checked]:text-clay-dark';

export function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading, isError, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'buyer' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await registerUser(values).unwrap();
      dispatch(setToken(result.access_token));
      navigate('/');
    } catch {
      // isError du hook gère déjà l'affichage de l'erreur
    }
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Quelques informations et votre espace est ouvert."
      showcaseTitle={
        <>
          Ce que disent
          <br />
          nos vendeurs.
        </>
      }
      slides={SELLER_SLIDES}
      callout={{
        title: 'Ouvrez votre boutique en quelques minutes',
        body: 'Publiez vos produits physiques ou numériques et suivez vos ventes depuis un tableau de bord dédié.',
      }}
      footer={
        <>
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-ink hover:underline underline-offset-4">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="register-name" className={authLabelClass}>
            Nom
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Votre nom"
            {...register('name')}
            className={authInputClass}
          />
        </div>

        <div>
          <label htmlFor="register-email" className={authLabelClass}>
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className={authLabelClass}>
            Mot de passe
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="8 caractères minimum"
            aria-invalid={errors.password ? true : undefined}
            {...register('password')}
            className={authInputClass}
          />
          {errors.password && <p className={authErrorClass}>{errors.password.message}</p>}
        </div>

        <fieldset>
          <legend className={authLabelClass}>Je veux</legend>
          <div className="flex gap-3">
            <label className={roleOptionClass}>
              <input type="radio" value="buyer" {...register('role')} className="accent-clay" />
              Acheter
            </label>
            <label className={roleOptionClass}>
              <input type="radio" value="seller" {...register('role')} className="accent-clay" />
              Vendre
            </label>
          </div>
        </fieldset>

        {isError && (
          <p role="alert" className="text-sm text-clay-dark">
            {getErrorMessage(error)}
          </p>
        )}

        <button type="submit" disabled={isLoading} className={authSubmitClass}>
          {isLoading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <AuthSocialRow />
    </AuthLayout>
  );
}
