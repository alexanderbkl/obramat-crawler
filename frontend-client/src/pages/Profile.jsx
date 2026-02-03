import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserIcon, KeyIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await updateProfile(profileData);

    setIsLoading(false);
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password changed. Please login again.');
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }

    setIsLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'password', label: 'Password', icon: KeyIcon },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        My Account
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center gap-4 p-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                {user?.firstName?.[0]}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-neutral-500">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                  Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="md:col-span-2"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-6"
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                  Change Password
                </h2>

                <div className="space-y-6 max-w-md">
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={errors.newPassword}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={errors.confirmPassword}
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-6"
                  isLoading={isLoading}
                >
                  Change Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
