import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

type UserDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    isEditing: boolean;
};

export const UserDialog = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEditing
}: UserDialogProps) => {
    // Individual state for each field to prevent synchronization issues
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Reset when closing
            setEmail("");
            setFullName("");
            setPassword("");
            setRole("user");
            setError(null);
            return;
        }

        // Initialize form data when opening
        if (initialData && isEditing) {
            console.log("[UserDialog] Initializing edit mode with:", initialData);
            setEmail(initialData.email || "");
            setFullName(initialData.full_name || "");
            setPassword(""); // Always empty for edit
            setRole(initialData.role || "user");
        } else {
            console.log("[UserDialog] Initializing create mode");
            setEmail("");
            setFullName("");
            setPassword("");
            setRole("user");
        }
        setError(null);
    }, [isOpen, initialData, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            console.log("[UserDialog] Submit - email:", email);
            console.log("[UserDialog] Submit - password:", password);
            console.log("[UserDialog] Submit - role:", role);
            console.log("[UserDialog] Submit - isEditing:", isEditing);
            
            const payload: any = {
                email,
                full_name: fullName,
                role
            };
            
            // Only include password if:
            // 1. Creating a new user (always required)
            // 2. Editing and password field is not empty
            if (!isEditing) {
                // Creating new user - password is required
                payload.password = password;
                console.log("[UserDialog] Create mode - adding password");
            } else if (password && password.length > 0) {
                // Editing existing user - only include password if provided
                payload.password = password;
                console.log("[UserDialog] Edit mode - password provided, adding to payload");
            } else {
                console.log("[UserDialog] Edit mode - no password provided, skipping password");
            }
            
            console.log("[UserDialog] Final payload:", payload);
            await onSubmit(payload);
            onClose();
        } catch (err: any) {
            console.error("[UserDialog] Error:", err);
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 focus:border-brand focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 focus:border-brand focus:outline-none"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">
                            {isEditing ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                        </label>
                        <input
                            type="password"
                            required={!isEditing}
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 focus:border-brand focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-400">
                            Rôle
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 focus:border-brand focus:outline-none"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
