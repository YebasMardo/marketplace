import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '../../lib/schemas';
import { useRegisterMutation } from '../../features/auth/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setToken } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../lib/errorUtils';

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Créer un compte</h1>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Je veux
          </label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
              <input type="radio" value="buyer" {...register('role')} className="accent-teal-700" />
              Acheter
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 cursor-pointer has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
              <input type="radio" value="seller" {...register('role')} className="accent-teal-700" />
              Vendre
            </label>
          </div>
        </div>

        {isError && (
          <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 text-white rounded-lg py-2.5 font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Création...' : 'Créer mon compte'}
        </button>

        <p className="text-sm text-slate-500 text-center">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-teal-700 font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}