import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserCheck, UserX, Loader2, Smartphone, Eraser, Save, Drill, Ban } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const SearchPage = () => {
  const { user } = useAuth();
  const [oeaNumber, setOeaNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oeaNumber.trim()) return;
    setSearching(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/engineer?oea_number=${oeaNumber}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid credentials");
      }

      const data = await response.json();

      setMobile(data.mobile || "");
      const status = data.checked_in_at ? "Checked In" : "Not Checked In";

      setResult({
        id: data._id,
        name: data.full_name || "N/A",
        mobile: data.mobile || "-",
        oea_number: data.oea_number,
        registered_at: data.registered_at ? new Date(data.registered_at).toLocaleDateString() : "N/A",
        settlement_year: data.settlement_year,
        birthday: data.birthday ? new Date(data.birthday).toLocaleDateString() : "N/A",
        university: data.university || "N/A",
        degree: data.degree || "N/A",
        graduation_year: data.graduation_year || "N/A",
        branch: data.branch || "N/A",
        status,
      });

    } catch (err: any) {
      throw err;
    } finally {
      setSearching(false);
    }

  };

  const handleUpdateMobileNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !result) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/engineer/${result.id}/mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update mobile number");
      }

      setResult((prev: any) => ({ ...prev, mobile }));

    } catch (err: any) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteMobileNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/engineer/${result.id}/mobile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to delete mobile number");
      }

      setResult((prev: any) => ({ ...prev, mobile: "-" }));
      setMobile("");

    } catch (err: any) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/engineer/${result.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to check in engineer");
      }

      setResult((prev: any) => ({ ...prev, status: "Checked In" }));

    } catch (err: any) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/engineer/${result.id}/checkin`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to remove check in");
      }

      setResult((prev: any) => ({ ...prev, status: "Not Checked In" }));

    } catch (err: any) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Engineer Search</h1>
        <p className="text-sm text-muted-foreground">Search for engineers by their OEA number</p>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Enter OEA Number..."
              value={oeaNumber}
              onChange={(e) => setOeaNumber(e.target.value)}
              maxLength={50}
              className="h-12 flex-1 text-base"
            />
            <Button type="submit" disabled={searching || !oeaNumber.trim()} className="h-12 sm:w-auto">
              {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Drill className="h-5 w-5 text-accent" />
              Engineer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-muted-foreground">ID</dt>
                <dd className="mt-1 text-foreground">{result.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-foreground">{result.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">OEA Number</dt>
                <dd className="mt-1 text-foreground">{result.oea_number}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <span className={result.status === "Checked In" ? "inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success" : "inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"}>
                    {result.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Registered At</dt>
                <dd className="mt-1 text-foreground">{result.registered_at}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Settlement Year</dt>
                <dd className="mt-1 text-foreground">{result.settlement_year}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Birthday</dt>
                <dd className="mt-1 text-foreground">{result.birthday}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">University</dt>
                <dd className="mt-1 text-foreground">{result.university}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Degree</dt>
                <dd className="mt-1 text-foreground">{result.degree}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Graduation Year</dt>
                <dd className="mt-1 text-foreground">{result.graduation_year}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Branch</dt>
                <dd className="mt-1 text-foreground">{result.branch}</dd>
              </div>
            </dl>

            {user?.roles.includes("registrator") && (
              <div>
                {result.status === "Not Checked In" ? (
                <div className="mt-6 border-t pt-4">
                  <Button onClick={handleCheckIn} disabled={updating} className="h-12 w-full gap-2 sm:w-auto">
                    <UserCheck className="h-4 w-4" />
                    Check In Engineer
                  </Button>
                </div>
                ) : (
                <div className="mt-3">
                  <Button onClick={handleCheckOut} disabled={updating} className="h-12 w-full gap-2 sm:w-auto">
                    <UserX className="h-4 w-4" />
                    Remove Check In
                  </Button>
                </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-accent" />
              Mobile Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                { result.mobile !== "-" ? (
                  <dd className="mt-1 text-foreground">{result.mobile}</dd>
                ) : (
                  <Ban className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </dl>
            <br/>
            <form className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Enter Mobile Number..."
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={50}
                className="h-12 flex-1 text-base"
              />
              <Button onClick={handleUpdateMobileNumber} type="submit" disabled={updating || !mobile.trim() || (mobile.trim() == result.mobile)} className="h-12 sm:w-auto">
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Mobile Number
              </Button>
              <Button onClick={handleDeleteMobileNumber} type="submit" disabled={updating || result.mobile === "-"} className="h-12 sm:w-auto">
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
                Remove Mobile Number
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;
