import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationModal } from '../../components/admin/ConfirmationModal';
import { adminManagementService } from '../../services/adminManagementService';
import { useAuth } from '../../context/AuthContext';
import type { AdminProfile, AdminRole, AdminAuditLog } from '../../types';
import {
  ShieldCheck,
  Shield,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Clock,
  KeyRound,
  Trash2,
  Edit2,
  AlertTriangle,
  History,
  X,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Lock,
  Mail,
  User,
  Filter,
} from 'lucide-react';

interface CreateAdminFormData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

interface EditAdminFormData {
  name: string;
  role: AdminRole;
}

export const AdminManagementPage: React.FC = () => {
  const { user: currentAuthUser, isSuperAdmin } = useAuth();

  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createFormData, setCreateFormData] = useState<CreateAdminFormData>({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [editFormData, setEditFormData] = useState<EditAdminFormData>({
    name: '',
    role: 'admin',
  });
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Confirmation Modals state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'toggle_status' | 'delete' | 'reset_password';
    admin: AdminProfile | null;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary';
  }>({
    isOpen: false,
    type: 'toggle_status',
    admin: null,
    title: '',
    description: '',
    confirmText: 'Confirm',
    variant: 'primary',
  });
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Audit Logs Drawer state
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  const actorContext = useMemo(() => {
    return {
      uid: currentAuthUser?.uid || 'system',
      email: currentAuthUser?.email || 'admin@deccancarehospital.com',
    };
  }, [currentAuthUser]);

  const loadAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await adminManagementService.getAllAdmins();
      setAdmins(data);
    } catch (err) {
      console.warn('Error loading administrators:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await adminManagementService.getAuditLogs(40);
      setAuditLogs(logs);
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Filtered admin records
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const matchesSearch =
        admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && admin.active !== false) ||
        (statusFilter === 'inactive' && admin.active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchQuery, roleFilter, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = admins.length;
    const superadmins = admins.filter((a) => a.role === 'superadmin').length;
    const standardAdmins = admins.filter((a) => a.role === 'admin').length;
    const activeCount = admins.filter((a) => a.active !== false).length;
    const inactiveCount = total - activeCount;

    return { total, superadmins, standardAdmins, activeCount, inactiveCount };
  }, [admins]);

  // Create Handler
  const handleOpenCreateModal = () => {
    setCreateFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });
    setCreateError(null);
    setShowPassword(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      await adminManagementService.createAdmin(createFormData, actorContext);
      setIsCreateModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Administrator "${createFormData.name}" (${createFormData.email}) created successfully.`,
      });
      await loadAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create administrator.';
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit Handler
  const handleOpenEditModal = (admin: AdminProfile) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name,
      role: admin.role,
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setEditLoading(true);
    setEditError(null);

    try {
      await adminManagementService.updateAdmin(
        editingAdmin.uid,
        {
          name: editFormData.name,
          role: editFormData.role,
        },
        actorContext
      );
      setIsEditModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Administrator profile for "${editingAdmin.email}" updated successfully.`,
      });
      await loadAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update administrator profile.';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  // Action Confirmations
  const handleInitiateToggleStatus = (admin: AdminProfile) => {
    const isCurrentlyActive = admin.active !== false;
    if (admin.uid === currentAuthUser?.uid) {
      setFeedback({
        type: 'error',
        message: 'Self-protection: You cannot deactivate your own active account.',
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'toggle_status',
      admin,
      title: isCurrentlyActive ? 'Deactivate Administrator' : 'Activate Administrator',
      description: isCurrentlyActive
        ? `Are you sure you want to deactivate ${admin.name} (${admin.email})? They will immediately lose access to the hospital admin panel.`
        : `Are you sure you want to reactivate ${admin.name} (${admin.email})? They will regain access according to their ${admin.role === 'superadmin' ? 'Super Admin' : 'Admin'} role.`,
      confirmText: isCurrentlyActive ? 'Deactivate Account' : 'Activate Account',
      variant: isCurrentlyActive ? 'warning' : 'primary',
    });
  };

  const handleInitiateDelete = (admin: AdminProfile) => {
    if (admin.uid === currentAuthUser?.uid) {
      setFeedback({
        type: 'error',
        message: 'Self-protection: You cannot delete your own administrator account.',
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'delete',
      admin,
      title: 'Delete Administrator Account',
      description: `Are you sure you want to permanently remove ${admin.name} (${admin.email})? This action will revoke all permissions and delete their administrative profile from the system.`,
      confirmText: 'Delete Administrator',
      variant: 'danger',
    });
  };

  const handleInitiatePasswordReset = (admin: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      type: 'reset_password',
      admin,
      title: 'Send Password Reset Email',
      description: `Send a secure Firebase password reset link to ${admin.email}? The administrator will receive instructions to set a new password.`,
      confirmText: 'Send Reset Link',
      variant: 'primary',
    });
  };

  const handleExecuteConfirmedAction = async () => {
    if (!confirmModal.admin) return;
    setActionLoading(true);

    try {
      if (confirmModal.type === 'toggle_status') {
        const newStatus = !(confirmModal.admin.active !== false);
        await adminManagementService.toggleAdminStatus(
          confirmModal.admin.uid,
          newStatus,
          actorContext
        );
        setFeedback({
          type: 'success',
          message: `Account status for ${confirmModal.admin.email} updated to ${newStatus ? 'Active' : 'Deactivated'}.`,
        });
      } else if (confirmModal.type === 'delete') {
        await adminManagementService.deleteAdmin(confirmModal.admin.uid, actorContext);
        setFeedback({
          type: 'success',
          message: `Administrator ${confirmModal.admin.email} was permanently deleted.`,
        });
      } else if (confirmModal.type === 'reset_password') {
        await adminManagementService.sendPasswordReset(confirmModal.admin.email, actorContext);
        setFeedback({
          type: 'success',
          message: `Password reset instructions sent to ${confirmModal.admin.email}.`,
        });
      }

      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      await loadAdmins();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed to execute.';
      setFeedback({ type: 'error', message: msg });
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAuditDrawer = () => {
    setIsAuditDrawerOpen(true);
    loadAuditLogs();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E2EEF1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EBF6FA] text-[#0879A5]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
              Admin Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#617786] mt-1">
            Create, manage, and monitor authorized administrator accounts with role-based access control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleOpenAuditDrawer}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[#D6EAF1] text-[#103A50] hover:bg-[#F2F8FB]"
          >
            <History className="w-4 h-4 text-[#0879A5]" />
            <span>Audit Trail</span>
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={handleOpenCreateModal}
              variant="primary"
              size="sm"
              className="flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Administrator</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-[#F0FBF7] border-[#A2E2C8] text-[#0C6243]'
              : 'bg-[#FFF8F8] border-[#FADCDA] text-[#D93636]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-[#108E66] shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[#D93636] shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[#617786] hover:text-[#103A50] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Statistical Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#617786] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Admins</span>
            <span className="p-2 rounded-xl bg-[#F2F8FB] text-[#0879A5]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#103A50]">
            {metrics.total}
          </div>
          <span className="text-[11px] text-[#617786] mt-1 block">Registered profiles</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#617786] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Super Admins</span>
            <span className="p-2 rounded-xl bg-[#F5F0FF] text-[#7C3AED]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#7C3AED]">
            {metrics.superadmins}
          </div>
          <span className="text-[11px] text-[#617786] mt-1 block">Full administrative control</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#617786] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Standard Admins</span>
            <span className="p-2 rounded-xl bg-[#EBF6FA] text-[#0879A5]">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#0879A5]">
            {metrics.standardAdmins}
          </div>
          <span className="text-[11px] text-[#617786] mt-1 block">CMS operations</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#617786] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Status</span>
            <span className="p-2 rounded-xl bg-[#F0FBF7] text-[#108E66]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#108E66]">
            {metrics.activeCount}
            <span className="text-xs font-sans font-normal text-[#617786] ml-2">
              ({metrics.inactiveCount} inactive)
            </span>
          </div>
          <span className="text-[11px] text-[#617786] mt-1 block">Enabled authentication</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search administrators by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#FAFDFF] text-[#103A50] placeholder-[#8BA0AD] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30 focus:border-[#0879A5]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#617786]">
              <Filter className="w-3.5 h-3.5 text-[#0879A5]" />
              <span className="font-medium">Filter:</span>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-white text-[#103A50] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Standard Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-[#D6EAF1] bg-white text-[#103A50] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Administrators Content */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2EEF1]">
          <div className="w-8 h-8 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-[#0879A5] uppercase tracking-wider">
            Loading Hospital Administrators...
          </span>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2EEF1] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F2F8FB] text-[#0879A5] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#103A50]">
            No Administrators Found
          </h3>
          <p className="text-xs text-[#617786] max-w-md mx-auto">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'No administrator accounts match your active search filters.'
              : 'No administrator accounts registered yet.'}
          </p>
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-[#E2EEF1] rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FCFD] border-b border-[#E2EEF1] text-[11px] font-semibold text-[#617786] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF4F7] text-xs text-[#103A50]">
                {filteredAdmins.map((admin) => {
                  const isCurrent = admin.uid === currentAuthUser?.uid;
                  const isActive = admin.active !== false;
                  const isSuper = admin.role === 'superadmin';

                  return (
                    <tr key={admin.uid} className="hover:bg-[#F9FDFF] transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                              isSuper
                                ? 'bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE]'
                                : 'bg-[#EBF6FA] text-[#0879A5] border border-[#CDE7F3]'
                            }`}
                          >
                            {admin.name.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-semibold text-[#103A50] flex items-center gap-1.5">
                              {admin.name}
                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF6FA] text-[#0879A5] font-mono font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#8BA0AD] font-mono">
                              UID: {admin.uid.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#305266] font-mono">
                          <Mail className="w-3.5 h-3.5 text-[#8BA0AD]" />
                          <span>{admin.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE] text-[11px] font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EBF6FA] text-[#0879A5] border border-[#CDE7F3] text-[11px] font-semibold">
                            <Shield className="w-3.5 h-3.5" />
                            Standard Admin
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F0FBF7] text-[#108E66] border border-[#A2E2C8] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#108E66]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF8F8] text-[#D93636] border border-[#FADCDA] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D93636]" />
                            Deactivated
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-[#617786] text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#8BA0AD]" />
                          <span>
                            {admin.createdAt
                              ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'System Initial'}
                          </span>
                        </div>
                        {admin.createdBy && (
                          <span className="text-[10px] text-[#8BA0AD] block mt-0.5">
                            By {admin.createdBy}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            title="Edit Administrator Details"
                            className="p-1.5 rounded-lg text-[#0879A5] hover:bg-[#EBF6FA] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => handleInitiatePasswordReset(admin)}
                            title="Send Password Reset Email"
                            className="p-1.5 rounded-lg text-[#617786] hover:bg-[#F2F8FB] hover:text-[#103A50] transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleInitiateToggleStatus(admin)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Cannot deactivate your own account'
                                : isActive
                                ? 'Deactivate Administrator'
                                : 'Activate Administrator'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-[#C5D5DE] cursor-not-allowed'
                                : isActive
                                ? 'text-[#E07A5F] hover:bg-[#FDF2F0]'
                                : 'text-[#108E66] hover:bg-[#F0FBF7]'
                            }`}
                          >
                            {isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleInitiateDelete(admin)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? 'Cannot delete your own account'
                                : 'Delete Administrator Record'
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-[#C5D5DE] cursor-not-allowed'
                                : 'text-[#D93636] hover:bg-[#FFF8F8]'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="lg:hidden space-y-3">
            {filteredAdmins.map((admin) => {
              const isCurrent = admin.uid === currentAuthUser?.uid;
              const isActive = admin.active !== false;
              const isSuper = admin.role === 'superadmin';

              return (
                <Card
                  key={admin.uid}
                  className="p-4 bg-white border border-[#E2EEF1] rounded-2xl shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase ${
                          isSuper
                            ? 'bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE]'
                            : 'bg-[#EBF6FA] text-[#0879A5] border border-[#CDE7F3]'
                        }`}
                      >
                        {admin.name.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[#103A50] flex items-center gap-1.5">
                          {admin.name}
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF6FA] text-[#0879A5] font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#617786] font-mono mt-0.5">
                          <Mail className="w-3 h-3 text-[#8BA0AD]" />
                          <span>{admin.email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FBF7] text-[#108E66] border border-[#A2E2C8] text-[10px] font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF8F8] text-[#D93636] border border-[#FADCDA] text-[10px] font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2F8FB]">
                    <div className="flex items-center gap-1.5">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F5F0FF] text-[#7C3AED] text-[10px] font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EBF6FA] text-[#0879A5] text-[10px] font-semibold">
                          <Shield className="w-3 h-3" />
                          Standard Admin
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-[#8BA0AD]">
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'System'}
                    </span>
                  </div>

                  {/* Actions for mobile */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F2F8FB]">
                    <button
                      onClick={() => handleOpenEditModal(admin)}
                      className="py-1.5 px-2 rounded-xl bg-[#F2F8FB] text-[#0879A5] text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#E2EEF1]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleInitiatePasswordReset(admin)}
                      className="py-1.5 px-2 rounded-xl bg-[#F2F8FB] text-[#305266] text-xs font-medium flex items-center justify-center gap-1 hover:bg-[#E2EEF1]"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={() => handleInitiateToggleStatus(admin)}
                      disabled={isCurrent}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isActive
                          ? 'bg-[#FDF2F0] text-[#E07A5F] hover:bg-[#FADCDA]'
                          : 'bg-[#F0FBF7] text-[#108E66] hover:bg-[#A2E2C8]'
                      }`}
                    >
                      {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>{isActive ? 'Deact' : 'Act'}</span>
                    </button>

                    <button
                      onClick={() => handleInitiateDelete(admin)}
                      disabled={isCurrent}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-[#FFF8F8] text-[#D93636] hover:bg-[#FADCDA]'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* CREATE ADMINISTRATOR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#EBF6FA] to-white border-b border-[#E2EEF1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white text-[#0879A5] shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#103A50]">
                    Add New Administrator
                  </h3>
                  <p className="text-xs text-[#617786]">
                    Provision an administrative account with Firebase Authentication.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8BA0AD] hover:text-[#103A50] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FADCDA] text-[#D93636] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-1.5">
                  Full Name <span className="text-[#D93636]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Meraj Ahmed / Hospital Manager"
                    value={createFormData.name}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#FAFDFF] text-[#103A50] placeholder-[#8BA0AD] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30 focus:border-[#0879A5]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-1.5">
                  Hospital Email Address <span className="text-[#D93636]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@deccancarehospital.com"
                    value={createFormData.email}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#FAFDFF] text-[#103A50] placeholder-[#8BA0AD] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30 focus:border-[#0879A5]"
                  />
                </div>
                <span className="text-[11px] text-[#8BA0AD] mt-1 block">
                  Used as the login credential in Firebase Authentication.
                </span>
              </div>

              {/* Temporary Password */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-1.5">
                  Temporary Password <span className="text-[#D93636]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={createFormData.password}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#FAFDFF] text-[#103A50] placeholder-[#8BA0AD] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30 focus:border-[#0879A5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA0AD] hover:text-[#103A50] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-[#8BA0AD] mt-1 block">
                  Secure initial password. The administrator can reset it upon logging in.
                </span>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-2">
                  Assign Privilege Role <span className="text-[#D93636]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      createFormData.role === 'admin'
                        ? 'bg-[#EBF6FA] border-[#0879A5] ring-2 ring-[#0879A5]/20'
                        : 'bg-white border-[#D6EAF1] hover:bg-[#F8FCFD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#0879A5]" />
                        <span className="text-xs font-bold text-[#103A50]">Standard Admin</span>
                      </div>
                      <input
                        type="radio"
                        name="adminRole"
                        value="admin"
                        checked={createFormData.role === 'admin'}
                        onChange={() => setCreateFormData({ ...createFormData, role: 'admin' })}
                        className="text-[#0879A5] focus:ring-[#0879A5]"
                      />
                    </div>
                    <p className="text-[11px] text-[#617786] leading-relaxed">
                      Can manage doctors, services, gallery, slots, and patient appointments.
                    </p>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      createFormData.role === 'superadmin'
                        ? 'bg-[#F5F0FF] border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
                        : 'bg-white border-[#D6EAF1] hover:bg-[#F8FCFD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-xs font-bold text-[#7C3AED]">Super Admin</span>
                      </div>
                      <input
                        type="radio"
                        name="adminRole"
                        value="superadmin"
                        checked={createFormData.role === 'superadmin'}
                        onChange={() => setCreateFormData({ ...createFormData, role: 'superadmin' })}
                        className="text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                    </div>
                    <p className="text-[11px] text-[#617786] leading-relaxed">
                      Full access including user provisioning, role assignments, and audit trails.
                    </p>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2EEF1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createLoading}
                  className="flex items-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Administrator</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMINISTRATOR MODAL */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#D6EAF1] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#EBF6FA] to-white border-b border-[#E2EEF1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white text-[#0879A5] shadow-xs">
                  <Edit2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#103A50]">
                    Edit Administrator Profile
                  </h3>
                  <p className="text-xs text-[#617786]">
                    Update details and privileges for {editingAdmin.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8BA0AD] hover:text-[#103A50] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FADCDA] text-[#D93636] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-1.5">
                  Email Address (Primary Credential)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={editingAdmin.email}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#F4F8FA] text-[#617786] font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-1.5">
                  Full Name <span className="text-[#D93636]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8BA0AD] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D6EAF1] bg-[#FAFDFF] text-[#103A50] focus:outline-none focus:ring-2 focus:ring-[#0879A5]/30 focus:border-[#0879A5]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#103A50] mb-2">
                  Role Assignment <span className="text-[#D93636]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      editFormData.role === 'admin'
                        ? 'bg-[#EBF6FA] border-[#0879A5] ring-2 ring-[#0879A5]/20'
                        : 'bg-white border-[#D6EAF1] hover:bg-[#F8FCFD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#0879A5]" />
                        <span className="text-xs font-bold text-[#103A50]">Standard Admin</span>
                      </div>
                      <input
                        type="radio"
                        name="editRole"
                        value="admin"
                        checked={editFormData.role === 'admin'}
                        onChange={() => setEditFormData({ ...editFormData, role: 'admin' })}
                        className="text-[#0879A5] focus:ring-[#0879A5]"
                      />
                    </div>
                    <p className="text-[11px] text-[#617786]">
                      Standard operational access.
                    </p>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      editFormData.role === 'superadmin'
                        ? 'bg-[#F5F0FF] border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
                        : 'bg-white border-[#D6EAF1] hover:bg-[#F8FCFD]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                        <span className="text-xs font-bold text-[#7C3AED]">Super Admin</span>
                      </div>
                      <input
                        type="radio"
                        name="editRole"
                        value="superadmin"
                        checked={editFormData.role === 'superadmin'}
                        onChange={() => setEditFormData({ ...editFormData, role: 'superadmin' })}
                        className="text-[#7C3AED] focus:ring-[#7C3AED]"
                      />
                    </div>
                    <p className="text-[11px] text-[#617786]">
                      Full management & user provisioning.
                    </p>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2EEF1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={editLoading}
                  className="flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleExecuteConfirmedAction}
        title={confirmModal.title}
        message={confirmModal.description}
        confirmLabel={confirmModal.confirmText}
        isDestructive={confirmModal.variant === 'danger' || confirmModal.variant === 'warning'}
        isLoading={actionLoading}
      />

      {/* AUDIT LOG DRAWER */}
      {isAuditDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-[#D6EAF1] flex flex-col animate-slideLeft">
              {/* Drawer Header */}
              <div className="p-6 bg-gradient-to-r from-[#EBF6FA] to-white border-b border-[#E2EEF1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white text-[#0879A5] shadow-xs">
                    <History className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#103A50]">
                      Administrative Audit Trail
                    </h3>
                    <p className="text-xs text-[#617786]">
                      Immutable security log of administrative actions and access events.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuditDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#8BA0AD] hover:text-[#103A50] hover:bg-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {auditLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#0879A5] border-t-transparent animate-spin mx-auto mb-3" />
                    <span className="text-xs font-mono text-[#0879A5] uppercase tracking-wider">
                      Fetching Audit Records...
                    </span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="p-12 text-center bg-[#F8FCFD] rounded-2xl border border-[#E2EEF1]">
                    <ShieldCheck className="w-8 h-8 text-[#0879A5] mx-auto mb-2 opacity-50" />
                    <h4 className="font-semibold text-sm text-[#103A50]">No Audit Records</h4>
                    <p className="text-xs text-[#617786] mt-1">
                      Administrative activities such as creations, status changes, and updates will be logged here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => {
                      const dateObj = new Date(log.timestamp);
                      const formattedDate = dateObj.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      const getActionBadge = (action: string) => {
                        switch (action) {
                          case 'ADMIN_CREATED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#F0FBF7] text-[#108E66] border border-[#A2E2C8] text-[10px] font-semibold">
                                Account Created
                              </span>
                            );
                          case 'ADMIN_ACTIVATED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#F0FBF7] text-[#108E66] border border-[#A2E2C8] text-[10px] font-semibold">
                                Activated
                              </span>
                            );
                          case 'ADMIN_DEACTIVATED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#FFF8F8] text-[#D93636] border border-[#FADCDA] text-[10px] font-semibold">
                                Deactivated
                              </span>
                            );
                          case 'ADMIN_DELETED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#FFF8F8] text-[#D93636] border border-[#FADCDA] text-[10px] font-semibold">
                                Account Deleted
                              </span>
                            );
                          case 'ROLE_CHANGED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#F5F0FF] text-[#7C3AED] border border-[#DDD6FE] text-[10px] font-semibold">
                                Role Modified
                              </span>
                            );
                          case 'PASSWORD_RESET_REQUESTED':
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-[#EBF6FA] text-[#0879A5] border border-[#CDE7F3] text-[10px] font-semibold">
                                Password Reset Sent
                              </span>
                            );
                          default:
                            return (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {action}
                              </span>
                            );
                        }
                      };

                      return (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-2xl bg-white border border-[#E2EEF1] hover:border-[#CDE7F3] transition-colors shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {getActionBadge(log.action)}
                            <span className="text-[11px] text-[#8BA0AD] font-mono">
                              {formattedDate} • {formattedTime}
                            </span>
                          </div>

                          <div className="text-xs text-[#103A50] space-y-1">
                            <div>
                              <span className="text-[#8BA0AD]">Target: </span>
                              <span className="font-semibold text-[#103A50]">
                                {log.targetAdminEmail}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#8BA0AD]">Performed By: </span>
                              <span className="text-[#305266] font-mono text-[11px]">
                                {log.performedByEmail}
                              </span>
                            </div>
                          </div>

                          {log.details && (
                            <div className="p-2 rounded-xl bg-[#F8FCFD] border border-[#EBF4F7] text-[11px] text-[#617786] font-mono">
                              {Object.entries(log.details).map(([k, v]) => (
                                <div key={k}>
                                  <span className="text-[#8BA0AD]">{k}:</span> {String(v)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-[#F8FCFD] border-t border-[#E2EEF1] flex items-center justify-between text-xs text-[#617786]">
                <span className="font-mono">Immutable Firestore Trail</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAuditLogs()}
                  className="text-xs py-1"
                >
                  Refresh Logs
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
