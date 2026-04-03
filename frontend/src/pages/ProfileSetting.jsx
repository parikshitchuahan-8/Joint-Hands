import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const [profile, setProfile] = useState({});
  const [userId, setUserId] = useState("670bfbf01c2c1c1f22b12345");

  const [newSkill, setNewSkill] = useState({
    SkillName: "",
    Proficiency: "Beginner",
  });

  const [experience, setExperience] = useState({
    Company: "",
    Position: "",
    StartDate: "",
    EndDate: "",
  });

  const [experienceList, setExperienceList] = useState([]);
  const [hasDisability, setHasDisability] = useState("No");

  //  Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v4/profile/user/${userId}`
        );
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setExperienceList(data.profile.experience || []);
          setHasDisability(data.profile.Disability ? "Yes" : "No");
          setShowCard(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // ✅ Save or Update Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const url = profile._id
        ? `${import.meta.env.VITE_API_BASE_URL}/api/v4/profile/${profile._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/v4/prof`;

      const method = profile._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          phone: profile.phone || "",
          location: profile.location || "",
          Disability:
            hasDisability === "Yes" ? profile.Disability || "" : "",
          bio: profile.bio || "",
          Institution: profile.Institution || "",
          Degree: profile.Degree || "",
          date: profile.date || "",
          Company: experience.Company || "",
          Position: experience.Position || "",
          start: experience.StartDate || "",
          SkillName: newSkill.SkillName || "",
          Proficiency: newSkill.Proficiency || "Beginner",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: profile._id
            ? "Profile updated successfully!"
            : "Profile created successfully!",
        });
        setProfile(data.profile || data.updatedProfile);
        setExperienceList(data.profile?.experience || []);
        setShowCard(true);
      }
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Add Skill
  const handleAddSkill = () => {
    if (!newSkill.SkillName) {
      toast({
        title: "Please enter a skill name",
        variant: "destructive",
      });
      return;
    }
    setProfile({
      ...profile,
      SkillName: newSkill.SkillName,
      Proficiency: newSkill.Proficiency,
    });
    toast({
      title: "Skill added temporarily. Save profile to confirm.",
    });
  };

  // ✅ Add Experience
  const handleAddExperience = () => {
    if (!experience.Company || !experience.Position || !experience.StartDate) {
      toast({
        title: "Please fill all required experience fields",
        variant: "destructive",
      });
      return;
    }
    setExperienceList([...experienceList, experience]);
    setExperience({ Company: "", Position: "", StartDate: "", EndDate: "" });
    toast({ title: "Experience added successfully." });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {!showCard ? (
          <Card className="shadow-2xl border border-primary/20 p-6 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold">
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your professional information and preferences
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 text-base h-auto gap-1 p-1">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                </TabsList>

                {/* PERSONAL */}
                <TabsContent value="personal" className="space-y-4 mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={profile.location || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* ✅ Disability Section */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Do you have a disability?</Label>
                      <Select
                        value={hasDisability}
                        onValueChange={(value) => setHasDisability(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {hasDisability === "Yes" && (
                      <div>
                        <Label>Disability Type</Label>
                        <Input
                          value={profile.Disability || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              Disability: e.target.value,
                            })
                          }
                          placeholder="e.g. Hearing Impairment"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={profile.bio || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </TabsContent>

                {/* EDUCATION */}
                <TabsContent value="education" className="space-y-6 mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Institution</Label>
                      <Input
                        value={profile.Institution || ""}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            Institution: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input
                        value={profile.Degree || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, Degree: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Completion Date</Label>
                    <Input
                      type="date"
                      value={profile.date || ""}
                      onChange={(e) =>
                        setProfile({ ...profile, date: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveProfile}>Save Education</Button>
                </TabsContent>

                {/* SKILLS */}
                <TabsContent value="skills" className="space-y-6 mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Skill Name</Label>
                      <Input
                        value={newSkill.SkillName}
                        onChange={(e) =>
                          setNewSkill({
                            ...newSkill,
                            SkillName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Proficiency</Label>
                      <Select
                        value={newSkill.Proficiency}
                        onValueChange={(value) =>
                          setNewSkill({ ...newSkill, Proficiency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddSkill}>Add Skill</Button>
                </TabsContent>

                {/* EXPERIENCE */}
                <TabsContent value="experience" className="space-y-6 mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Company</Label>
                      <Input
                        value={experience.Company}
                        onChange={(e) =>
                          setExperience({
                            ...experience,
                            Company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={experience.Position}
                        onChange={(e) =>
                          setExperience({
                            ...experience,
                            Position: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={experience.StartDate}
                        onChange={(e) =>
                          setExperience({
                            ...experience,
                            StartDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={experience.EndDate}
                        onChange={(e) =>
                          setExperience({
                            ...experience,
                            EndDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddExperience}>
                    Add Experience
                  </Button>

                  <div className="mt-4 space-y-3">
                    {experienceList.map((exp, i) => (
                      <Card
                        key={i}
                        className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-xl shadow"
                      >
                        <p className="font-semibold text-lg text-indigo-700">
                          {exp.Position} @ {exp.Company}
                        </p>
                        <p className="text-sm text-gray-600">
                          {exp.StartDate} - {exp.EndDate || "Present"}
                        </p>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          // ✅ MODERN PROFILE CARD
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl border-none rounded-3xl p-6">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-indigo-700">
                  {profile.Position || "Your Role"}
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {profile.Company || "Company Name"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-800 text-lg">
                <p><strong>📞 Phone:</strong> {profile.phone}</p>
                <p><strong>📍 Location:</strong> {profile.location}</p>
                <p><strong>🧠 Bio:</strong> {profile.bio}</p>
                <p><strong>🎓 Education:</strong> {profile.Degree} at {profile.Institution}</p>
                <p><strong>📅 Completion:</strong> {profile.date}</p>
                <p><strong>♿ Disability:</strong> {profile.Disability || "None"}</p>
                <p><strong>💡 Skill:</strong> {profile.SkillName} ({profile.Proficiency})</p>

                {experienceList.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-xl mb-2 text-indigo-700">
                      Experience
                    </h3>
                    <div className="space-y-3">
                      {experienceList.map((exp, i) => (
                        <div
                          key={i}
                          className="bg-white/60 border border-indigo-100 p-3 rounded-xl"
                        >
                          <p className="font-semibold">
                            {exp.Position} @ {exp.Company}
                          </p>
                          <p className="text-sm text-gray-600">
                            {exp.StartDate} – {exp.EndDate || "Present"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowCard(false)}
                    className="hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    ✏️ Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
