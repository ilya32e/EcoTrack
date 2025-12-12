import { useState } from "react";
import { Edit2, Plus, Shield, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { UserDialog } from "../components/users/UserDialog";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../hooks/useApi";

export const UsersPage = () => {
  const { data, isLoading, error } = useUsers();
  const queryClient = useQueryClient();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleCreate = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      await deleteUser.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  };

  const handleSubmit = async (formData: any) => {
    if (editingUser) {
      await updateUser.mutateAsync({ id: editingUser.id, payload: formData });
    } else {
      await createUser.mutateAsync(formData);
    }
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-slate-400">
            Gestion des accès et des rôles (admin only)
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={18} className="mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card title="Liste des utilisateurs">
        {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
            <p><strong>Erreur:</strong> {error instanceof Error ? error.message : "Impossible de charger les utilisateurs"}</p>
            <p className="text-xs mt-1">Vérifiez que le serveur API est en cours d'exécution et que vous êtes connecté en tant qu'administrateur.</p>
          </div>
        )}
        {!isLoading && !error && (!data || data.length === 0) && (
          <p className="text-sm text-slate-400">Aucun utilisateur trouvé.</p>
        )}
        <div className="space-y-3">
          {data?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-xs text-slate-500">
                  {user.full_name ?? "Nom non renseigné"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Shield size={16} />
                  {user.role}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingUser}
        isEditing={!!editingUser}
      />
    </div>
  );
};

