import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, Lock } from 'lucide-react';
import { useAuthStore } from '../context/store';
import { authAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', gender: user?.gender || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {}
    finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.updatePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password updated!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {}
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await uploadAPI.uploadAvatar(fd);
      updateUser({ avatar: data.avatar });
      toast.success('Profile photo updated!');
    } catch {}
  };

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'password', label: 'Password' }, { id: 'addresses', label: 'Addresses' }];

  return (
    <>
      <Helmet><title>My Profile | SareeSaanvi</title></Helmet>
      <div className="page-container py-10 max-w-2xl">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal mb-8">My Account</h1>

        {/* Avatar */}
        <div className="flex items-center gap-5 bg-white rounded-2xl p-5 shadow-card mb-6">
          <div className="relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-saree-rose/20" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-saree-rose to-saree-crimson flex items-center justify-center text-white text-2xl font-bold border-4 border-saree-rose/20">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-saree-rose rounded-full flex items-center justify-center cursor-pointer hover:bg-saree-crimson transition-colors shadow-md">
              <Camera size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-saree-charcoal">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-saree-blush text-saree-rose'}`}>
                {user?.role === 'admin' ? '👑 Admin' : '🌸 Member'}
              </span>
              {user?.loyaltyPoints > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  💎 {user.loyaltyPoints} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white shadow-sm text-saree-rose' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-card space-y-4">
            {[['Full Name', 'name', 'text', User], ['Phone', 'phone', 'tel', Phone]].map(([label, field, type, Icon]) => (
              <div key={field}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="input-field pl-11" />
                </div>
              </div>
            ))}
            <div>
              <label className="input-label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={user?.email} disabled className="input-field pl-11 bg-gray-50 cursor-not-allowed text-gray-400" />
              </div>
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button onClick={handleProfileSave} disabled={saving} className="btn-primary gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
          </motion.div>
        )}

        {tab === 'password' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-card space-y-4">
            {[['Current Password', 'currentPassword'], ['New Password', 'newPassword'], ['Confirm New Password', 'confirmPassword']].map(([label, field]) => (
              <div key={field}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={pwdForm[field]} onChange={(e) => setPwdForm({ ...pwdForm, [field]: e.target.value })} className="input-field pl-11" placeholder="••••••••" />
                </div>
              </div>
            ))}
            <button onClick={handlePasswordSave} disabled={saving} className="btn-primary gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              Update Password
            </button>
          </motion.div>
        )}

        {tab === 'addresses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {user?.addresses?.length === 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-card text-center">
                <p className="text-gray-400">No saved addresses yet</p>
              </div>
            )}
            {user?.addresses?.map((addr) => (
              <div key={addr._id} className="bg-white rounded-2xl p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-saree-charcoal text-sm">{addr.fullName}</p>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{addr.label}</span>
                      {addr.isDefault && <span className="text-xs bg-saree-blush text-saree-rose px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                    <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.state} – {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📞 {addr.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
