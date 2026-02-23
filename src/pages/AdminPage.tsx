import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface Admins {
  _id: string;
  username: string;
  full_name: string;
  roles: string[];
  password: string;
}

const AdminPage = () => {
  const { user } = useAuth();

  const [admins, setAdmins] = useState<Admins[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<Admins | null>(null);

  useEffect(() => {
    const listAdmins = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/list`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        });
        const data = await response.json();
        
        setAdmins(data);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };
    listAdmins();
  }, []);

  const openEditOverlay = (admin: Admins) => {
    setEditingAdmin(admin);
  };

  const handleCreate = async (newAdmin: Admins) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        body: JSON.stringify(newAdmin),
      });
      const createdAdmin = await response.json();
      setAdmins([...admins, createdAdmin]);
      setEditingAdmin(null);
    } catch (error) {
      console.error("Failed to create admin:", error);
    }
  };

  const handleSave = async (updatedAdmin: Admins) => {
    try {
      await fetch(`${API_BASE_URL}/admin/${updatedAdmin._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        body: JSON.stringify(updatedAdmin),
      });
      setAdmins(admins.map(a => a._id === updatedAdmin._id ? updatedAdmin : a));
      setEditingAdmin(null);
    } catch (error) {
      console.error("Failed to update admin:", error);
    }
  };

  const handleDelete = async (adminId: string) => {
    try {
      await fetch(`${API_BASE_URL}/admin/${adminId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${user?.token}` },
      });
      setAdmins(admins.filter(a => a._id !== adminId));
      setEditingAdmin(null);
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Page</h1>
        <p className="text-sm text-muted-foreground">Manage agents and access</p>
      </div>
      <div className="mb-6">
        <button
          onClick={() => setEditingAdmin({ _id: "", username: "", full_name: "", roles: [], password: "" })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90"
        >
          Create Admin
        </button>
      </div>
      <div className="mb-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-border bg-muted">
              {/* <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">ID</th> */}
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Full Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Username</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Roles</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-b border-border hover:bg-muted/50">
                {/* <td className="px-4 py-2 text-sm text-foreground">{admin._id}</td> */}
                <td className="px-4 py-2 text-sm text-foreground">{admin.full_name}</td>
                <td className="px-4 py-2 text-sm text-foreground">{admin.username}</td>
                <td className="px-4 py-2 text-sm text-foreground">
                  <div className="flex gap-2 flex-wrap">
                    {admin.roles.map((role) => (
                      <span key={role} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-foreground">
                    <button onClick={() => openEditOverlay(admin)} disabled={admin._id === user?.id} className="text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-foreground mb-4">Edit Admin</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
          type="text"
          value={editingAdmin.full_name}
          onChange={(e) => setEditingAdmin({ ...editingAdmin, full_name: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <input
          type="text"
          value={editingAdmin.username}
          onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
          type="password"
          placeholder="Enter new password"
          onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
            <div>
            <label className="block text-sm font-medium text-foreground mb-1">Roles</label>
            <div className="space-y-2">
              {["admin", "registrator", "voting_agent", "reporter"].map((role) => (
              <div key={role} className="flex items-center">
                <input
                type="checkbox"
                id={role}
                checked={editingAdmin.roles.includes(role)}
                onChange={(e) => {
                  const newRoles = e.target.checked
                  ? [...editingAdmin.roles, role]
                  : editingAdmin.roles.filter(r => r !== role);
                  setEditingAdmin({ ...editingAdmin, roles: newRoles });
                }}
                className="w-4 h-4 rounded border-border bg-muted text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor={role} className="ml-2 text-sm text-foreground cursor-pointer">{role}</label>
              </div>
              ))}
            </div>
            </div>
        </div>
        <div className="flex gap-3 mt-6">
          {editingAdmin._id ? (
            <>
              <button onClick={() => handleSave(editingAdmin)} className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">Update</button>
              <button onClick={() => handleDelete(editingAdmin._id)} className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">Delete</button>
            </>
          ) : (
            <button onClick={() => handleCreate(editingAdmin)} className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">Create</button>
          )}
          <button onClick={() => setEditingAdmin(null)} className="flex-1 bg-muted text-foreground px-4 py-2 rounded-md font-medium hover:opacity-90">Cancel</button>
        </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
