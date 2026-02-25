import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vote, Search, Eraser, Loader2, Drill, Hash, Check, BarChart3 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const VotePage = () => {
  const { user } = useAuth();
  const [oeaNumber, setOeaNumber] = useState("");
  const [ballotBox, setBallotBox] = useState("");
  const [showUpdateBallotBoxForm, setShowUpdateBallotBoxForm] = useState(false);
  const [updatingBallotBox, setUpdatingBallotBox] = useState(false);
  const [successfullyUpdatedBallotBox, setSuccessfullyUpdatedBallotBox] = useState(false);
  const [showVoteCount, setShowVoteCount] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
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
      const response = await fetch(`${API_BASE_URL}/basic-engineer?oea_number=${oeaNumber}`, {
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
        oea_number: data.oea_number,
        branch: data.branch || "N/A",
        ballot_box: data.ballot_box || "N/A",
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

  const fetchBallotBox = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/ballot-box`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setBallotBox(String(data.ballot_box || ""));
    } catch (error) {
      console.error("Failed to fetch ballot box:", error);
    }
  };

  const handleUpdateBallotBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ballotBox.trim()) return;
    setUpdatingBallotBox(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/agent/ballot-box`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
        body: JSON.stringify({ ballot_box: ballotBox }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update ballot box");
      }
      setSuccessfullyUpdatedBallotBox(true);
      setTimeout(() => {
        setSuccessfullyUpdatedBallotBox(false);
        setShowUpdateBallotBoxForm(false);
      }, 3000);
    } catch (err: any) {
      throw err;
    }
    finally {
      setUpdatingBallotBox(false);
    }
  };

  const showUpdateBallotBox = () => {
    fetchBallotBox();
    setShowUpdateBallotBoxForm(true);
  };

  const fetchVoteCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/vote-count`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` },
      });
      const data = await response.json();
      setVoteCount(data.vote_count);
    } catch (error) {
      console.error("Failed to fetch vote count:", error);
      alert("Failed to fetch vote count. Please try again.");
    }
  };

  const showVoteCountUI = () => {
    fetchVoteCount();
    setShowVoteCount(true);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Vote Recording</h1>
        <p className="text-sm text-muted-foreground">Mark voters as having voted</p>
      </div>
      <Card className="mb-5">
        <CardContent className="p-4">
          {successfullyUpdatedBallotBox && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Ballot box updated successfully!</p>
                </div>
              </div>
            </div>
          )}
          { showUpdateBallotBoxForm ? (
            <form onSubmit={handleUpdateBallotBox} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Vote className="h-4 w-4" />
                Ballot Box
              </div>
              <Input
                type="number"
                placeholder="Enter ballot box you're operating on..."
                value={ballotBox}
                onChange={(e) => setBallotBox(e.target.value)}
                maxLength={10}
                className="h-12 flex-1 text-base"
              />
              <Button type="submit" disabled={updatingBallotBox || !ballotBox.trim()} className="h-12 sm:w-auto">
                {updatingBallotBox ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
                Update Ballot Box
              </Button>
              <Button onClick={() => setShowUpdateBallotBoxForm(false)} variant="outline" className="h-12 sm:w-auto">
                Cancel
              </Button>
            </form>
          ) : (
            <Button onClick={showUpdateBallotBox} className="mb-5 h-12 w-full">
              <Vote className="h-4 w-4" />
              Update Your Ballot Box Number
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardContent className="p-4">
          { showVoteCount ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">You have recorded {voteCount} votes so far.</p>
              <Button onClick={() => setShowVoteCount(false)} variant="outline" size="sm">
                Hide Vote Count
              </Button>
            </div>
          ) : (
            <Button onClick={showVoteCountUI} className="h-12 w-full">
              <BarChart3 className="h-4 w-4" />
              Show Vote Count
            </Button>
          )}
        </CardContent>
      </Card>

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
              Engineer Basic Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-foreground">{result.name}</dd>
              </div>
               <div>
                <dt className="font-medium text-muted-foreground">Ballot Box</dt>
                <dd className="mt-1 text-foreground"><span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-sm font-large text-accent">{result.ballot_box}</span></dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">OEA Number</dt>
                <dd className="mt-1 text-foreground">{result.oea_number}</dd>
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
                  <div className="mt-6 border-t pt-4">
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
