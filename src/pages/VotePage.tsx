import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Search, Eraser, Loader2, Drill, UserX } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const VotePage = () => {
  const { user } = useAuth();
  const [oeaNumber, setOeaNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [voteResult, setVoteResult] = useState<any>(null);
  const [marking, setMarking] = useState(false);

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
      });

      const votingResponse = await fetch(`${API_BASE_URL}/vote/${data._id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!votingResponse.ok) {
        const errData = await votingResponse.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid credentials");
      }
      
      const voteData = await votingResponse.json();
      console.log('voteData', voteData);

      const status = voteData?.voted_at ? "Voted" : "Not Voted";

      setVoteResult({
        id: voteData ? voteData._id : null,
        voted_at: voteData?.voted_at || null,
        status,
      });

    } catch (err: any) {
      throw err;
    } finally {
      setSearching(false);
    }

  };

  const handleMarkAsVoted = async () => {
    if (!voteResult) return;
    setMarking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vote/${result.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to mark as voted");
      }

      setVoteResult({
        voted_at: new Date().toISOString(),
        status: "Voted",
      });
    } catch (err: any) {
      throw err;
    } finally {
      setMarking(false);
    }
  };

  const handleDeleteVote = async () => {
    if (!voteResult) return;
    setMarking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vote/${result.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to remove vote");
      }
    } catch (err: any) {
      throw err;
    } finally {
      setVoteResult({
        voted_at: null,
        status: "Not Voted",
      });
      setMarking(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Vote Recording</h1>
        <p className="text-sm text-muted-foreground">Mark voters as having voted</p>
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
          </CardContent>
        </Card>
      )}

      {voteResult && (
        <Card className="animate-fade-in mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Vote className="h-5 w-5 text-accent" />
              Voting Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-muted-foreground">Vote Status</dt>
                <dd className="mt-1">
                  <span className={voteResult.status === "Voted" ? "inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success" : "inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"}>
                    {voteResult.status}
                  </span>
                </dd>
              </div>
            </dl>
            {user?.roles.includes("voting_agent") && (
              <div>
                {voteResult.status === "Not Voted" ? (
                  <div className="mt-6 border-t pt-4">
                    <Button onClick={handleMarkAsVoted} disabled={marking} className="h-12 w-full gap-2 sm:w-auto">
                      <Vote className="h-4 w-4" />
                      Mark As Voted
                    </Button>
                  </div>
                  ) : (
                  <div className="mt-3">
                    <Button onClick={handleDeleteVote} disabled={marking} className="h-12 w-full gap-2 sm:w-auto">
                      <Eraser className="h-4 w-4" />
                      Remove Vote
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotePage;
