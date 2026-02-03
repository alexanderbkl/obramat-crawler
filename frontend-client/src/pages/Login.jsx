import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

// Simple form hook replacement
const useSimpleForm = () => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const register = (name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => setValues((prev) => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return { register, handleSubmit, errors, setErrors };
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Demo Accounts:
          </p>
          <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <p>Admin: admin@example.com / admin123</p>
            <p>Customer: customer@example.com / customer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
